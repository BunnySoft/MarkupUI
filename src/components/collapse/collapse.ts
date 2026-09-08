import { ownedWrites } from "../popover/position.js"

export type CollapseNames = string | readonly string[] | null
export interface CollapseOptions {
  accordion?: boolean
  expandedNames?: CollapseNames
  defaultExpandedNames?: CollapseNames
}
export interface CollapseHeaderClick {
  name: string
  expanded: boolean
  item: HTMLDetailsElement
  event: MouseEvent
}
export interface CollapseChange {
  expandedNames: readonly string[]
  name: string
  expanded: boolean
  item: HTMLDetailsElement
  event: Event
}
export interface CollapseController {
  readonly connected: boolean
  readonly nativeExclusive: boolean
  expandedNames: CollapseNames
  accordion: boolean
  setDisabled(name: string, disabled: boolean): void
  refresh(): void
  connect(): void
  disconnect(): void
}
interface Item {
  name: string
  details: HTMLDetailsElement
  summary: HTMLElement
  content: HTMLElement
}
interface ItemOwner {
  root: HTMLElement
  summary: HTMLElement
  names: ReturnType<typeof ownedWrites>
  attributes: ReturnType<typeof ownedWrites>
  disabledValue: string | null
}
const owners = new WeakMap<HTMLElement, CollapseController>()
const itemOwners = new WeakMap<HTMLDetailsElement, ItemOwner>()
let sequence = 0
const interactive = "a, area, button, input, select, textarea, label, details, summary, iframe, object, embed, [tabindex], [contenteditable]:not([contenteditable=false])"

