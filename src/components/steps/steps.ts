import { ownedWrites } from "../popover/position.js"

export type StepStatus = "wait" | "process" | "finish" | "error"
export interface StepsOptions {
  current?: number | null
  defaultCurrent?: number | null
  status?: StepStatus
  labels?: Record<StepStatus, string>
}
export interface StepState {
  element: HTMLLIElement
  index: number
  status: StepStatus
  current: boolean
  disabled: boolean
}
export interface StepsRequest {
  current: number
  previous: number | null
  step: HTMLLIElement
  action: HTMLButtonElement
}
export interface StepsController {
  readonly connected: boolean
  readonly currentStep: HTMLLIElement | null
  readonly steps: readonly StepState[]
  current: number | null
  status: StepStatus
  refresh(): void
  connect(): void
  disconnect(): void
}
interface Item {
  element: HTMLLIElement
  text: Text
  label: HTMLElement
  action: HTMLButtonElement | null
  override: StepStatus | null
  visible: boolean
}
interface Claim { list: HTMLOListElement; writes: ReturnType<typeof ownedWrites>; text: Text; label: HTMLElement; before: string; last: string }
const owners = new WeakMap<HTMLOListElement, StepsController>()
const claims = new WeakMap<HTMLLIElement, Claim>()
const statuses: StepStatus[] = ["wait", "process", "finish", "error"]

