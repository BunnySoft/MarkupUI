export interface CheckboxGroupOptions { min?: number; max?: number | null }
export interface CheckboxGroupState { values: string[]; min: number; max: number | null; withinLimits: boolean }
export interface CheckboxGroupChange { values: string[]; value: string; actionType: "check" | "uncheck" }
export interface CheckboxGroupController {
  readonly connected: boolean
  readonly error: string | null
  readonly state: CheckboxGroupState
  setValues(values: readonly string[]): void
  setLimits(options: CheckboxGroupOptions): void
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.checkbox-group.owner")
type Owned = Element & { [owner]?: CheckboxGroupController }
interface Member { control: HTMLInputElement; before: string | null; last: string | null }

/** Native checkbox activation owns checkedness and cancelled-click rollback, including mixed state. */
export function createCheckboxGroup(root: HTMLFieldSetElement, options: CheckboxGroupOptions = {}): CheckboxGroupController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLFieldSetElement)) throw new TypeError("CheckboxGroup needs a native fieldset.")
  if ((root as Owned)[owner]) throw new Error("CheckboxGroup already has an owner.")
  let min = 0, max: number | null = null, connected = true, error: string | null = null
  let members = new Map<HTMLInputElement, Member>()
  const removers: (() => void)[] = [], tasks = new Set<number>()
  function limits(input: CheckboxGroupOptions) {
    if (!input || typeof input !== "object" || Array.isArray(input)
      || Object.keys(input).some(key => key !== "min" && key !== "max")) throw new TypeError("Unsupported CheckboxGroup options.")
    const nextMin = "min" in input ? input.min : min, nextMax = "max" in input ? input.max : max
    if (!Number.isSafeInteger(nextMin) || nextMin! < 0
      || nextMax !== null && (!Number.isSafeInteger(nextMax) || nextMax! < nextMin!)) {
      throw new RangeError("CheckboxGroup limits need nonnegative integers with max >= min, or max: null.")
    }
    return { min: nextMin!, max: nextMax! }
  }
  ;({ min, max } = limits(options))
  function rootValid() {
    return root.isConnected && root.getRootNode() === document && root.matches(".mui-checkbox-group[data-checkbox-group]")
      && !root.hasAttribute("role") && !root.hasAttribute("tabindex")
  }
  function collect(): HTMLInputElement[] {
    if (!rootValid() || ![...root.children].find(node => node.localName === "legend")?.textContent?.trim()) {
      throw new TypeError("Keep CheckboxGroup a connected light-DOM fieldset with a nonempty direct legend and no role/tabindex.")
    }
    const keys = new Set<string>()
    const nodes = [...root.querySelectorAll("[data-checkbox]")].filter(node => node.closest("[data-checkbox-group]") === root)
    for (const node of nodes) {
      if (!(node instanceof view!.HTMLInputElement) || node.type !== "checkbox" || node.hasAttribute("role")
        || ![...node.labels ?? []].some(label => label.textContent?.trim())) {
        throw new TypeError("Each data-checkbox member needs an original input[type=checkbox] and real native label.")
      }
      if (!node.hasAttribute("value") || !node.value || keys.has(node.value)) {
        throw new TypeError("CheckboxGroup values must be explicit, nonempty, unique native strings.")
      }
      if ((node as Owned)[owner] && (node as Owned)[owner] !== controller) throw new Error("Checkbox already has a group owner.")
      keys.add(node.value)
    }
    return nodes as HTMLInputElement[]
  }
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const member = members.get(record.target as HTMLInputElement)
      if (member && record.attributeName === "aria-disabled") {
        member.before = member.last = member.control.getAttribute("aria-disabled")
      }
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    if (!root.isConnected || root.getRootNode() !== document) { disconnect(); return }
    attemptRefresh()
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, attributes: true,
      attributeFilter: ["checked", "disabled", "value", "type", "form", "aria-disabled", "data-checkbox", "data-checkbox-group"] })
    for (let node = root.parentElement; node; node = node.parentElement) observer.observe(node, { childList: true })
  }
  function release(member: Member) {
    const { control, before, last } = member
    if (control.getAttribute("aria-disabled") === last) {
      if (before === null) control.removeAttribute("aria-disabled")
      else control.setAttribute("aria-disabled", before)
    }
    if ((control as Owned)[owner] === controller) delete (control as Owned)[owner]
  }
  function sync(nodes: HTMLInputElement[]) {
    for (const member of members.values()) if (!nodes.includes(member.control)) release(member)
    const next = new Map<HTMLInputElement, Member>()
    for (const control of nodes) {
      let member = members.get(control)
      if (!member) {
        const before = control.getAttribute("aria-disabled")
        member = { control, before, last: before }
        Object.defineProperty(control, owner, { value: controller, configurable: true })
      }
      next.set(control, member)
    }
    members = next
  }
  function values(nodes = [...members.keys()]) { return nodes.filter(node => node.checked).map(node => node.value) }
  function render() {
    const count = values().length
    for (const member of members.values()) {
      const { control } = member
      const blocked = control.checked ? count <= min : max !== null && count >= max
      const value = blocked ? "true" : member.before
      if (control.getAttribute("aria-disabled") !== value) {
        if (value === null) control.removeAttribute("aria-disabled")
        else control.setAttribute("aria-disabled", value)
      }
      member.last = value
    }
  }
  function refresh() {
    if (!connected) return
    pause()
    try { sync(collect()); error = null; render() }
    catch (reason) { error = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally { observe() }
  }
  function report(reason: unknown) {
    const message = reason instanceof Error ? reason.message : String(reason)
    const changed = error !== message
    error = message
    if (changed) root.dispatchEvent(new view!.CustomEvent("mui:checkbox-group-error", { detail: { message } }))
  }
  function attemptRefresh() {
    const previous = error
    try { refresh() } catch (reason) { error = previous; report(reason) }
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => { tasks.delete(id); if (connected) callback() }, 0)
    tasks.add(id)
  }
  function listen(node: EventTarget, type: string, callback: EventListener, capture = false) {
    node.addEventListener(type, callback, capture)
    removers.push(() => node.removeEventListener(type, callback, capture))
  }
  function onClick(event: Event) {
    const control = event.target
    if (!(control instanceof view!.HTMLInputElement) || !control.hasAttribute("data-checkbox")
      || control.closest("[data-checkbox-group]") !== root) return
    pause()
    try {
      sync(collect())
      const count = values().length
      // During a native checkbox click the proposed checkedness is already applied.
      // Cancel only the event: the browser restores both checked and indeterminate.
      const forbidden = control.matches(":disabled") || members.get(control)!.before === "true"
        || (control.checked ? max !== null && count > max : count < min)
      if (forbidden) event.preventDefault()
    } catch (reason) { event.preventDefault(); report(reason) }
    finally { observe(); later(attemptRefresh) }
  }
  function onChange(event: Event) {
    const control = event.target
    if (!(control instanceof view!.HTMLInputElement) || !control.hasAttribute("data-checkbox")
      || control.closest("[data-checkbox-group]") !== root) return
    const previous = error
    try {
      refresh()
      const detail: CheckboxGroupChange = { values: values(), value: control.value, actionType: control.checked ? "check" : "uncheck" }
      later(() => root.dispatchEvent(new view!.CustomEvent("mui:checkbox-group-change", { detail })))
    } catch (reason) { error = previous; report(reason) }
  }
  function setValues(next: readonly string[]) {
    if (!connected) throw new Error("CheckboxGroup is disconnected.")
    refresh()
    if (!Array.isArray(next) || next.some(value => typeof value !== "string")
      || new Set(next).size !== next.length || next.some(value => ![...members.keys()].some(node => node.value === value))) {
      throw new TypeError("setValues needs unique existing string keys; unknown keys are not ignored.")
    }
    for (const control of members.keys()) {
      const checked = next.includes(control.value)
      if (control.checked !== checked) control.checked = checked
    }
    refresh()
  }
  function setLimits(next: CheckboxGroupOptions) {
    if (!connected) throw new Error("CheckboxGroup is disconnected.")
    const checked = limits(next)
    refresh()
    ;({ min, max } = checked)
    refresh()
  }
  function disconnect() {
    if (!connected) return
    pause(); connected = false
    removers.splice(0).forEach(remove => remove())
    tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    for (const member of members.values()) release(member)
    members.clear()
    if ((root as Owned)[owner] === controller) delete (root as Owned)[owner]
  }
  const controller: CheckboxGroupController = {
    get connected() { return connected }, get error() { return error },
    get state() {
      if (!connected) throw new Error("CheckboxGroup is disconnected.")
      const selected = values(collect())
      return { values: selected, min, max, withinLimits: selected.length >= min && (max === null || selected.length <= max) }
    },
    setValues, setLimits, refresh, disconnect,
  }
  collect()
  Object.defineProperty(root, owner, { value: controller, configurable: true })
  listen(root, "click", onClick, true)
  listen(root, "change", onChange)
  listen(document!, "reset", event => {
    if ([...members.keys()].some(control => control.form === event.target)) later(attemptRefresh)
  }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return controller
}
