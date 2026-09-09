import { createPopover } from "../popover/index.js"
import type { PopoverController, PopoverOptions } from "../popover/index.js"
import { ownedWrites } from "../popover/position.js"
import { createSelect } from "../select/index.js"
import type { SelectController, SelectValue } from "../select/index.js"

export interface PopselectOptions extends Pick<PopoverOptions, "placement" | "gap" | "margin" | "flip" | "positioning"> {
  emptyText?: string
}
export interface PopselectController {
  readonly trigger: HTMLButtonElement
  readonly panel: HTMLElement
  readonly control: HTMLSelectElement
  readonly supported: boolean
  readonly connected: boolean
  readonly error: unknown
  readonly value: SelectValue
  readonly show: boolean
  setValue(value: string | null | readonly string[]): void
  clear(): void
  open(): boolean
  close(): void
  setShow(show: boolean): boolean
  reveal(): boolean
  syncPosition(): boolean
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.popselect.owner")
type Owned = HTMLElement & { [owner]?: object }

/** A native disclosure containing a native list select, not a combobox or menu. */
export function createPopselect(root: HTMLElement, options: PopselectOptions = {}): PopselectController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches(".mui-popselect[data-popselect]")
    || !["div", "section"].includes(root.localName) || (root as Owned)[owner]) throw new TypeError("Use an unowned native div/section.mui-popselect[data-popselect].")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["placement", "gap", "margin", "flip", "positioning", "emptyText"].includes(key))) throw new TypeError("Unsupported Popselect options; use native markup and click disclosure.")
  const emptyText = options.emptyText === undefined ? "None selected" : options.emptyText
  if (typeof emptyText !== "string" || !emptyText || emptyText.length > 256) throw new TypeError("emptyText must be a nonempty string of at most 256 characters.")
  const own = (node: Element) => node.closest("[data-popselect]") === root
  function find(selector: string) { return [...root.querySelectorAll<HTMLElement>(selector)].filter(own) }
  function one(selector: string, required = true) {
    const found = find(selector)
    if (found.length > 1 || required && found.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} ${selector}.`)
    return found[0] ?? null
  }
  const triggerNode = one("[data-popselect-trigger]"), panel = one("[data-popselect-panel]")!, fieldRoot = one("[data-select]")!
  const controlNode = one("[data-select-control]"), doneNode = one("[data-popselect-done]"), readout = one("[data-popselect-value]", false)
  if (!(triggerNode instanceof view.HTMLButtonElement) || !(doneNode instanceof view.HTMLButtonElement)
    || !(controlNode instanceof view.HTMLSelectElement)) throw new TypeError("Popselect needs real trigger/Done buttons and one original native select.")
  const trigger = triggerNode, done = doneNode, control = controlNode, multiple = control.multiple, panelId = panel.id
  const token = {}, writes = ownedWrites()
  const nodes = [root, trigger, panel, fieldRoot, control, done, readout].filter((node): node is HTMLElement => !!node)
  if (new Set(nodes).size !== nodes.length || nodes.some(node => (node as Owned)[owner])) throw new Error("Popselect anatomy must be distinct and unowned.")
  if (panel.hasAttribute("popover") || !trigger.hidden || !done.hidden) throw new TypeError("Author static inline choices with no popover attribute, and hidden enhancement trigger/Done buttons.")
  if (panel.contains(document.activeElement)) throw new Error("Do not hide focused inline choices while binding Popselect.")
  const originalDisabled = trigger.getAttribute("aria-disabled")
  let popup: PopoverController | undefined, field: SelectController | undefined
  let connected = true, initialized = false, error: unknown = null, generation = 0, returnFocus = false, focusedWithin = false
  let observer: MutationObserver | undefined, layoutObserver: MutationObserver | undefined
  let focusTimer = 0
  const tasks = new Set<number>()
  const removers: (() => void)[] = []
  function named(node: HTMLElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => document!.getElementById(id)?.textContent?.trim()))
  }
  function button(node: HTMLButtonElement) {
    return node.getAttribute("type") === "button" && (node.textContent?.trim() || named(node))
      && !node.hasAttribute("role") && !node.hasAttribute("commandfor")
      && !node.closest("label,summary") && !node.querySelector("input,select,textarea,button,a,[tabindex],[contenteditable]")
  }
  function layoutNodes() {
    const result = new Set<HTMLElement>()
    for (const start of [trigger, panel]) for (let node: HTMLElement | null = start; node; node = node.parentElement) result.add(node)
    return result
  }
  function checkZoom() {
    for (const node of layoutNodes()) {
      const zoom = view!.getComputedStyle(node).getPropertyValue("zoom")
      if (zoom && zoom !== "normal" && Number(zoom) !== 1) throw new RangeError("CSS zoom on the popup/trigger context is unsupported. Use inline choices or native browser/visual-viewport zoom.")
    }
  }
  function validate() {
    checkZoom()
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-popselect[data-popselect]") || root.hasAttribute("role")
      || nodes.some(node => node !== root && (!root.contains(node) || !own(node)))
      || nodes.some(node => (node as Owned)[owner] && (node as Owned)[owner] !== token)
      || one("[data-popselect-trigger]") !== trigger || one("[data-popselect-panel]") !== panel
      || one("[data-select]") !== fieldRoot || one("[data-select-control]") !== control || one("[data-popselect-done]") !== done
      || one("[data-popselect-value]", false) !== readout
      || !button(trigger) || !button(done) || trigger.hasAttribute("aria-haspopup")
      || trigger.getAttribute("popovertarget") !== panelId || !["", "toggle"].includes(trigger.getAttribute("popovertargetaction") ?? "")
      || done.getAttribute("popovertarget") !== panelId || done.getAttribute("popovertargetaction") !== "hide"
      || panel.id !== panelId || !panel.classList.contains("mui-popover") || panel.getAttribute("role") !== "region" || !named(panel)
      || panel.hasAttribute("hidden") || !panel.contains(fieldRoot) || !fieldRoot.contains(control) || !panel.contains(done) || panel.contains(trigger)
      || initialized && (panel.getAttribute("popover") !== (popup!.supported ? "auto" : null) || !popup!.connected || !field!.connected)
      || control.multiple !== multiple || control.size < 2 || control.size > 20
      || find("[data-select-filter],[data-select-search]").length
      || readout && (!["span", "p"].includes(readout.localName) || readout.childElementCount || readout.hasAttribute("role")
        || readout.hasAttribute("aria-live") || panel.contains(readout) || readout.closest("button,label,summary"))) {
      throw new TypeError("Keep the original named region/native list-select anatomy (size 2..20), without combobox/menu roles, popup haspopup claims or a second filter surface.")
    }
    if (control.options.length > 2000 || [...control.options].some(option => option.value.length > 256
      || !option.label.trim() || option.label.length > 1024 || option.childElementCount)) throw new TypeError("Use at most 2000 plain native options, string keys <=256 characters and nonempty labels <=1024 characters.")
    if ([...control.querySelectorAll("optgroup")].some(group => group.label.length > 1024)) throw new TypeError("Native group labels must be at most 1024 characters.")
  }
  function disabled() {
    return control.matches(":disabled") || trigger.matches(":disabled") || originalDisabled === "true"
      || !!control.closest("[hidden],[inert]") || !!trigger.closest("[hidden],[inert]")
  }
  function readable(element: HTMLElement = control) {
    if (!element.isConnected || element.getRootNode() !== document || element.closest("[hidden],[inert]")) return false
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      const style = view!.getComputedStyle(node)
      if (style.display === "none" || style.visibility === "hidden") return false
      if (node.localName === "details" && !(node as HTMLDetailsElement).open && !node.firstElementChild?.contains(element)) return false
    }
    return true
  }
  function live() { if (!connected) throw new Error("Popselect is disconnected; native choices remain inline.") }
  function selected() { return [...control.options].filter(option => option.selected) }
  function writeReadout() {
    if (!readout) return
    const options = selected()
    const value = options.length ? options.slice(0, 3).map(option => option.label).join(", ") + (options.length > 3 ? ` (+${options.length - 3})` : "") : emptyText
    if (readout.textContent !== value) readout.textContent = value
  }
  function refresh() {
    live()
    try {
      validate(); field!.refresh()
      popup!.disabled = disabled()
      writes.attr(trigger, "aria-disabled", disabled() ? "true" : originalDisabled)
      writeReadout()
      if (popup!.show) popup!.syncPosition()
      error = null
    } catch (cause) { fail(cause); throw cause }
  }
  function fail(cause: unknown) {
    error = cause; disconnect()
    root.dispatchEvent(new view!.CustomEvent("mui:popselect-error", { bubbles: true, detail: { error: cause } }))
  }
  function observe() {
    observer!.observe(root, {
      subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["disabled", "hidden", "inert", "multiple", "size", "selected", "value", "label", "form",
        "readonly", "required", "type", "role", "id", "popover", "popovertarget", "popovertargetaction", "aria-haspopup"],
    })
    for (let node = root.parentElement; node; node = node.parentElement) observer!.observe(node, { childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"] })
  }
  function changed() {
    if (!connected) return
    try { refresh() } catch { /* refresh already reports the failure and hands off static choices. */ }
  }
  function listen(node: EventTarget, name: string, callback: EventListener, capture = false) {
    node.addEventListener(name, callback, capture)
    removers.push(() => node.removeEventListener(name, callback, capture))
  }
  function beforeToggle(event: Event) {
    if (event.target !== panel || !connected) return
    view!.clearTimeout(focusTimer); focusTimer = 0
    if ((event as ToggleEvent).newState !== "open") {
      returnFocus = panel.contains(document!.activeElement) || document!.activeElement === document!.body && focusedWithin
      focusedWithin = false
      return
    }
    returnFocus = false; focusedWithin = false
    try {
      validate()
      if (disabled()) event.preventDefault()
    } catch (cause) { event.preventDefault(); fail(cause) }
  }
  function toggled(event: Event) {
    if (!connected || event.target !== panel) return
    const recover = returnFocus
    returnFocus = false
    if (recover && !popup!.show && (document!.activeElement === document!.body || panel.contains(document!.activeElement))
      && !trigger.matches(":disabled") && readable(trigger)) {
      trigger.focus({ preventScroll: true })
    }
  }
  function focusOut(event: Event) {
    const target = (event as FocusEvent).relatedTarget
    if (target instanceof view!.Node) { focusedWithin = panel.contains(target); return }
    view!.clearTimeout(focusTimer)
    const stamp = generation
    focusTimer = view!.setTimeout(() => {
      focusTimer = 0
      if (connected && generation === stamp && popup!.show && document!.activeElement === document!.body) focusedWithin = false
    }, 0)
  }
  function disconnect() {
    if (!connected) return
    connected = false; generation++; observer?.disconnect(); layoutObserver?.disconnect()
    view!.clearTimeout(focusTimer); tasks.forEach(timer => view!.clearTimeout(timer)); tasks.clear()
    removers.splice(0).forEach(remove => remove())
    popup?.disconnect()
    field?.disconnect()
    writes.restore()
    for (const node of nodes) if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
  }
  try {
    validate()
    for (const node of nodes) (node as Owned)[owner] = token
    field = createSelect(fieldRoot)
    writes.attr(panel, "popover", "auto")
    const { emptyText: ignored, ...geometry } = options
    popup = createPopover(trigger, panel, { ...geometry, trigger: "click", placement: geometry.placement ?? "bottom-start" })
    initialized = true
    if (popup.supported) { writes.attr(trigger, "hidden", null); writes.attr(done, "hidden", null) }
    if (readout) writes.attr(readout, "hidden", null)
    refresh()
    listen(panel, "beforetoggle", beforeToggle)
    listen(panel, "toggle", toggled)
    listen(panel, "focusin", () => { focusedWithin = true })
    listen(panel, "focusout", focusOut)
    listen(control, "input", changed); listen(control, "change", changed)
    listen(fieldRoot, "mui:select-error", event => fail(new Error((event as CustomEvent<{ message: string }>).detail.message)))
    listen(panel, "mui:popover-error", event => fail((event as CustomEvent<{ error: unknown }>).detail.error))
    listen(document, "reset", event => {
      if (event.target !== control.form) return
      const stamp = generation
      const timer = view!.setTimeout(() => { tasks.delete(timer); if (connected && generation === stamp) changed() }, 0)
      tasks.add(timer)
    }, true)
    observer = new view.MutationObserver(changed); observe()
    layoutObserver = new view.MutationObserver(() => {
      if (!connected) return
      try { checkZoom() } catch (cause) { fail(cause) }
    })
    for (const node of layoutNodes()) layoutObserver.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
  } catch (cause) { disconnect(); throw cause }
  const selection = field, popover = popup
  return {
    trigger, panel, control,
    get supported() { return popover.supported }, get connected() { return connected },
    get error() { return error }, get value() {
      live(); validate()
      const value = selection.value
      return Array.isArray(value) ? selected().map(option => option.value) : value
    },
    get show() { return popover.show },
    setValue(value) {
      refresh()
      try { selection.setValue(value); writeReadout(); if (popover.show) popover.syncPosition(); error = null }
      catch (cause) { error = cause; throw cause }
    },
    clear() {
      refresh(); selection.setValue(multiple ? [] : null); writeReadout()
      if (popover.show) popover.syncPosition()
    },
    open() { refresh(); return popover.open() },
    close() { live(); popover.close() },
    setShow(show) {
      if (typeof show !== "boolean") throw new TypeError("setShow requires a boolean.")
      refresh(); return popover.setShow(show)
    },
    reveal() { refresh(); return popover.supported ? popover.open() && readable() : readable() },
    syncPosition() { refresh(); return popover.syncPosition() },
    refresh, disconnect,
  }
}
