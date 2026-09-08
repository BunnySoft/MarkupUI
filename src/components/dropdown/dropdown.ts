import { createPopover } from "../popover/popover.js"
import type { PopoverController, PopoverOptions } from "../popover/popover.js"
import { ownedWrites } from "../popover/position.js"
import { createMenuKeyboard, menuEntryAvailable } from "./keyboard.js"

export interface DropdownOptions extends Omit<PopoverOptions, "trigger" | "delay" | "duration"> {
  submenuDelay?: number
  submenuDuration?: number
  typeaheadDuration?: number
  value?: string | null
}
export interface DropdownSelection {
  key: string
  item: HTMLElement
  path: readonly string[]
  event: MouseEvent
}
export interface DropdownController extends PopoverController {
  readonly inline: boolean
  value: string | null
  refresh(): void
}
interface Item {
  element: HTMLElement
  key: string
  label: string
  child: MenuState | null
}
interface MenuState {
  menu: HTMLElement
  trigger: HTMLButtonElement
  parent: MenuState | null
  items: Item[]
  core: PopoverController
  disconnectCore: () => void
  keyboard: ReturnType<typeof createMenuKeyboard>
  timer: number
  intent: "first" | "last" | false | undefined
  requested: "first" | "last" | false | undefined
  space: HTMLAnchorElement | null
  epoch: number
  transition: Event | null
}

const interactive = "a, area, button, input, select, textarea, label, details, summary, iframe, object, embed, audio[controls], video[controls], [tabindex], [contenteditable]:not([contenteditable=false])"
const allowedOptions = new Set(["placement", "gap", "margin", "flip", "disabled", "positioning",
  "submenuDelay", "submenuDuration", "typeaheadDuration", "value"])

