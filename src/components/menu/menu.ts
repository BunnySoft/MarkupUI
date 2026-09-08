import { createMenuKeyboard, menuEntryAvailable } from "../dropdown/keyboard.js"
import { ownedWrites } from "../popover/position.js"

export type MenuMode = "vertical" | "horizontal"
export interface MenuOptions {
  mode?: MenuMode
  value?: string | null
  defaultValue?: string | null
  expandedKeys?: readonly string[]
  defaultExpandedKeys?: readonly string[]
  defaultExpandAll?: boolean
  collapsed?: boolean
  accordion?: boolean
  typeaheadDuration?: number
}
export interface MenuSelection {
  key: string
  item: HTMLElement
  path: readonly string[]
  event: MouseEvent
}
export interface MenuController {
  readonly connected: boolean
  readonly collapsible: boolean
  value: string | null
  expandedKeys: readonly string[]
  collapsed: boolean
  mode: MenuMode
  accordion: boolean
  showOption(key?: string): boolean
  refresh(): void
  connect(): void
  disconnect(): void
}
interface Entry {
  key: string
  element: HTMLElement
  details: HTMLDetailsElement | null
  parent: Entry | null
  list: HTMLElement
  label: string
}
interface Level {
  list: HTMLElement
  entries: Entry[]
  keyboard: ReturnType<typeof createMenuKeyboard>
}
const owners = new WeakMap<HTMLElement, MenuController>()
const allowed = new Set(["mode", "value", "defaultValue", "expandedKeys", "defaultExpandedKeys",
  "defaultExpandAll", "collapsed", "accordion", "typeaheadDuration"])
const interactive = "a, area, button, input, select, textarea, label, details, summary, iframe, object, embed, audio[controls], video[controls], [contenteditable]:not([contenteditable=false])"