export function createSteps(list: HTMLOListElement, options: StepsOptions = {}): StepsController {
  const document = list?.ownerDocument, view = document?.defaultView
  if (!view || !(list instanceof view.HTMLOListElement) || !list.matches(".mui-steps[data-steps]")) throw new TypeError("Steps needs an authored ol.mui-steps[data-steps].")
  if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Steps options must be an object.")
  for (const key of Object.keys(options)) if (!["current", "defaultCurrent", "status", "labels"].includes(key)) throw new TypeError(`Unsupported Steps option: ${key}.`)
  function checkCurrent(value: unknown): asserts value is number | null {
    if (value !== null && (!Number.isSafeInteger(value) || (value as number) < 0)) throw new RangeError("current must be null or a nonnegative safe integer.")
  }
  function checkStatus(value: unknown): asserts value is StepStatus {
    if (!statuses.includes(value as StepStatus)) throw new TypeError("Step status must be wait, process, finish or error.")
  }
  if (options.current !== undefined) checkCurrent(options.current)
  if (options.defaultCurrent !== undefined) checkCurrent(options.defaultCurrent)
  let status = options.status === undefined ? "process" : options.status
  checkStatus(status)
  if (options.labels !== undefined && (!options.labels || typeof options.labels !== "object" || Array.isArray(options.labels))) throw new TypeError("Status labels must be a text record.")
  const labels = { ...(options.labels ?? { wait: "Waiting", process: "In progress", finish: "Completed", error: "Error" }) }
  if (Object.keys(labels).length !== 4 || !statuses.every(key => typeof labels[key] === "string" && labels[key].trim())) throw new TypeError("Provide all four nonempty text status labels.")
  const own = (node: Element) => node.closest("[data-steps]") === list
  const held = new Map<HTMLLIElement, Claim>()
  const removers: (() => void)[] = []
  const tasks = new Set<number>()
  let items: Item[] = [], states: StepState[] = []
  let connected = false, initialized = false, generation = 0
  let current: number | null = null, selected: HTMLLIElement | null = null
  let lastFocus: HTMLElement | null = null
  let rootWrites = ownedWrites()
  function available(node: HTMLElement) {
    if (!node.isConnected || !own(node) || node.closest("[hidden], [inert]") || node.matches(":disabled")) return false
    const style = view!.getComputedStyle(node)
    if (style.visibility === "hidden" || style.visibility === "collapse") return false
    for (let ancestor: HTMLElement | null = node; ancestor; ancestor = ancestor.parentElement) {
      if (view!.getComputedStyle(ancestor).display === "none") return false
    }
    return true
  }
  function read(): Item[] {
    if (list.getRootNode() !== document || !list.matches(".mui-steps[data-steps]") || list.hasAttribute("start")
      || list.reversed || ![null, "list"].includes(list.getAttribute("role"))) throw new TypeError("Keep connected native Steps with ordinary one-based list numbering.")
    return [...list.children].filter(node => node.localName !== "template").map(node => {
      if (!(node instanceof view!.HTMLLIElement) || !node.matches(".mui-step[data-step]") || node.hasAttribute("value")
        || ![null, "listitem"].includes(node.getAttribute("role")) || ![null, "false", "step"].includes(node.getAttribute("aria-current"))) throw new TypeError("Steps children must be authored li.mui-step[data-step] or inert templates with step-current semantics.")
      const inside = (selector: string) => [...node.querySelectorAll<HTMLElement>(selector)].filter(child => own(child) && child.closest("[data-step]") === node)
      const titles = inside("[data-step-title]"), texts = inside("[data-step-status-text]"), actions = inside("[data-step-action]")
      if (titles.length !== 1 || !titles[0]!.textContent?.trim() || texts.length !== 1 || actions.length > 1) throw new TypeError("Each Step needs a title, text status and at most one native intent button.")
      const label = texts[0]!
      if (label.childNodes.length !== 1 || label.firstChild?.nodeType !== 3 || !label.textContent?.trim()
        || label.getAttribute("aria-hidden") === "true" || label.hidden) throw new TypeError("Step status needs one readable authored text node.")
      if (inside("[aria-current]").length) throw new TypeError("The Step li is the sole aria-current owner; remove duplicate descendant current markers.")
      const action = actions[0] ?? null
      const labelledBy = action?.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean)
      const named = labelledBy?.length ? labelledBy.every(id => document!.getElementById(id)?.textContent?.trim())
        : action?.getAttribute("aria-label")?.trim() || [...action?.childNodes ?? []].some(child => child.nodeType === 3 ? child.textContent?.trim()
          : child instanceof view!.HTMLElement && child.getAttribute("aria-hidden") !== "true" && !child.hidden && child.textContent?.trim())
      if (action && (!(action instanceof view!.HTMLButtonElement) || action.getAttribute("type")?.toLowerCase() !== "button"
        || action.hasAttribute("role") || action.hasAttribute("popovertarget") || action.hasAttribute("commandfor")
        || action.querySelector("a, button, input, select, textarea, summary, [tabindex], [contenteditable], [role]")
        || action.parentElement?.closest("a[href], button, summary, label")
        || !named)) {
        throw new TypeError("Step intents need a named type=button without nested interaction or another native command.")
      }
      const override = node.getAttribute("data-step-status")
      if (override !== null) checkStatus(override)
      const style = view!.getComputedStyle(node)
      return { element: node, text: label.firstChild as Text, label, action: action as HTMLButtonElement | null,
        override, visible: !node.hidden && !node.hasAttribute("inert") && style.display !== "none" && !["hidden", "collapse"].includes(style.visibility) }
    })
  }
  function restore(claim: Claim) {
    claim.writes.restore()
    if (claim.text.parentNode === claim.label && claim.text.data === claim.last) claim.text.data = claim.before
  }
  function release(element: HTMLLIElement, claim: Claim) {
    if (claims.get(element) === claim) { restore(claim); claims.delete(element) }
    held.delete(element)
  }
  function claim(item: Item) {
    const previous = claims.get(item.element)
    if (previous?.list === list && previous === held.get(item.element) && previous.text === item.text) return previous
    if (previous) restore(previous)
    const next: Claim = { list, writes: ownedWrites(), text: item.text, label: item.label, before: item.text.data, last: item.text.data }
    held.set(item.element, next); claims.set(item.element, next)
    return next
  }
  function bounded(value: number | null, count: number) {
    return value === null ? null : count ? Math.min(value, count + 1) : 0
  }
  function reconcile(preserve: boolean) {
    const next = read(), visible = next.filter(item => item.visible)
    const wasAfter = items.filter(item => item.visible).length > 0 && current === items.filter(item => item.visible).length + 1
    for (const [element, value] of held) if (!next.some(item => item.element === element) || claims.get(element) !== value) release(element, value)
    if (preserve && selected && visible.some(item => item.element === selected)) current = visible.findIndex(item => item.element === selected) + 1
    else if (preserve && selected) current = visible.length ? Math.min(current ?? 1, visible.length) : 0
    else if (preserve && wasAfter) current = visible.length ? visible.length + 1 : 0
    current = bounded(current, visible.length)
    selected = current ? visible[current - 1]?.element ?? null : null
    items = next
    states = visible.map((item, index) => ({ element: item.element, index: index + 1, current: item.element === selected,
      status: item.override ?? (item.element === selected ? status : "wait"), disabled: item.action?.matches(":disabled") ?? false }))
    for (const item of items) {
      if (!own(item.element)) continue
      const value = claim(item), state = states.find(state => state.element === item.element)
      value.writes.attr(item.element, "aria-current", state?.current ? "step" : null)
      value.writes.attr(item.element, "data-step-state", state?.status ?? item.override ?? "wait")
      value.writes.attr(item.element, "data-step-following", state && state.index < states.length ? "" : null)
      value.writes.attr(item.element, "data-step-action-disabled", state?.disabled ? "" : null)
      value.last = labels[state?.status ?? item.override ?? "wait"]
      value.text.data = value.last
    }
    rootWrites.attr(list, "data-steps-connected", "")
  }
  function recoverFocus() {
    if (!lastFocus || available(lastFocus) || document!.activeElement !== document!.body && document!.activeElement !== lastFocus) return
    const target = items.find(item => item.element === selected)?.action
    const fallback = target && available(target) ? target : items.find(item => item.visible && item.action && available(item.action))?.action
    if (fallback) fallback.focus({ preventScroll: true })
    else if (list.isConnected && !list.closest("[hidden], [inert]")) {
      if (!list.hasAttribute("tabindex")) rootWrites.attr(list, "tabindex", "-1")
      list.focus({ preventScroll: true })
    }
  }
  function clear() { generation++; for (const task of tasks) view!.clearTimeout(task); tasks.clear() }
  function fail(error: unknown) { controller.disconnect(); list.dispatchEvent(new view!.CustomEvent("mui:steps-error", { detail: { error } })) }
  function update(preserve: boolean) {
    if (!connected) return
    try { reconcile(preserve); recoverFocus() } catch (error) { controller.disconnect(); throw error }
  }
  function click(event: Event) {
    const mouse = event as MouseEvent, target = event.target as Element
    if (!own(target) || event.defaultPrevented || mouse.button !== 0 || mouse.ctrlKey || mouse.metaKey || mouse.altKey || mouse.shiftKey) return
    const action = target.closest("[data-step-action]") as HTMLButtonElement | null
    const item = items.find(item => item.action === action)
    if (!item || !item.visible || !action || !available(action)) return
    const version = generation
    const task = view!.setTimeout(() => {
      tasks.delete(task)
      if (!connected || version !== generation || event.defaultPrevented || !available(action)) return
      try {
        const live = read().filter(item => item.visible)
        if (live.length !== states.length || !live.every((item, index) => item.element === states[index]!.element)
          || !live.some(value => value.element === item.element && value.action === action)) throw new Error("Step anatomy/order changed; call refresh before activation.")
        const index = live.findIndex(value => value.element === item.element) + 1
        list.dispatchEvent(new view!.CustomEvent<StepsRequest>("mui:steps-request", { detail: { current: index, previous: current, step: item.element, action } }))
      } catch (error) { fail(error) }
    }, 0)
    tasks.add(task)
  }
  const controller: StepsController = {
    get connected() { return connected },
    get current() { return current },
    set current(value) { checkCurrent(value); clear(); current = value; selected = null; update(false) },
    get status() { return status },
    set status(value) { checkStatus(value); clear(); status = value; update(true) },
    get currentStep() { return selected },
    get steps() { return states.map(state => ({ ...state })) },
    refresh() { if (!connected) throw new Error("Connect Steps before refreshing."); clear(); update(true) },
    connect() {
      if (connected) return
      if (owners.has(list)) throw new Error("Steps list already has an active controller.")
      const initial = read()
      for (const item of initial) {
        const previous = claims.get(item.element)
        if (previous && previous.list !== list) { restore(previous); claims.delete(item.element) }
      }
      if (!initialized) {
        const authored = initial.filter(item => item.element.getAttribute("aria-current") === "step")
        if (authored.length > 1) throw new TypeError("Author at most one current Step.")
        const marked = authored[0]
        current = options.current !== undefined ? options.current : options.defaultCurrent !== undefined ? options.defaultCurrent
          : marked?.visible ? initial.filter(item => item.visible).indexOf(marked) + 1 : null
        initialized = true
      }
      owners.set(list, controller); connected = true
      clear()
      list.addEventListener("click", click); removers.push(() => list.removeEventListener("click", click))
      const focus = (event: Event) => { const target = event.target as HTMLElement; lastFocus = own(target) ? target : null }
      document!.addEventListener("focusin", focus); removers.push(() => document!.removeEventListener("focusin", focus))
      const active = document!.activeElement as HTMLElement | null
      lastFocus = active && own(active) ? active : null
      update(true)
    },
    disconnect() {
      connected = false; clear()
      for (const remove of removers.splice(0)) remove()
      for (const [element, value] of held) release(element, value)
      rootWrites.restore(); rootWrites = ownedWrites()
      lastFocus = null
      if (owners.get(list) === controller) owners.delete(list)
    },
  }
  controller.connect()
  return controller
}