export function createDropdown(trigger: HTMLElement, menu: HTMLElement, options: DropdownOptions = {}): DropdownController {
  const document = trigger?.ownerDocument
  const view = document?.defaultView
  if (!view || !(trigger instanceof view.HTMLButtonElement) || trigger.type !== "button"
    || !(menu instanceof view.HTMLElement) || menu.ownerDocument !== document) throw new TypeError("Dropdown needs a native type=button trigger and same-document menu.")
  const rootTrigger = trigger
  for (const key of Object.keys(options)) if (!allowedOptions.has(key)) throw new TypeError(`Unsupported Dropdown option: ${key}.`)
  const delay = options.submenuDelay ?? 100
  const duration = options.submenuDuration ?? 150
  const typeaheadDuration = options.typeaheadDuration ?? 500
  for (const number of [delay, duration, typeaheadDuration]) {
    if (!Number.isFinite(number) || number < 0 || number > 60_000) throw new RangeError("Dropdown timing must be finite between 0 and 60000.")
  }
  let value = options.value ?? null
  if (value !== null && typeof value !== "string") throw new TypeError("Dropdown values are string keys or null.")
  let disabled = options.disabled ?? false
  let connected = false
  let generation = 0
  let states: MenuState[] = []
  let items = new Map<string, Item>()
  let lastFocused: HTMLElement | null = null
  let refreshTimer = 0
  let pendingRefresh = false
  const writes = ownedWrites()
  const selected = ownedWrites()
  const removers: (() => void)[] = []
  const tasks = new Map<number, MenuState>()
  const supported = typeof menu.showPopover === "function" && typeof menu.hidePopover === "function"
  const observer = new view.MutationObserver(() => {
    if (!connected) return
    try { controller.refresh() } catch (error) {
      menu.dispatchEvent(new view!.CustomEvent("mui:dropdown-error", { detail: { error } }))
    }
  })
  function label(node: HTMLElement): string {
    const ids = node.getAttribute("aria-labelledby")
    const references = ids?.trim().split(/\s+/).map(id => document!.getElementById(id)?.textContent?.trim() ?? "")
    if (references?.some(text => !text)) throw new TypeError("Dropdown label references must resolve to nonempty text.")
    return (node.getAttribute("data-dropdown-label") ?? (references ? references.join(" ") : null)
      ?? node.getAttribute("aria-label") ?? node.textContent ?? "").trim()
  }
  function named(node: HTMLElement) {
    if (!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim()) || !label(node)) {
      throw new TypeError("Dropdown menus/groups need an explicit nonempty accessible name.")
    }
  }
  function listen(target: EventTarget, name: string, fn: EventListener, capture = false) {
    target.addEventListener(name, fn, capture)
    removers.push(() => target.removeEventListener(name, fn, capture))
  }
  function queue(fn: () => void, owner = states[0]!) {
    const current = generation
    const epoch = owner.epoch
    const timer = view!.setTimeout(() => {
      tasks.delete(timer)
      if (connected && current === generation && owner.epoch === epoch) fn()
    }, 0)
    tasks.set(timer, owner)
  }
  function cancelTimer(state: MenuState) {
    view!.clearTimeout(state.timer)
    state.timer = 0
  }
  function focusSafe(element: HTMLElement) {
    if (document!.hasFocus() && element.isConnected && !element.matches(":disabled")
      && !element.closest("[hidden], [inert]") && element.getBoundingClientRect().width > 0) element.focus({ preventScroll: true })
  }
  function applyValue() {
    selected.restore()
    for (const item of items.values()) {
      selected.attr(item.element, "data-dropdown-selected", item.key === value ? "" : null)
    }
  }
  function opened(state: MenuState) {
    if (!connected || pendingRefresh || !states.includes(state) || !state.core.connected || !state.core.show) return
    state.keyboard.refresh(state.items.map(item => ({ element: item.element, label: item.label })))
    if (state.intent) state.keyboard.focus(state.intent)
    state.intent = false
  }
  function openState(state: MenuState, edge: "first" | "last" | false = "first") {
    if (!connected || pendingRefresh || disabled || state.parent && !state.parent.core.show) return false
    if (edge === false && states.some(other => other !== state && other.parent === state.parent
      && other.core.show && other.menu.contains(document!.activeElement))) return false
    if (!state.items.some(item => menuEntryAvailable(item.element, state.menu))) return false
    cancelTimer(state)
    state.requested = edge
    const result = state.core.open()
    state.requested = undefined
    if (!connected || pendingRefresh || !states.includes(state) || !state.core.connected) return false
    if (result) {
      state.intent = edge
      opened(state)
    }
    return result
  }
  function closeState(state: MenuState, returnFocus: boolean) {
    const focused = state.menu.contains(document!.activeElement)
    cancelTimer(state)
    state.core.close()
    if (!connected || pendingRefresh || !states.includes(state)) return
    if (returnFocus && (focused || document!.activeElement === document!.body)
      && (document!.activeElement === document!.body || state.menu.contains(document!.activeElement))) focusSafe(state.trigger)
  }
  function owns(state: MenuState, target: EventTarget | null): target is HTMLElement {
    return target instanceof view!.HTMLElement && target.closest("[data-dropdown-menu]") === state.menu
  }
  function keydown(state: MenuState, event: KeyboardEvent) {
    if (!state.core.show || !owns(state, event.target) || event.defaultPrevented || event.isComposing
      || event.keyCode === 229 || event.ctrlKey || event.altKey || event.metaKey) return
    if (event.key === "Tab") {
      for (const current of states) current.keyboard.suspend()
      queue(() => {
        if (!event.defaultPrevented) controller.close()
        else {
          for (const current of states) current.keyboard.refresh(current.items.map(item => ({ element: item.element, label: item.label })))
          if (document!.activeElement instanceof view!.HTMLElement) state.keyboard.remember(document!.activeElement)
        }
      })
      return
    }
    const item = state.items.find(entry => entry.element === event.target)
    if (!item || !menuEntryAvailable(item.element, state.menu)) return
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      let closing = state
      let child: MenuState | undefined
      while ((child = states.find(candidate => candidate.parent === closing && candidate.core.show))) closing = child
      closeState(closing, true)
      return
    }
    if (!event.shiftKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault()
      const forward = view!.getComputedStyle(item.element).direction === "rtl" ? "ArrowLeft" : "ArrowRight"
      if (event.key === forward && item.child) openState(item.child)
      else if (event.key !== forward && state.parent) closeState(state, true)
      return
    }
    if (!event.shiftKey && event.key === " " && item.element instanceof view!.HTMLAnchorElement) {
      event.preventDefault()
      if (!event.repeat) state.space = item.element
      return
    }
    state.space = null
    state.keyboard.handle(event)
  }
  function select(state: MenuState, event: MouseEvent) {
    const target = event.target instanceof view!.Element ? event.target.closest<HTMLElement>("[data-dropdown-item]") : null
    const item = state.items.find(entry => entry.element === target)
    if (!item || item.child || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const anchor = item.element instanceof view!.HTMLAnchorElement ? item.element : null
    if (anchor && (anchor.hasAttribute("download") || anchor.target && anchor.target !== "_self")) return
    queue(() => {
      if (event.defaultPrevented || !item.element.isConnected || disabled
        || !menuEntryAvailable(item.element, state.menu) || supported && !state.core.show) return
      const path = [item.key]
      for (let parent = state; parent.parent; parent = parent.parent) path.unshift(parent.trigger.getAttribute("data-dropdown-key")!)
      value = item.key
      applyValue()
      const focused = menu.contains(document!.activeElement)
      controller.close()
      if (!connected || pendingRefresh || !states.includes(state)) return
      if (focused && (document!.activeElement === document!.body || menu.contains(document!.activeElement))) focusSafe(trigger)
      menu.dispatchEvent(new view!.CustomEvent<DropdownSelection>("mui:dropdown-select", {
        detail: { key: item.key, item: item.element, path, event },
      }))
    }, state)
  }
  function bindState(state: MenuState) {
    listen(state.menu, "beforetoggle", event => {
      if (event.target !== state.menu) return
      state.epoch++
      cancelTimer(state)
      state.keyboard.clear()
      state.space = null
      if ((event as ToggleEvent).newState === "open") {
        state.intent = state.requested ?? "first"
        if (pendingRefresh || disabled || !state.items.some(item => menuEntryAvailable(item.element, state.menu))) event.preventDefault()
      } else {
        state.intent = false
        if (!state.parent) generation++
        for (const [timer, owner] of tasks) {
          if (owner === state || state.menu.contains(owner.trigger)) {
            view!.clearTimeout(timer)
            tasks.delete(timer)
          }
        }
        for (const child of states) if (state.menu.contains(child.trigger)) cancelTimer(child)
      }
    })
    listen(state.menu, "toggle", event => {
      if (event.target === state.menu) { state.transition = null; opened(state) }
    })
    listen(state.menu, "focusin", event => {
      if (owns(state, event.target)) {
        state.keyboard.remember(event.target)
        state.intent = false
        lastFocused = event.target
      }
    })
    listen(state.menu, "keydown", event => keydown(state, event as KeyboardEvent))
    listen(state.menu, "keyup", event => {
      const keyboard = event as KeyboardEvent
      const anchor = state.space
      state.space = null
      if (keyboard.key !== " " || !anchor || keyboard.ctrlKey || keyboard.altKey || keyboard.metaKey || keyboard.shiftKey || keyboard.isComposing || keyboard.keyCode === 229) return
      queue(() => {
        if (!keyboard.defaultPrevented && state.core.show && document!.activeElement === anchor
          && menuEntryAvailable(anchor, state.menu)) anchor.click()
      }, state)
    })
    listen(state.menu, "click", event => select(state, event as MouseEvent))
    if (state.parent) {
      const enter: EventListener = event => {
        if ((event as PointerEvent).pointerType === "touch") return
        cancelTimer(state)
        if (event.currentTarget === state.trigger && !state.core.show && menuEntryAvailable(state.trigger, state.parent!.menu)) {
          state.timer = view!.setTimeout(() => { state.timer = 0; openState(state, false) }, delay)
        }
      }
      const leave: EventListener = event => {
        const related = (event as PointerEvent).relatedTarget
        if ((event as PointerEvent).pointerType === "touch" || related instanceof view!.Node
          && (state.menu.contains(related) || state.trigger.contains(related))) return
        cancelTimer(state)
        if (state.menu.contains(document!.activeElement)) return
        state.timer = view!.setTimeout(() => { state.timer = 0; closeState(state, false) }, duration)
      }
      for (const target of [state.trigger, state.menu]) {
        listen(target, "pointerenter", enter)
        listen(target, "pointerleave", leave)
      }
    }
  }
  function destroy() {
    for (const state of states) {
      if (state.transition?.cancelable && state.transition.eventPhase !== 0) state.transition.preventDefault()
    }
    connected = false
    generation++
    view!.clearTimeout(refreshTimer)
    refreshTimer = 0
    pendingRefresh = false
    observer.disconnect()
    for (const timer of tasks.keys()) view!.clearTimeout(timer)
    tasks.clear()
    for (const remove of removers.splice(0)) remove()
    for (const state of [...states].reverse()) {
      cancelTimer(state)
      state.keyboard.disconnect()
      state.disconnectCore()
    }
    states = []
    lastFocused = null
    items.clear()
    selected.restore()
    writes.restore()
  }
  function build(initial: boolean) {
    if (!trigger.isConnected || !menu.isConnected || menu.getRootNode() !== document
      || !menu.hasAttribute("data-dropdown-menu") || trigger.contains(menu)) throw new TypeError("Dropdown needs connected separate light-DOM trigger/menu anatomy.")
    const menus = [menu, ...menu.querySelectorAll<HTMLElement>("[data-dropdown-menu]")]
    const keys = new Set<string>()
    const records: { menu: HTMLElement; trigger: HTMLButtonElement; elements: HTMLElement[]; labels: string[] }[] = []
    for (const current of menus) {
      if (!["ul", "ol"].includes(current.localName) || !current.classList.contains("mui-dropdown")
        || !current.classList.contains("mui-popover") || current.getAttribute("popover") !== "auto"
        || ![null, "menu"].includes(current.getAttribute("role")) || current.getAttribute("aria-hidden") === "true"
        || current.hasAttribute("aria-modal") || current.isContentEditable
        || current.hasAttribute("contenteditable") && current.getAttribute("contenteditable")?.toLowerCase() !== "false") {
        throw new TypeError("Dropdown needs .mui-popover.mui-dropdown lists with popover=auto.")
      }
      named(current)
      const parent = current.parentElement?.closest<HTMLElement>("[data-dropdown-menu]")
      const candidates = current === menu ? [rootTrigger] : [...parent!.querySelectorAll<HTMLButtonElement>("button[data-dropdown-item][popovertarget]")]
        .filter(button => button.closest("[data-dropdown-menu]") === parent && button.getAttribute("popovertarget") === current.id)
      if (candidates.length !== 1) throw new TypeError("Each submenu needs one owned native popovertarget button.")
      const invoker = candidates[0]!
      if (![null, "menu", "true"].includes(invoker.getAttribute("aria-haspopup"))) throw new TypeError("Dropdown invokers must not claim a different popup role.")
      const elements = [...current.querySelectorAll<HTMLElement>("[data-dropdown-item]")].filter(element => element.closest("[data-dropdown-menu]") === current)
      const labels: string[] = []
      for (const element of elements) {
        const button = element instanceof view!.HTMLButtonElement
        const anchor = element instanceof view!.HTMLAnchorElement && element.hasAttribute("href")
        const key = element.getAttribute("data-dropdown-key")
        if ((!button && !anchor) || button && (element as HTMLButtonElement).type !== "button"
          || !key?.trim() || keys.has(key) || !label(element)
          || element.closest('[aria-hidden="true"]')
          || element.querySelector(interactive)
          || ["command", "commandfor", "autofocus"].some(name => element.hasAttribute(name))) {
          throw new TypeError("Menu items need unique string keys, labels and non-nested native type=button or href actions.")
        }
        if (element.getAttribute("aria-disabled") === "true" && (!button || !(element as HTMLButtonElement).disabled)) {
          throw new TypeError("Disable native buttons; aria-disabled anchors/active controls are not supported.")
        }
        const role = element.getAttribute("role")
        if (role !== null && role !== "menuitem") throw new TypeError("Only command menuitem roles are supported.")
        keys.add(key)
        labels.push(label(element))
      }
      for (const node of current.querySelectorAll<HTMLElement>("*")) {
        if (node.closest("[data-dropdown-menu]") !== current) continue
        const role = node.getAttribute("role")
        const allowedRole = elements.includes(node) ? ["menuitem"] : node.hasAttribute("data-dropdown-group")
          ? ["group"] : node.localName === "li" ? ["none", "presentation", "separator"] : ["none", "presentation", "img"]
        if (node.matches(interactive) && !elements.includes(node)
          || role !== null && !allowedRole.includes(role)
          || node.localName.includes("-") || node.shadowRoot || ["script", "style", "slot"].includes(node.localName)) {
          throw new TypeError("Dropdown content cannot contain arbitrary interactive controls or custom widgets.")
        }
      }
      for (const list of [current, ...current.querySelectorAll<HTMLElement>("[data-dropdown-group]")]) {
        if (list !== current && list.closest("[data-dropdown-menu]") !== current) continue
        if (!["ul", "ol"].includes(list.localName) || [...list.children].some(node => !["li", "template"].includes(node.localName))) {
          throw new TypeError("Menu/group lists require authored li wrappers.")
        }
        if (list !== current) named(list)
      }
      for (const divider of current.querySelectorAll<HTMLElement>("[data-dropdown-divider]")) {
        if (divider.closest("[data-dropdown-menu]") === current
          && (divider.localName !== "li" || divider.querySelector("[data-dropdown-item], [data-dropdown-menu], [data-dropdown-group]"))) {
          throw new TypeError("Dropdown dividers must be noninteractive li separators.")
        }
      }
      records.push({ menu: current, trigger: invoker, elements, labels })
    }
    try {
      for (const record of records) {
        const parent = states.find(state => state.menu === record.trigger.closest("[data-dropdown-menu]")) ?? null
        const core = createPopover(record.trigger, record.menu, {
          ...options,
          disabled,
          placement: parent ? view!.getComputedStyle(record.trigger).direction === "rtl" ? "left-start" : "right-start" : options.placement ?? "bottom",
        })
        const state: MenuState = { menu: record.menu, trigger: record.trigger, parent, core, disconnectCore: core.disconnect,
          items: record.elements.map((element, index) => ({ element, key: element.getAttribute("data-dropdown-key")!, label: record.labels[index]!, child: null })),
          keyboard: createMenuKeyboard(record.menu, typeaheadDuration), timer: 0, intent: false, requested: undefined, space: null, epoch: 0, transition: null }
        states.push(state)
        core.disconnect = () => controller.disconnect()
        for (const item of state.items) items.set(item.key, item)
      }
      for (const state of states) {
        for (const item of state.items) {
          item.child = states.find(child => child.trigger === item.element) ?? null
          if (item.element.hasAttribute("popovertarget") && !item.child) throw new TypeError("Menu item popovertarget must reference an owned submenu.")
        }
        writes.attr(state.menu, "role", supported ? "menu" : null)
        if (supported) {
          writes.attr(state.menu, "tabindex", "-1")
          writes.attr(state.trigger, "aria-haspopup", "menu")
        }
        for (const node of state.menu.querySelectorAll<HTMLElement>("li, [data-dropdown-group]")) {
          if (node.closest("[data-dropdown-menu]") !== state.menu) continue
          writes.attr(node, "role", supported ? node.hasAttribute("data-dropdown-divider") ? "separator" : node.hasAttribute("data-dropdown-group") ? "group" : "none" : null)
        }
        for (const item of state.items) writes.attr(item.element, "role", supported ? "menuitem" : null)
        if (supported) {
          state.keyboard.refresh(state.items.map(item => ({ element: item.element, label: item.label })))
          bindState(state)
        } else listen(state.menu, "click", event => select(state, event as MouseEvent))
      }
      if (value !== null && (!items.has(value) || items.get(value)!.child)) {
        if (initial) throw new RangeError("Dropdown value must identify an existing leaf key.")
        value = null
      }
      connected = true
      applyValue()
      if (supported) listen(document!, "beforetoggle", event => {
        const state = states.find(current => current.menu === event.target)
        if (state) state.transition = event
      }, true)
      if (supported) listen(trigger, "keydown", event => {
        const keyboard = event as KeyboardEvent
        if (keyboard.target !== trigger || keyboard.defaultPrevented || keyboard.isComposing || keyboard.keyCode === 229
          || keyboard.ctrlKey || keyboard.altKey || keyboard.metaKey || keyboard.shiftKey) return
        if (keyboard.key === "ArrowDown" || keyboard.key === "ArrowUp") {
          keyboard.preventDefault()
          openState(states[0]!, keyboard.key === "ArrowUp" ? "last" : "first")
        }
      })
      observer.observe(menu, { subtree: true, childList: true, attributes: true,
        attributeFilter: ["hidden", "inert", "disabled", "aria-disabled", "data-dropdown-key", "data-dropdown-label",
          "href", "target", "download", "popovertarget", "type", "role", "aria-hidden", "aria-modal", "aria-haspopup", "id",
          "aria-label", "aria-labelledby", "contenteditable", "data-dropdown-item", "data-dropdown-menu", "data-dropdown-group", "dir"] })
    } catch (error) { destroy(); throw error }
  }
  const controller: DropdownController = {
    supported,
    get inline() { return !supported },
    get connected() { return connected },
    get show() { return states[0]?.core.show ?? false },
    get value() { return value },
    set value(next) {
      if (next !== null && (typeof next !== "string" || !items.has(next) || items.get(next)!.child)) throw new RangeError("Dropdown value must identify an existing string leaf key or null.")
      value = next
      applyValue()
    },
    get disabled() { return disabled },
    set disabled(next) {
      if (typeof next !== "boolean") throw new TypeError("disabled must be boolean.")
      disabled = next
      for (const state of states) state.core.disabled = next
      if (next) controller.close()
    },
    open: () => connected ? openState(states[0]!) : false,
    close() {
      generation++
      for (const timer of tasks.keys()) view!.clearTimeout(timer)
      tasks.clear()
      for (const state of states) { cancelTimer(state); state.keyboard.clear(); state.space = null }
      states[0]?.core.close()
    },
    setShow(show) {
      if (typeof show !== "boolean") throw new TypeError("setShow requires a boolean.")
      if (show) return controller.open()
      controller.close()
      return false
    },
    syncPosition() {
      if (!connected || !controller.show) return false
      for (const state of states) if (state.core.show) state.core.syncPosition()
      return controller.show
    },
    refresh() {
      if (!connected) throw new Error("Connect Dropdown before refreshing.")
      if (states.some(state => state.transition && state.transition.eventPhase !== 0)) {
        for (const state of states) if (state.transition?.cancelable && state.transition.eventPhase !== 0) state.transition.preventDefault()
        pendingRefresh = true
        if (!refreshTimer) refreshTimer = view!.setTimeout(() => {
          refreshTimer = 0
          if (!connected) return
          try { controller.refresh() } catch (error) {
            menu.dispatchEvent(new view!.CustomEvent("mui:dropdown-error", { detail: { error } }))
          }
        }, 0)
        return
      }
      const lost = controller.show && document!.activeElement === document!.body && lastFocused
        && (!lastFocused.isConnected || !states.some(state => state.items.some(item => item.element === lastFocused)
          && menuEntryAvailable(lastFocused!, state.menu)))
      const focus = menu.contains(document!.activeElement) || !!lost
      destroy()
      try { build(false) } finally {
        if (focus && (document!.activeElement === document!.body || menu.contains(document!.activeElement))) focusSafe(trigger)
      }
    },
    connect() { if (!connected) build(false) },
    disconnect: destroy,
  }
  build(true)
  return controller
}