export function createMenu(root: HTMLElement, options: MenuOptions = {}): MenuController {
  const document = root?.ownerDocument
  const view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || root.localName !== "nav"
    || !root.hasAttribute("data-menu") || !root.classList.contains("mui-menu")) throw new TypeError("Menu requires an authored nav.mui-menu[data-menu].")
  for (const key of Object.keys(options)) if (!allowed.has(key)) throw new TypeError(`Unsupported Menu option: ${key}.`)
  let mode = options.mode ?? root.getAttribute("data-menu-mode") ?? "vertical"
  let value = options.value !== undefined ? options.value : options.defaultValue ?? null
  let accordion = options.accordion ?? false
  const duration = options.typeaheadDuration ?? 500
  if (!["vertical", "horizontal"].includes(mode) || value !== null && typeof value !== "string") throw new TypeError("Menu mode/value must use native mode and string/null keys.")
  for (const flag of [options.accordion, options.collapsed, options.defaultExpandAll]) {
    if (flag !== undefined && typeof flag !== "boolean") throw new TypeError("Menu flags must be boolean.")
  }
  if (!Number.isFinite(duration) || duration < 0 || duration > 60_000) throw new RangeError("Menu typeahead duration must be finite from 0 to 60000.")
  const groupName = `mui-menu-${Math.random().toString(36).slice(2)}`
  let connected = false
  let initialized = false
  let generation = 0
  let entries: Entry[] = []
  let levels: Level[] = []
  let collapse: HTMLDetailsElement | null = null
  let lastFocused: HTMLElement | null = null
  const writes = ownedWrites()
  const selected = ownedWrites()
  const names = ownedWrites()
  const removers: (() => void)[] = []
  const tasks = new Set<number>()
  const own = (node: Element) => node.closest("[data-menu]") === root
  const query = (selector: string) => [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
  const available = (node: HTMLElement) => root.isConnected && view!.getComputedStyle(root).display !== "none" && menuEntryAvailable(node, root)
  function label(node: HTMLElement): string {
    const ids = node.getAttribute("aria-labelledby")?.trim().split(/\s+/)
    const text = ids?.map(id => document!.getElementById(id)?.textContent?.trim() ?? "")
    if (text?.some(part => !part)) throw new TypeError("Menu label references must resolve.")
    return (node.getAttribute("data-menu-label") ?? (text ? text.join(" ") : null)
      ?? node.getAttribute("aria-label") ?? node.textContent ?? "").trim()
  }
  function named(node: HTMLElement) {
    if (!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim()) || !label(node)) {
      throw new TypeError("Menu navigation/groups require explicit names.")
    }
  }
  function listen(target: EventTarget, type: string, fn: EventListener) {
    target.addEventListener(type, fn)
    removers.push(() => target.removeEventListener(type, fn))
  }
  function queue(fn: () => void) {
    const current = generation
    const timer = view!.setTimeout(() => {
      tasks.delete(timer)
      if (connected && current === generation) fn()
    }, 0)
    tasks.add(timer)
  }
  function focus(node: HTMLElement | undefined | null) {
    if (node && document!.hasFocus() && available(node)) node.focus({ preventScroll: true })
  }
  function paint() {
    selected.restore()
    for (const entry of entries) selected.attr(entry.element, "data-menu-selected", entry.key === value ? "" : null)
  }
  function keys(input: readonly string[]) {
    if (!Array.isArray(input) || input.some(key => typeof key !== "string") || new Set(input).size !== input.length) throw new TypeError("expandedKeys must be unique string keys.")
    const branches = input.map(key => {
      const entry = entries.find(entry => entry.key === key && entry.details)
      if (!entry) throw new RangeError(`Unknown Menu branch: ${key}.`)
      if (entry.details!.closest("[hidden], [inert]")) throw new RangeError("Cannot expand a hidden or inert Menu branch.")
      return entry
    })
    if (accordion && branches.filter(entry => !entry.parent).length > 1) throw new RangeError("Accordion allows one expanded root branch.")
    return new Set(branches.map(entry => entry.details!))
  }
  function closePeers(entry: Entry) {
    if (accordion && !entry.parent && entry.details?.open) {
      for (const other of entries) if (!other.parent && other !== entry && other.details) other.details.open = false
    }
  }
  function setOpen(entry: Entry, open: boolean) {
    entry.details!.open = open
    if (open) closePeers(entry)
  }
  function configureAccordion() {
    names.restore()
    if (accordion) {
      const roots = entries.filter(entry => entry.details && !entry.parent)
      const first = roots.find(entry => entry.details!.open)
      for (const entry of roots) {
        if ("name" in view!.HTMLDetailsElement.prototype) names.attr(entry.details!, "name", groupName)
        if (first && entry !== first) entry.details!.open = false
      }
    }
  }
  function recover(previous: Entry | null, fallback = false) {
    if (document!.activeElement !== document!.body
      && !(previous && document!.activeElement === previous.element && !available(previous.element))) return
    for (let parent = previous?.details ? previous : previous?.parent; parent; parent = parent.parent) {
      const current = entries.find(entry => entry.key === parent!.key && entry.details)
      if (current && available(current.element)) { focus(current.element); return }
    }
    if (collapse && available(collapse.firstElementChild as HTMLElement)) focus(collapse.firstElementChild as HTMLElement)
    else if (fallback) focus(entries.find(entry => !entry.parent && available(entry.element))?.element)
  }
  function toggled(details: HTMLDetailsElement) {
    if (!details.open && lastFocused && details.contains(lastFocused) && !available(lastFocused)) {
      if (document!.activeElement === document!.body || document!.activeElement === lastFocused) focus(details.firstElementChild as HTMLElement)
    }
    for (const level of levels) level.keyboard.clear()
  }
  function keydown(event: KeyboardEvent) {
    if (!connected || event.defaultPrevented || event.isComposing || event.keyCode === 229
      || event.altKey || event.ctrlKey || event.metaKey || !(event.target instanceof view!.HTMLElement) || !own(event.target)) return
    const target = event.target
    if (collapse?.open && target === collapse.firstElementChild && event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      collapse.open = false
      return
    }
    if (collapse && target === collapse.firstElementChild && ["ArrowDown", "ArrowUp"].includes(event.key) && !event.shiftKey) {
      event.preventDefault()
      collapse.open = true
      levels[0]?.keyboard.focus(event.key === "ArrowUp" ? "last" : "first")
      return
    }
    const entry = entries.find(entry => entry.element === target)
    if (!entry || !available(target)) return
    const level = levels.find(level => level.list === entry.list)!
    const horizontal = mode === "horizontal" && level === levels[0]
    const forward = view!.getComputedStyle(target).direction === "rtl" ? "ArrowLeft" : "ArrowRight"
    if (event.key === "Escape") {
      const closing = entry.details?.open ? entry : entry.parent
      if (closing) {
        event.preventDefault()
        event.stopPropagation()
        setOpen(closing, false)
        focus(closing.element)
      } else if (collapse?.open) {
        event.preventDefault()
        event.stopPropagation()
        collapse.open = false
        focus(collapse.firstElementChild as HTMLElement)
      }
      return
    }
    if (event.shiftKey && event.key !== "Tab" && event.key.length !== 1) return
    if (horizontal && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault()
      const candidates = level.keyboard.available
      const index = candidates.indexOf(target)
      const next = candidates[(index + (event.key === forward ? 1 : -1) + candidates.length) % candidates.length]
      if (next) level.keyboard.focus(next)
    } else if (entry.details && (horizontal ? ["ArrowDown", "ArrowUp"].includes(event.key) : event.key === forward)) {
      event.preventDefault()
      setOpen(entry, true)
      const child = levels.find(level => level.list.parentElement === entry.details)
      child?.keyboard.focus(event.key === "ArrowUp" ? "last" : "first")
    } else if (!horizontal && ["ArrowLeft", "ArrowRight"].includes(event.key) && event.key !== forward) {
      const closing = entry.details?.open ? entry : entry.parent
      if (closing) {
        event.preventDefault()
        setOpen(closing, false)
        focus(closing.element)
      }
    } else if (!(horizontal && ["ArrowUp", "ArrowDown"].includes(event.key))) level.keyboard.handle(event)
  }
  function click(event: MouseEvent) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    const node = event.target instanceof view!.Element ? event.target.closest<HTMLElement>("[data-menu-item]") : null
    const entry = entries.find(entry => entry.element === node && !entry.details)
    if (!entry) return
    queue(() => {
      const current = entries.find(current => current.key === entry.key && current.element === entry.element && !current.details)
      if (event.defaultPrevented || !current || !available(current.element)) return
      const anchor = current.element instanceof view!.HTMLAnchorElement ? current.element : null
      if (anchor && (anchor.hasAttribute("download") || anchor.target && anchor.target !== "_self")) return
      value = current.key
      paint()
      const path = [current.key]
      for (let parent = current.parent; parent; parent = parent.parent) path.unshift(parent.key)
      root.dispatchEvent(new view!.CustomEvent<MenuSelection>("mui:menu-select", { detail: { key: current.key, item: current.element, path, event } }))
    })
  }
  function parse() {
    if (!root.isConnected || root.getRootNode() !== document || root.closest("mui-menu") || root.isContentEditable
      || root.hasAttribute("contenteditable") && root.getAttribute("contenteditable")?.toLowerCase() !== "false"
      || ![null, "navigation"].includes(root.getAttribute("role"))) throw new TypeError("Menu requires connected light-DOM navigation, not legacy/menu/menubar roles.")
    named(root)
    const folds = query("[data-menu-collapse]")
    if (folds.length > 1 || folds.some(node => !(node instanceof view!.HTMLDetailsElement))) throw new TypeError("Menu allows one native overall collapse disclosure.")
    collapse = folds[0] as HTMLDetailsElement | undefined ?? null
    const lists = query("[data-menu-list]")
    if (collapse && collapse.parentElement !== root) throw new TypeError("Overall Menu disclosure must be a direct navigation child.")
    const roots = lists.filter(list => list.parentElement === root || list.parentElement === collapse)
    if (roots.length !== 1 || lists.some(list => list !== roots[0] && !list.parentElement?.hasAttribute("data-menu-branch"))) throw new TypeError("Menu needs one root list and direct branch child lists.")
    for (const list of [...lists, ...query("[data-menu-group]")]) {
      if (!["ul", "ol"].includes(list.localName) || [...list.children].some(child => !["li", "template"].includes(child.localName))) throw new TypeError("Menu lists/groups need native li wrappers.")
      if (list.hasAttribute("data-menu-group")) named(list)
    }
    const allKeys = new Set<string>()
    for (const node of query("[data-menu-item], [data-menu-branch], [data-menu-group], [data-menu-divider]")) {
      const key = node.getAttribute("data-menu-key")
      if (!key?.trim() || allKeys.has(key)) throw new TypeError("Menu entities need unique nonempty string data-menu-key values.")
      allKeys.add(key)
    }
    for (const divider of query("[data-menu-divider]")) {
      if (divider.localName !== "li" || divider.querySelector(interactive)) throw new TypeError("Menu dividers must be noninteractive li elements.")
    }
    entries = []
    for (const node of query("[data-menu-item], [data-menu-branch]")) {
      const details = node.hasAttribute("data-menu-branch") ? node as HTMLDetailsElement : null
      const element = details ? details.firstElementChild as HTMLElement : node
      const parentNode = node.parentElement?.closest("[data-menu-branch]")
      const parent = parentNode ? entries.find(entry => entry.details === parentNode) ?? null : null
      const list = node.closest<HTMLElement>("[data-menu-list]")
      if (!list || details && (!(details instanceof view!.HTMLDetailsElement) || element?.localName !== "summary"
        || details.hasAttribute("name") || query("[data-menu-list]").filter(list => list.parentElement === details).length !== 1)) throw new TypeError("Menu branches need unnamed details, first summary and one direct child list.")
      if (!details && (!(element instanceof view!.HTMLButtonElement) && !(element instanceof view!.HTMLAnchorElement && element.hasAttribute("href"))
        || element instanceof view!.HTMLButtonElement && element.type !== "button")) throw new TypeError("Menu leaves must be href links or type=button actions.")
      if (!element || !label(element) || element.querySelector(interactive) || element.hasAttribute("popovertarget")
        || element.isContentEditable || element.hasAttribute("contenteditable") && element.getAttribute("contenteditable")?.toLowerCase() !== "false"
        || element.hasAttribute("command") || element.hasAttribute("commandfor")
        || element.getAttribute("aria-disabled") === "true" && !element.matches(":disabled")) throw new TypeError("Menu controls need nonempty native labels and no nested/competing actions.")
      entries.push({ key: node.getAttribute("data-menu-key")!, element, details, parent, list, label: label(element) })
    }
    if (collapse && (collapse.firstElementChild?.localName !== "summary" || !label(collapse.firstElementChild as HTMLElement)
      || collapse.firstElementChild.querySelector(interactive))) throw new TypeError("Overall Menu disclosure needs a named noninteractive summary.")
    for (const node of query("*")) {
      if (node.getAttribute("role") && !["none", "presentation", "img", "navigation"].includes(node.getAttribute("role")!)) throw new TypeError("Menu navigation does not accept widget roles.")
      if (node.localName.includes("-") || node.shadowRoot || ["script", "style", "slot"].includes(node.localName)
        || node.matches(interactive) && !entries.some(entry => entry.element === node || entry.details === node)
          && node !== collapse && node !== collapse?.firstElementChild) throw new TypeError("Menu does not accept arbitrary interactive widgets.")
    }
    levels = [roots[0]!, ...lists.filter(list => list !== roots[0])].map(list => ({ list, entries: entries.filter(entry => entry.list === list), keyboard: createMenuKeyboard(list, duration, false) }))
  }
  const observer = new view.MutationObserver(records => {
    if (!connected) return
    if (!root.isConnected) { controller.disconnect(); return }
    const relevant = records.filter(record => record.target instanceof view!.Element && own(record.target))
    if (accordion) {
      const latest = [...relevant].reverse().find(record => record.attributeName === "open"
        && entries.some(entry => !entry.parent && entry.details === record.target && entry.details.open))
      const entry = latest && entries.find(entry => entry.details === latest.target)
      if (entry) closePeers(entry)
    }
    if (!relevant.some(record => record.type === "childList" || record.attributeName !== "open")) return
    try { controller.refresh() } catch (error) { root.dispatchEvent(new view!.CustomEvent("mui:menu-error", { detail: { error } })) }
  })
  function teardown(preserveTasks = false) {
    connected = false
    if (!preserveTasks) {
      generation++
      for (const timer of tasks) view!.clearTimeout(timer)
      tasks.clear()
    }
    observer.disconnect()
    for (const remove of removers.splice(0)) remove()
    for (const level of levels) level.keyboard.disconnect()
    levels = []
    names.restore()
    selected.restore()
    writes.restore()
    if (owners.get(root) === controller) owners.delete(root)
  }
  function attach() {
    if (owners.has(root)) throw new Error("Menu root already has an active controller.")
    parse()
    if (value !== null && !entries.some(entry => entry.key === value && !entry.details)) {
      if (!initialized) throw new RangeError("Menu value must identify a leaf string key.")
      value = null
    }
    const initial = !initialized
    const initialKeys = initial ? options.expandedKeys ?? (options.defaultExpandAll ? entries.filter(entry => entry.details && !entry.details.closest("[hidden], [inert]")).map(entry => entry.key) : options.defaultExpandedKeys) : undefined
    const expansion = initialKeys === undefined ? null : keys(initialKeys)
    if (initial && options.collapsed !== undefined && !collapse) throw new TypeError("collapsed needs an authored overall disclosure.")
    try {
      owners.set(root, controller)
      connected = true
      writes.attr(root, "data-menu-mode", mode)
      configureAccordion()
      if (expansion) for (const entry of entries) if (entry.details) entry.details.open = expansion.has(entry.details)
      if (initial && options.collapsed !== undefined) collapse!.open = !options.collapsed
      for (const level of levels) {
        level.keyboard.refresh(level.entries.map(entry => ({ element: entry.element, label: entry.label })))
        if (document!.activeElement instanceof view!.HTMLElement) level.keyboard.remember(document!.activeElement)
      }
      paint()
      listen(root, "keydown", event => keydown(event as KeyboardEvent))
      listen(root, "click", event => click(event as MouseEvent))
      listen(root, "focusin", event => {
        if (!(event.target instanceof view!.HTMLElement) || !own(event.target)) return
        lastFocused = event.target
        for (const level of levels) level.keyboard.remember(event.target)
      })
      listen(root, "focusout", event => {
        const related = (event as FocusEvent).relatedTarget
        if (related instanceof view!.Element && !own(related)) lastFocused = null
      })
      listen(document!, "pointerdown", event => { if (!(event.target instanceof view!.Element) || !own(event.target)) lastFocused = null })
      for (const details of [...entries.filter(entry => entry.details).map(entry => entry.details!), ...(collapse ? [collapse] : [])]) listen(details, "toggle", () => toggled(details))
      observer.observe(root, { subtree: true, childList: true, attributes: true,
        attributeFilter: ["open", "hidden", "inert", "disabled", "aria-disabled", "aria-label", "aria-labelledby", "role", "id",
          "data-menu-key", "data-menu-label", "data-menu-item", "data-menu-branch", "data-menu-group", "data-menu-list",
          "href", "target", "download", "type", "popovertarget", "command", "commandfor"] })
      observer.observe(document!, { childList: true, subtree: true })
      initialized = true
    } catch (error) { teardown(); throw error }
  }
  const controller: MenuController = {
    get connected() { return connected },
    get collapsible() { return collapse !== null },
    get value() { return value },
    set value(next) {
      if (next !== null && (typeof next !== "string" || !entries.some(entry => entry.key === next && !entry.details))) throw new RangeError("Menu value must be a leaf string key or null.")
      value = next
      if (connected) paint()
    },
    get expandedKeys() { return entries.filter(entry => entry.details?.open).map(entry => entry.key) },
    set expandedKeys(next) {
      if (!connected) throw new Error("Connect Menu before setting expansion.")
      const expanded = keys(next)
      for (const entry of entries) if (entry.details) entry.details.open = expanded.has(entry.details)
    },
    get collapsed() { return collapse ? !collapse.open : false },
    set collapsed(next) {
      if (typeof next !== "boolean" || !collapse || !connected) throw new TypeError("Collapsed state needs a connected authored disclosure and boolean.")
      collapse.open = !next
    },
    get mode() { return mode as MenuMode },
    set mode(next) {
      if (!["vertical", "horizontal"].includes(next)) throw new TypeError("Menu mode must be vertical or horizontal.")
      mode = next
      if (connected) writes.attr(root, "data-menu-mode", mode)
    },
    get accordion() { return accordion },
    set accordion(next) {
      if (typeof next !== "boolean") throw new TypeError("Accordion must be boolean.")
      accordion = next
      if (connected) configureAccordion()
    },
    showOption(key = value ?? undefined) {
      if (key === undefined) return false
      const entry = entries.find(entry => entry.key === key)
      if (typeof key !== "string" || !entry) throw new RangeError("showOption needs an existing string key.")
      if (!connected || entry.element.closest("[hidden], [inert]")) return false
      if (collapse) collapse.open = true
      const path: Entry[] = []
      for (let parent = entry.parent; parent; parent = parent.parent) path.unshift(parent)
      for (const parent of path) setOpen(parent, true)
      return available(entry.element)
    },
    refresh() {
      if (!connected) throw new Error("Connect Menu before refreshing.")
      const nextMode = root.getAttribute("data-menu-mode") ?? "vertical"
      if (!["vertical", "horizontal"].includes(nextMode)) { controller.disconnect(); throw new TypeError("Menu mode must be vertical or horizontal.") }
      mode = nextMode
      const previous = entries.find(entry => entry.element === lastFocused) ?? null
      const lost = lastFocused && (document!.activeElement === lastFocused || document!.activeElement === document!.body)
        && (!lastFocused.isConnected || !available(lastFocused))
      teardown(true)
      try { attach(); if (lost) recover(previous, true) } catch (error) { teardown(); lastFocused = null; throw error }
    },
    connect() { if (!connected) attach() },
    disconnect() { teardown(); lastFocused = null },
  }
  attach()
  return controller
}
