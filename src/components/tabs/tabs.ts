import { ownedWrites } from "../popover/position.js"

export type TabsPlacement = "top" | "bottom" | "left" | "right" | "start" | "end"
export type TabsActivation = "automatic" | "manual"
export type TabsGuard = (next: string, previous: string | null) => boolean | PromiseLike<boolean>
export interface TabsOptions {
  value?: string | null
  defaultValue?: string | null
  activation?: TabsActivation
  placement?: TabsPlacement
  centerActiveTab?: boolean
  beforeLeave?: TabsGuard
}
export interface TabsChange {
  value: string
  previous: string | null
  tab: HTMLButtonElement
  panel: HTMLElement
  event: Event
}
export interface TabsController {
  readonly connected: boolean
  readonly pending: string | null
  readonly lastRequest: Promise<boolean> | null
  value: string | null
  activation: TabsActivation
  placement: TabsPlacement
  select(key: string): Promise<boolean>
  scrollToCurrentTab(): boolean
  refresh(): void
  connect(): void
  disconnect(): void
}
interface Pair {
  key: string
  tab: HTMLButtonElement
  panel: HTMLElement
  tabId: string
  panelId: string
}
interface Request {
  id: number
  lifetime: number
  pair: Pair
  previous: string | null
  promise?: Promise<boolean>
  running?: boolean
}
const owners = new WeakMap<HTMLElement, TabsController>()
const placements = ["top", "bottom", "left", "right", "start", "end"]
const interactive = "a, area, button, input, select, textarea, label, details, summary, iframe, object, embed, [tabindex], [contenteditable]:not([contenteditable=false])"