export function createCollapse(root: HTMLElement, options: CollapseOptions = {}): CollapseController {
  const document = root?.ownerDocument
  const view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !["div", "section"].includes(root.localName)
    || !root.matches(".mui-collapse[data-collapse]")) throw new TypeError("Collapse requires an authored div/section.mui-collapse[data-collapse].")
  for (const key of Object.keys(options)) {
    if (!["accordion", "expandedNames", "defaultExpandedNames"].includes(key)) throw new TypeError(`Unsupported Collapse option: ${key}.`)
  }
  let accordion = options.accordion ?? false
  if (typeof accordion !== "boolean") throw new TypeError("Collapse accordion must be boolean.")
  const nativeExclusive = "name" in view.HTMLDetailsElement.prototype
  const name = `mui-collapse-${++sequence}-${Math.random().toString(36).slice(2)}`
  let connected = false
  let initialized = false
  let generation = 0
  let items: Item[] = []
  let lastFocused: HTMLElement | null = null
  const ownedItems = new Map<HTMLDetailsElement, ItemOwner>()
  const attributes = ownedWrites()
  const removers: (() => void)[] = []
  const tasks = new Set<number>()
  const own = (node: Element) => node.closest("[data-collapse]") === root
  function disabled(item: Item) { return item.details.hasAttribute("data-collapse-disabled") }
  function query(selector: string) { return [...root.querySelectorAll<HTMLElement>(selector)].filter(own) }
  function named(summary: HTMLElement) {
    const refs = summary.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean)
    return refs?.length ? refs.every(id => document!.getElementById(id)?.textContent?.trim())
      : !!(summary.getAttribute("aria-label")?.trim() || summary.textContent?.trim())
  }
  function visible(element: HTMLElement) {
    if (!element.isConnected || element.closest("[hidden], [inert]")) return false
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      if (node.localName === "details" && !(node as HTMLDetailsElement).open
        && !node.firstElementChild?.contains(element)) return false
      const style = view!.getComputedStyle(node)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function focus(summary: HTMLElement | undefined) {
    if (connected && summary && document!.hasFocus() && visible(summary)) summary.focus({ preventScroll: true })
  }
  function readNames(input: CollapseNames): string[] {
    const values = input === null ? [] : typeof input === "string" ? [input] : input
    if (!Array.isArray(values) || values.some(key => typeof key !== "string") || new Set(values).size !== values.length) throw new TypeError("Collapse names must be a string, unique string array or null.")
    if (accordion && values.length > 1) throw new RangeError("Accordion allows only one expanded name.")
    for (const key of values) if (!items.some(item => item.name === key && own(item.details))) throw new RangeError(`Unknown Collapse item: ${key}.`)
    return [...values]
  }
  function selectNames(input: CollapseNames) {
    const values = new Set(readNames(input))
    for (const item of items) if (own(item.details)) item.details.open = values.has(item.name)
  }
  function exclusive(active?: Item) {
    if (!accordion) return
    const keep = active ?? items.find(item => own(item.details) && item.details.open)
    if (keep) for (const item of items) if (item !== keep && own(item.details)) item.details.open = false
  }
  function decorate() {
    for (const [details, owner] of ownedItems) {
      if (owner.root !== root) ownedItems.delete(details)
      else if (!own(details) || !items.some(item => item.details === details)) {
        owner.names.restore()
        owner.attributes.restore()
        ownedItems.delete(details)
        if (itemOwners.get(details) === owner) itemOwners.delete(details)
      }
    }
    attributes.restore()
    attributes.attr(root, "data-collapse-enhanced", "")
    for (const item of items) {
      if (!own(item.details)) continue
      let owner = itemOwners.get(item.details)
      if (owner && owner.summary !== item.summary) {
        owner.attributes.restore()
        owner.attributes = ownedWrites()
        owner.summary = item.summary
        owner.disabledValue = null
      }
      if (!owner) owner = { root, summary: item.summary, names: ownedWrites(), attributes: ownedWrites(), disabledValue: null }
      owner.root = root
      ownedItems.set(item.details, owner)
      itemOwners.set(item.details, owner)
      owner.names.attr(item.details, "name", accordion && nativeExclusive ? name : null)
      owner.disabledValue = disabled(item) ? "true" : null
      owner.attributes.attr(item.summary, "aria-disabled", owner.disabledValue)
    }
    exclusive()
  }
  function listen(target: EventTarget, type: string, fn: EventListener, capture = false) {
    target.addEventListener(type, fn, capture)
    removers.push(() => target.removeEventListener(type, fn, capture))
  }
  function queue(fn: () => void) {
    const current = generation
    const timer = view!.setTimeout(() => {
      tasks.delete(timer)
      if (connected && generation === current) fn()
    }, 0)
    tasks.add(timer)
  }
  function find(item: Item) {
    if (!own(item.details)) return undefined
    return items.find(current => current.details === item.details && current.summary === item.summary
      && current.name === item.name && current.details.getAttribute("data-collapse-key") === item.name)
  }
  function clicked(event: MouseEvent) {
    if (!(event.target instanceof view!.Element)) return
    const summary = event.target.closest("summary")
    const details = summary?.parentElement
    if (details?.hasAttribute("data-collapse-item") && own(details) && details.hasAttribute("data-collapse-disabled")) {
      event.preventDefault()
      return
    }
    const item = items.find(item => item.summary === summary)
    if (!item) return
    if (disabled(item)) { event.preventDefault(); return }
    if (event.button !== 0) return
    queue(() => {
      const current = find(item)
      if (!current || event.defaultPrevented || disabled(current) || !current.details.isConnected) return
      root.dispatchEvent(new view!.CustomEvent<CollapseHeaderClick>("mui:collapse-header-click", {
        detail: { name: current.name, expanded: current.details.open, item: current.details, event },
      }))
    })
  }
  function toggled(item: Item, event: Event) {
    const current = find(item)
    if (!connected || !current || event.target !== current.details) return
    if (!current.details.open && lastFocused && current.content.contains(lastFocused)
      && (document!.activeElement === lastFocused || document!.activeElement === document!.body)) focus(current.summary)
    if (connected && find(current)) root.dispatchEvent(new view!.CustomEvent<CollapseChange>("mui:collapse-change", {
      detail: { expandedNames: items.filter(item => item.details.open).map(item => item.name),
        name: current.name, expanded: current.details.open, item: current.details, event },
    }))
  }
  function parse() {
    if (!root.isConnected || root.getRootNode() !== document || root.closest("mui-accordion-item")) throw new TypeError("Collapse needs connected light-DOM native anatomy, not legacy accordion ownership.")
    const seen = new Set<string>()
    items = query("[data-collapse-item]").map(node => {
      const key = node.getAttribute("data-collapse-key")
      const summary = node.firstElementChild as HTMLElement | null
      const content = [...node.children].filter(child => child.hasAttribute("data-collapse-content"))
      const parentItem = node.parentElement?.closest("[data-collapse-item]")
      if (!(node instanceof view!.HTMLDetailsElement) || !key?.trim() || seen.has(key)
        || parentItem && own(parentItem) || summary?.localName !== "summary" || content.length !== 1
        || content[0] === summary || summary.isContentEditable
        || summary.hasAttribute("contenteditable") && summary.getAttribute("contenteditable")?.toLowerCase() !== "false"
        || !named(summary) || summary.querySelector(interactive)) throw new TypeError("Collapse items need unique string keys, a first native summary and one direct content region; nested items need their own group.")
      const previous = itemOwners.get(node)
      const managedDisabled = previous?.summary === summary && previous.disabledValue === summary.getAttribute("aria-disabled")
      if (![null, "button"].includes(summary.getAttribute("role")) || summary.hasAttribute("aria-expanded")
        || summary.hidden || summary.hasAttribute("inert") || summary.getAttribute("aria-hidden") === "true"
        || summary.hasAttribute("aria-disabled") && !managedDisabled) throw new TypeError("Native summary owns expanded semantics; use the disabled item marker, not authored aria-disabled.")
      for (const child of summary.querySelectorAll<HTMLElement>("*")) {
        const role = child.getAttribute("role")
        if (child.localName.includes("-") || child.shadowRoot || ["script", "style", "slot"].includes(child.localName)
          || role !== null && !["none", "presentation", "img"].includes(role)) throw new TypeError("Collapse summary content must be noninteractive native markup.")
      }
      const arrow = summary.querySelector("[data-collapse-arrow]")
      if (arrow && arrow.getAttribute("aria-hidden") !== "true") throw new TypeError("Authored collapse arrows must be explicitly decorative.")
      seen.add(key)
      return { name: key, details: node, summary, content: content[0] as HTMLElement }
    })
    for (const extra of query("[data-collapse-extra]")) {
      const item = extra.parentElement?.querySelector(":scope > [data-collapse-item]")
      const ancestor = extra.closest("[data-collapse-item]")
      if (!item || extra.closest("summary") || ancestor && own(ancestor)) throw new TypeError("Header extra actions must be siblings outside native details/summary.")
      for (const button of [...extra.querySelectorAll("button"), ...(extra instanceof view!.HTMLButtonElement ? [extra] : [])]) {
        if (!["button", "submit", "reset"].includes(button.getAttribute("type")?.toLowerCase() ?? "")) throw new TypeError("Header extra buttons require an explicit native type.")
      }
    }
  }
  const observer = new view.MutationObserver(records => {
    if (!connected) return
    if (!root.isConnected) { controller.disconnect(); return }
    const relevant = records.filter(record => record.target instanceof view!.Element && own(record.target))
    if (accordion) {
      const latest = [...relevant].reverse().find(record => record.attributeName === "open"
        && items.some(item => item.details === record.target && item.details.open))
      const item = latest && items.find(item => item.details === latest.target)
      if (item) exclusive(item)
    }
    if (!relevant.some(record => record.type === "childList" || record.attributeName !== "open")) return
    try { controller.refresh() } catch (error) { root.dispatchEvent(new view!.CustomEvent("mui:collapse-error", { detail: { error } })) }
  })
  function teardown(preserveTasks = false) {
    connected = false
    observer.disconnect()
    if (!preserveTasks) {
      generation++
      for (const timer of tasks) view!.clearTimeout(timer)
      tasks.clear()
    }
    for (const remove of removers.splice(0)) remove()
    if (!preserveTasks) {
      for (const [details, owner] of ownedItems) if (owner.root === root) {
        owner.names.restore()
        owner.attributes.restore()
        if (itemOwners.get(details) === owner) itemOwners.delete(details)
      }
      ownedItems.clear()
    }
    attributes.restore()
    if (owners.get(root) === controller) owners.delete(root)
  }
  function attach() {
    if (owners.has(root)) throw new Error("Collapse group already has an active controller.")
    parse()
    const initial = initialized ? undefined : options.expandedNames !== undefined ? options.expandedNames : options.defaultExpandedNames
    if (initial !== undefined) readNames(initial)
    try {
      owners.set(root, controller)
      connected = true
      if (document!.activeElement instanceof view!.HTMLElement && items.some(item => item.details.contains(document!.activeElement))) lastFocused = document!.activeElement
      decorate()
      if (initial !== undefined) selectNames(initial)
      listen(root, "click", event => clicked(event as MouseEvent), true)
      listen(root, "focusin", event => {
        if (event.target instanceof view!.HTMLElement && items.some(item => item.details.contains(event.target as Node))) lastFocused = event.target
      })
      listen(root, "focusout", event => {
        const next = (event as FocusEvent).relatedTarget
        if (next instanceof view!.Element && !root.contains(next)) lastFocused = null
      })
      listen(document!, "pointerdown", event => { if (!(event.target instanceof view!.Node) || !root.contains(event.target)) lastFocused = null })
      for (const item of items) listen(item.details, "toggle", event => toggled(item, event))
      observer.observe(root, { subtree: true, childList: true, attributes: true,
        attributeFilter: ["open", "data-collapse-item", "data-collapse-key", "data-collapse-content", "data-collapse-disabled",
          "aria-label", "aria-labelledby", "aria-expanded", "role", "type", "hidden", "inert"] })
      observer.observe(document!, { subtree: true, childList: true })
      initialized = true
    } catch (error) { teardown(); throw error }
  }
  const controller: CollapseController = {
    get connected() { return connected },
    nativeExclusive,
    get expandedNames() { return items.filter(item => own(item.details) && item.details.open).map(item => item.name) },
    set expandedNames(value) {
      if (!connected) throw new Error("Connect Collapse before requesting expansion.")
      selectNames(value)
    },
    get accordion() { return accordion },
    set accordion(value) {
      if (typeof value !== "boolean") throw new TypeError("Collapse accordion must be boolean.")
      accordion = value
      if (connected) decorate()
    },
    setDisabled(key, value) {
      const item = items.find(item => item.name === key && own(item.details))
      if (!connected || !item || typeof value !== "boolean") throw new TypeError("setDisabled requires a connected item key and boolean.")
      item.details.toggleAttribute("data-collapse-disabled", value)
      const owner = ownedItems.get(item.details)!
      owner.disabledValue = value ? "true" : null
      owner.attributes.attr(item.summary, "aria-disabled", owner.disabledValue)
    },
    refresh() {
      if (!connected) throw new Error("Connect Collapse before refreshing.")
      const lost = lastFocused && !visible(lastFocused)
      const old = items.find(item => item.details.contains(lastFocused) || item.summary === lastFocused)
      teardown(true)
      try {
        attach()
        if (lost && document!.activeElement === document!.body) focus(items.find(item => item.name === old?.name)?.summary ?? items[0]?.summary)
      } catch (error) { teardown(); lastFocused = null; throw error }
    },
    connect() { if (!connected) attach() },
    disconnect() { teardown(); lastFocused = null },
  }
  attach()
  return controller
}