export function createTabs(root: HTMLElement, options: TabsOptions = {}): TabsController {
  const document = root?.ownerDocument
  const view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches(".mui-tabs[data-tabs]")) throw new TypeError("Tabs requires an authored .mui-tabs[data-tabs] root.")
  const allowed = ["value", "defaultValue", "activation", "placement", "centerActiveTab", "beforeLeave"]
  for (const key of Object.keys(options)) if (!allowed.includes(key)) throw new TypeError(`Unsupported Tabs option: ${key}.`)
  let placement = options.placement ?? root.getAttribute("data-tabs-placement") ?? "top"
  let activation = options.activation ?? "automatic"
  let value = options.value !== undefined ? options.value : options.defaultValue ?? null
  if (!placements.includes(placement) || !["automatic", "manual"].includes(activation)
    || value !== null && typeof value !== "string") throw new TypeError("Invalid Tabs placement, activation or string/null value.")
  if (options.centerActiveTab !== undefined && typeof options.centerActiveTab !== "boolean"
    || options.beforeLeave !== undefined && typeof options.beforeLeave !== "function") throw new TypeError("Invalid Tabs center/guard option.")
  const guard = options.beforeLeave
  const center = options.centerActiveTab ?? false
  const own = (node: Element) => node.closest("[data-tabs]") === root
  const query = (selector: string) => [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
  let connected = false
  let initialized = false
  let lifetime = 0
  let requestId = 0
  let pairs: Pair[] = []
  let list!: HTMLElement
  let wrapper!: HTMLElement
  let empty!: HTMLElement
  let status!: HTMLElement
  let errorRegion!: HTMLElement
  let focusedKey: string | null = null
  let lastFocused: HTMLElement | null = null
  let pending: Request | null = null
  let lastRequest: Promise<boolean> | null = null
  let failure: { error: unknown } | null = null
  const structure = ownedWrites()
  const transient = ownedWrites()
  const removers: (() => void)[] = []
  const tasks = new Set<number>()
  function one(selector: string) {
    const nodes = query(selector)
    if (nodes.length !== 1) throw new TypeError(`Tabs needs exactly one owned ${selector}.`)
    return nodes[0]!
  }
  function named(node: HTMLElement) {
    const refs = node.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean)
    return refs?.length ? refs.every(id => document!.getElementById(id)?.textContent?.trim())
      : !!(node.getAttribute("aria-label")?.trim() || node.textContent?.trim())
  }
  function uniqueId(node: HTMLElement) {
    return !!node.id && !/\s/.test(node.id) && document!.getElementById(node.id) === node
      && [...document!.querySelectorAll("[id]")].filter(other => other.id === node.id).length === 1
  }
  // Logical eligibility ignores outer inactive tabsets; their inner selection must survive.
  function eligible(pair: Pair) {
    if (!pair.tab.isConnected || !pair.panel.isConnected || pair.tab.matches(":disabled")) return false
    for (let node: HTMLElement | null = pair.tab; node && node !== root; node = node.parentElement) {
      const style = view!.getComputedStyle(node)
      if (node.hidden || node.hasAttribute("inert") || style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function safeFocus(node: HTMLElement | null | undefined) {
    if (connected && node?.isConnected && document!.hasFocus() && !node.matches(":disabled")
      && !node.closest("[hidden], [inert]") && node.getBoundingClientRect().width > 0) node.focus({ preventScroll: true })
  }
  function listen(target: EventTarget, type: string, fn: EventListener, capture = false) {
    target.addEventListener(type, fn, capture)
    removers.push(() => target.removeEventListener(type, fn, capture))
  }
  function queue(fn: () => void) {
    const current = lifetime
    const timer = view!.setTimeout(() => {
      tasks.delete(timer)
      if (connected && lifetime === current) fn()
    }, 0)
    tasks.add(timer)
  }
  function rove() {
    const candidates = pairs.filter(eligible)
    if (!candidates.some(pair => pair.key === focusedKey)) focusedKey = candidates.find(pair => pair.key === value)?.key ?? candidates[0]?.key ?? null
    for (const pair of pairs) structure.attr(pair.tab, "tabindex", pair.key === focusedKey && eligible(pair) ? "0" : "-1")
  }
  function paint() {
    structure.attr(root, "data-tabs-enhanced", "")
    structure.attr(root, "data-tabs-placement", placement)
    structure.attr(list, "role", "tablist")
    structure.attr(list, "tabindex", "-1")
    structure.attr(list, "aria-orientation", ["top", "bottom"].includes(placement) ? "horizontal" : "vertical")
    for (const pair of pairs) {
      structure.attr(pair.tab, "role", "tab")
      structure.attr(pair.tab, "aria-controls", pair.panelId)
      structure.attr(pair.tab, "aria-selected", String(pair.key === value))
      structure.attr(pair.panel, "role", "tabpanel")
      const labels = pair.panel.getAttribute("aria-labelledby")?.split(/\s+/).filter(Boolean) ?? []
      if (!labels.includes(pair.tabId)) structure.attr(pair.panel, "aria-labelledby", [pair.tabId, ...labels].join(" "))
      structure.attr(pair.panel, "tabindex", "0")
      structure.attr(pair.panel, "hidden", pair.key === value ? null : "")
    }
    structure.attr(empty, "hidden", value === null ? null : "")
    structure.attr(empty, "tabindex", value === null ? "0" : "-1")
    rove()
  }
  function paintTransient() {
    transient.restore()
    if (!connected) return
    if (pending) {
      transient.attr(list, "aria-busy", "true")
      transient.attr(root, "data-tabs-pending-key", pending.pair.key)
      transient.attr(status, "hidden", null)
    } else if (failure) transient.attr(errorRegion, "hidden", null)
  }
  function invalidate() {
    requestId++
    pending = null
    failure = null
    transient.restore()
  }
  function same(pair: Pair) {
    return pairs.some(current => current.key === pair.key && current.tab === pair.tab && current.panel === pair.panel
      && current.tabId === pair.tabId && current.panelId === pair.panelId)
      && pair.tab.id === pair.tabId && pair.panel.id === pair.panelId
      && pair.tab.getAttribute("data-tabs-key") === pair.key
      && pair.tab.getAttribute("data-tabs-target") === pair.panelId && eligible(pair)
  }
  function current(request: Request) {
    return connected && lifetime === request.lifetime && pending === request && request.id === requestId
      && value === request.previous && same(request.pair)
  }
  function commit(next: string | null, user: boolean, event?: Event) {
    const previous = value
    const previousPanel = pairs.find(pair => pair.key === value)?.panel
    const repair = !!previousPanel?.contains(document!.activeElement)
    const generation = lifetime
    value = next
    const focused = pairs.find(pair => pair.tab === document!.activeElement && eligible(pair))
    focusedKey = focused?.key ?? next
    paint()
    if (repair && (document!.activeElement === document!.body || previousPanel?.contains(document!.activeElement))) {
      safeFocus(pairs.find(pair => pair.key === next)?.tab ?? empty)
    }
    if (user && event && connected && lifetime === generation && value === next && next !== null && next !== previous) {
      const pair = pairs.find(pair => pair.key === next)!
      root.dispatchEvent(new view!.CustomEvent<TabsChange>("mui:tabs-change", { detail: { value: next, previous, tab: pair.tab, panel: pair.panel, event } }))
    }
  }
  function request(key: string, user: boolean, event?: Event): Promise<boolean> {
    const pair = pairs.find(pair => pair.key === key)
    if (typeof key !== "string" || !pair) throw new RangeError("Tabs selection needs an existing string key.")
    if (!connected || !same(pair)) return Promise.resolve(false)
    if (pending?.pair.key === key && current(pending)) {
      if (pending.running) throw new Error("A Tabs guard cannot select its own pending target.")
      return pending.promise!
    }
    invalidate()
    if (key === value) { lastRequest = Promise.resolve(true); return lastRequest }
    const operation: Request = { id: requestId, lifetime, pair, previous: value }
    pending = operation
    let resolveLeave!: (value: boolean | PromiseLike<boolean>) => void
    let rejectLeave!: (error: unknown) => void
    const task = new Promise<boolean>((resolve, reject) => { resolveLeave = resolve; rejectLeave = reject }).then(allow => {
      if (typeof allow !== "boolean") throw new TypeError("Tabs beforeLeave must resolve to a boolean.")
      if (!current(operation)) {
        if (pending === operation && connected) { pending = null; paintTransient() }
        return false
      }
      pending = null
      paintTransient()
      if (!allow) return false
      commit(key, user, event)
      if (center && connected && value === key) controller.scrollToCurrentTab()
      return connected && value === key
    })
    operation.promise = task
    lastRequest = task
    void task.catch(error => {
      const stale = !current(operation)
      if (pending === operation && connected) {
        pending = null
        if (!stale) failure = { error }
        paintTransient()
      }
      root.dispatchEvent(new view!.CustomEvent("mui:tabs-error", { detail: { error, value: key, previous: operation.previous, stale } }))
    })
    paintTransient()
    if (current(operation)) {
      operation.running = true
      try { resolveLeave(guard ? guard(key, operation.previous) : true) } catch (error) { rejectLeave(error) }
      finally { operation.running = false }
    } else resolveLeave(false)
    return task
  }
  function closable(pair: Pair) {
    return pair.tab.hasAttribute("data-tabs-closable") || pair.panel.hasAttribute("data-tabs-closable")
      || query("[data-tabs-close]").some(button => button.getAttribute("data-tabs-close") === pair.key)
  }
  function closeIntent(pair: Pair, event: Event) {
    if (connected && same(pair) && closable(pair)) root.dispatchEvent(new view!.CustomEvent("mui:tabs-close", { detail: { value: pair.key, tab: pair.tab, panel: pair.panel, event } }))
  }
  function click(event: MouseEvent) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || !(event.target instanceof view!.Element)) return
    const button = event.target.closest<HTMLElement>("[data-tabs-tab], [data-tabs-add], [data-tabs-close]")
    if (!button || !own(button)) return
    const pair = pairs.find(pair => pair.tab === button)
    const sequence = requestId
    const add = button.hasAttribute("data-tabs-add")
    const closeKey = button.getAttribute("data-tabs-close")
    const closing = pairs.find(pair => pair.key === closeKey)
    queue(() => {
      if (event.defaultPrevented || !button.isConnected || button.matches(":disabled") || button.closest("[hidden], [inert]")) return
      if (pair && same(pair)) { if (sequence === requestId) void request(pair.key, true, event); return }
      if (add && button.hasAttribute("data-tabs-add")) root.dispatchEvent(new view!.CustomEvent("mui:tabs-add", { detail: { event } }))
      else if (closing && button.getAttribute("data-tabs-close") === closeKey && same(closing)) closeIntent(closing, event)
    })
  }
  function keydown(event: KeyboardEvent) {
    if (!connected || event.defaultPrevented || event.isComposing || event.keyCode === 229
      || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return
    const pair = pairs.find(pair => pair.tab === event.target)
    if (!pair || !same(pair)) return
    if (event.key === "Delete" && closable(pair)) {
      event.preventDefault()
      closeIntent(pair, event)
      return
    }
    const horizontal = ["top", "bottom"].includes(placement)
    const rtl = view!.getComputedStyle(list).direction === "rtl"
    const nextKey = horizontal ? rtl ? "ArrowLeft" : "ArrowRight" : "ArrowDown"
    const prevKey = horizontal ? rtl ? "ArrowRight" : "ArrowLeft" : "ArrowUp"
    const candidates = pairs.filter(eligible)
    const index = candidates.indexOf(pair)
    let next: Pair | undefined
    if (event.key === nextKey) next = candidates[(index + 1) % candidates.length]
    else if (event.key === prevKey) next = candidates[(index - 1 + candidates.length) % candidates.length]
    else if (event.key === "Home") next = candidates[0]
    else if (event.key === "End") next = candidates.at(-1)
    else return
    event.preventDefault()
    if (!next) return
    const generation = lifetime, sequence = requestId
    focusedKey = next.key
    rove()
    next.tab.focus()
    if (connected && lifetime === generation && requestId === sequence && activation === "automatic" && same(next)) void request(next.key, true, event)
  }
  function parse() {
    if (!root.isConnected || root.getRootNode() !== document || root.closest("mui-tabs")) throw new TypeError("Tabs needs connected light-DOM anatomy outside legacy mui-tabs.")
    list = one("[data-tabs-list]")
    const bar = one("[data-tabs-bar]")
    wrapper = one("[data-tabs-panels]")
    const messages = one("[data-tabs-messages]")
    empty = one("[data-tabs-empty]")
    status = one("[data-tabs-status]")
    errorRegion = one("[data-tabs-error]")
    if (list.localName !== "div" || bar.parentElement !== root || wrapper.parentElement !== root
      || messages.parentElement !== root || list.parentElement !== bar || !messages.contains(empty)
      || !messages.contains(status) || !messages.contains(errorRegion)
      || !(bar.compareDocumentPosition(wrapper) & 4) || !(wrapper.compareDocumentPosition(messages) & 4)
      || list.contains(wrapper) || wrapper.contains(list) || !named(list)
      || !(list.getAttribute("aria-label")?.trim() || list.getAttribute("aria-labelledby")?.trim())
      || ![null, "tablist"].includes(list.getAttribute("role"))) throw new TypeError("Author a named tablist separate from its pane wrapper.")
    const tabs = query("[data-tabs-tab]")
    const panels = query("[data-tabs-pane]")
    const seen = new Set<string>(), used = new Set<HTMLElement>()
    pairs = tabs.map(tab => {
      const key = tab.getAttribute("data-tabs-key")
      const target = tab.getAttribute("data-tabs-target")
      const panel = panels.find(panel => panel.id === target)
      if (!(tab instanceof view!.HTMLButtonElement) || tab.type !== "button" || !list.contains(tab)
        || !key?.trim() || seen.has(key) || !uniqueId(tab) || !named(tab) || tab.querySelector(interactive)
        || ["popovertarget", "command", "commandfor", "autofocus"].some(name => tab.hasAttribute(name))
        || ![null, "tab"].includes(tab.getAttribute("role"))) throw new TypeError("Tabs require uniquely keyed/named native type=button controls, without nested or competing actions.")
      if (!panel || !["section", "div", "article"].includes(panel.localName)
        || panel.parentElement !== wrapper || !uniqueId(panel) || used.has(panel) || panel.hidden
        || ![null, "tabpanel"].includes(panel.getAttribute("role"))
        || panel.hasAttribute("data-tabs-key") && panel.getAttribute("data-tabs-key") !== key
        || tab.hasAttribute("aria-controls") && tab.getAttribute("aria-controls") !== target) throw new TypeError("Each tab requires one unique visible authored pane and matching association.")
      seen.add(key)
      used.add(panel)
      return { key, tab, panel, tabId: tab.id, panelId: panel.id }
    })
    if (used.size !== panels.length || pairs.some((pair, index) => pair.panel !== panels[index])) throw new TypeError("Tabs and panes must pair one-to-one in the same authored order.")
    for (const nested of root.querySelectorAll<HTMLElement>("[data-tabs]")) {
      if (nested.parentElement?.closest("[data-tabs]") === root
        && !panels.includes(nested.closest<HTMLElement>("[data-tabs-pane]")!)) throw new TypeError("Nested tabsets must remain inside an owned pane.")
    }
    for (const node of [...list.querySelectorAll<HTMLElement>(interactive)].filter(own)) if (!tabs.includes(node)) throw new TypeError("Only tab buttons belong inside the tablist; add/close controls must be siblings outside it.")
    for (const node of [...list.querySelectorAll<HTMLElement>("*")].filter(own)) {
      const role = node.getAttribute("role")
      if (node.localName.includes("-") || node.shadowRoot || ["script", "style", "slot"].includes(node.localName)
        || role !== null && !(tabs.includes(node) ? ["tab"] : ["none", "presentation", "img"]).includes(role)) throw new TypeError("Tabs labels cannot contain custom widgets or conflicting roles.")
    }
    for (const node of query("[data-tabs-add], [data-tabs-close]")) {
      if (!(node instanceof view!.HTMLButtonElement) || node.type !== "button" || list.contains(node) || !named(node)
        || node.hasAttribute("popovertarget") || node.hasAttribute("command") || node.hasAttribute("commandfor")
        || node.hasAttribute("data-tabs-add") && node.hasAttribute("data-tabs-close")
        || node.hasAttribute("data-tabs-close") && !seen.has(node.getAttribute("data-tabs-close")!)) throw new TypeError("Add/close intents need named native type=button controls outside the tablist.")
    }
    if (new Set([empty, status, errorRegion]).size !== 3 || ![empty, status, errorRegion].every(node => node.textContent?.trim())
      || !initialized && [empty, status, errorRegion].some(node => !node.hidden)
      || errorRegion.getAttribute("role") !== "alert"
      || status.getAttribute("role") !== "status") throw new TypeError("Author nonempty empty/status/error regions with native status/alert semantics.")
  }
  const observer = new view.MutationObserver(records => {
    if (!connected) return
    if (!root.isConnected) { controller.disconnect(); return }
    const relevant = records.some(record => {
      if (!(record.target instanceof view!.Element) || !own(record.target)) return false
      return !(record.attributeName === "hidden" && record.target.matches("[data-tabs-pane], [data-tabs-empty], [data-tabs-status], [data-tabs-error]"))
    })
    if (!relevant) return
    try { controller.refresh() } catch (error) {
      root.dispatchEvent(new view!.CustomEvent("mui:tabs-error", { detail: { error, value, previous: value, stale: false } }))
    }
  })
  function unbind(permanent: boolean) {
    connected = false
    observer.disconnect()
    for (const remove of removers.splice(0)) remove()
    if (permanent) {
      lifetime++
      invalidate()
      for (const timer of tasks) view!.clearTimeout(timer)
      tasks.clear()
    }
    transient.restore()
    structure.restore()
    if (owners.get(root) === controller) owners.delete(root)
  }
  function attach(previousIndex = 0) {
    if (owners.has(root)) throw new Error("Tabs root already has an active controller.")
    parse()
    const candidates = pairs.filter(eligible)
    if (!initialized && (options.value !== undefined || options.defaultValue !== undefined)) {
      if (value !== null && !candidates.some(pair => pair.key === value) || value === null && candidates.length) throw new RangeError("Initial Tabs value must identify an available string key.")
    } else if (!candidates.some(pair => pair.key === value)) {
      value = candidates.find(pair => pairs.indexOf(pair) >= previousIndex)?.key ?? candidates.at(-1)?.key ?? null
    }
    try {
      owners.set(root, controller)
      connected = true
      const active = pairs.find(pair => pair.tab === document!.activeElement && eligible(pair))
      focusedKey = active?.key ?? value
      if (pending && !current(pending)) invalidate()
      paint()
      paintTransient()
      listen(root, "click", event => click(event as MouseEvent), true)
      listen(list, "keydown", event => keydown(event as KeyboardEvent))
      listen(root, "focusin", event => {
        if (!(event.target instanceof view!.HTMLElement)) return
        if (!own(event.target)) {
          if (pairs.some(pair => pair.panel.contains(event.target as Node))) lastFocused = event.target
          return
        }
        lastFocused = event.target
        const pair = pairs.find(pair => pair.tab === event.target)
        if (pair && eligible(pair)) { focusedKey = pair.key; rove() }
      })
      listen(list, "focusout", event => {
        if (!list.contains((event as FocusEvent).relatedTarget as Node | null)) { focusedKey = value; rove() }
      })
      observer.observe(root, { subtree: true, childList: true, attributes: true,
        attributeFilter: ["id", "data-tabs-key", "data-tabs-target", "data-tabs-tab", "data-tabs-pane", "data-tabs-list",
          "data-tabs-panels", "data-tabs-closable", "data-tabs-add", "data-tabs-close", "disabled", "hidden", "inert", "type", "aria-label"] })
      observer.observe(document!, { childList: true, subtree: true })
      initialized = true
    } catch (error) { unbind(true); throw error }
  }
  const controller: TabsController = {
    get connected() { return connected },
    get pending() { return pending?.pair.key ?? null },
    get lastRequest() { return lastRequest },
    get value() { return value },
    set value(next) {
      if (!connected) throw new Error("Connect Tabs before assigning selection.")
      if (next === null ? pairs.some(eligible) : typeof next !== "string" || !pairs.some(pair => pair.key === next && eligible(pair))) throw new RangeError("Tabs value must identify an available string key, or null only when empty.")
      invalidate()
      commit(next, false)
    },
    get activation() { return activation as TabsActivation },
    set activation(next) {
      if (!["automatic", "manual"].includes(next)) throw new TypeError("Tabs activation must be automatic or manual.")
      invalidate()
      activation = next
    },
    get placement() { return placement as TabsPlacement },
    set placement(next) {
      if (!placements.includes(next)) throw new TypeError("Invalid Tabs placement.")
      placement = next
      if (connected) paint()
    },
    select: key => request(key, false),
    scrollToCurrentTab() {
      const tab = pairs.find(pair => pair.key === value)?.tab
      if (!connected || !tab || !tab.getClientRects().length) return false
      const horizontal = ["top", "bottom"].includes(placement)
      tab.scrollIntoView({ block: center && !horizontal ? "center" : "nearest", inline: center && horizontal ? "center" : "nearest", behavior: "instant" })
      return true
    },
    refresh() {
      if (!connected) throw new Error("Connect Tabs before refreshing.")
      const previousIndex = Math.max(0, pairs.findIndex(pair => pair.key === value))
      const oldActive = pairs.find(pair => pair.key === value)?.panel
      const previousFocus = document!.activeElement
      const paneFocused = !!oldActive?.contains(previousFocus)
      const focus = lastFocused && (document!.activeElement === lastFocused || document!.activeElement === document!.body)
        && (!lastFocused.isConnected || lastFocused.matches(":disabled") || lastFocused.closest("[hidden], [inert]"))
      const oldValue = value
      unbind(false)
      try {
        attach(previousIndex)
        if (focus || oldValue !== value && paneFocused) {
          if (document!.activeElement === document!.body || document!.activeElement === previousFocus || oldActive?.contains(document!.activeElement)) safeFocus(pairs.find(pair => pair.key === value)?.tab ?? empty)
        }
      } catch (error) { unbind(true); throw error }
    },
    connect() { if (!connected) attach() },
    disconnect() { unbind(true); lastFocused = null },
  }
  attach()
  return controller
}
