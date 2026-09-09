export interface SwitchOptions { loading?: boolean }
export interface SwitchController {
  readonly control: HTMLInputElement
  readonly connected: boolean
  readonly loading: boolean
  readonly error: string | null
  setLoading(loading: boolean): void
  setChecked(checked: boolean): void
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.switch.owner")
type Owned = Element & { [owner]?: SwitchController }
interface Attribute { node: Element; name: string; before: string | null; last: string | null; base: string | null }

/** Native checkbox activation owns checkedness; loading only cancels its native click. */
export function createSwitch(root: HTMLElement, options: SwitchOptions = {}): SwitchController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement)) throw new TypeError("Switch needs an authored root.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => key !== "loading")
    || "loading" in options && typeof options.loading !== "boolean") throw new TypeError("Switch accepts only a boolean loading option.")
  if ((root as Owned)[owner]) throw new Error("Switch root already has an owner.")
  const own = (node: Element) => node.closest("[data-switch]") === root
  function one(selector: string, required = false): HTMLElement | null {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Switch needs ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const field = one("[data-switch-control]", true)
  if (!(field instanceof view.HTMLInputElement)) throw new TypeError("Switch needs an authored input.")
  const control = field, indicator = one("[data-switch-loading]")
  if ((control as Owned)[owner]) throw new Error("Native switch already has an owner.")
  function validate() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-switch[data-switch]")
      || root.hasAttribute("role") || root.hasAttribute("tabindex") || control.parentElement !== root
      || !own(control) || !control.hasAttribute("data-switch-control")
      || [...root.querySelectorAll("[data-switch-control]")].filter(own).length !== 1
      || root.parentElement?.closest("label, button, a[href], summary")) {
      throw new TypeError("Keep one direct native input in a connected light-DOM Switch root without wrapper role/tabindex or nested interaction.")
    }
    if (control.type !== "checkbox" || control.getAttribute("role") !== "switch" || control.hasAttribute("aria-checked")) {
      throw new TypeError("Author input[type=checkbox][role=switch]; checked state is native, not aria-checked.")
    }
    if (control.indeterminate) throw new TypeError("Switch is binary; clear native indeterminate before enhancing or refreshing.")
    if (control.readOnly) throw new TypeError("Checkbox readonly is unsupported; use native disabled or explicit loading instead.")
    const ids = control.getAttribute("aria-labelledby")?.trim().split(/\s+/)
    const stableName = ids?.length ? ids.every(id => {
      const label = document!.getElementById(id)
      return label?.textContent?.trim() && !label.closest(".mui-switch__state, [data-switch-loading]")
    }) : !!control.getAttribute("aria-label")?.trim()
    if (!stableName || ![...control.labels ?? []].some(label => label.textContent?.trim())) {
      throw new TypeError("Switch needs a real native label and stable aria-label or aria-labelledby, separate from visual on/off text.")
    }
    for (const decoration of [...root.querySelectorAll<HTMLElement>(".mui-switch__state"), ...(indicator ? [indicator] : [])]) {
      if (!own(decoration) || decoration.parentElement !== root || decoration.getAttribute("aria-hidden") !== "true"
        || decoration === indicator && !indicator.hasAttribute("data-switch-loading")
        || decoration.hasAttribute("tabindex") || decoration.hasAttribute("role")
        || decoration.querySelector("button, input, select, textarea, a[href], [tabindex], [contenteditable], [role]")) {
        throw new TypeError("Switch state/loading decorations must be direct aria-hidden noninteractive children.")
      }
    }
  }
  validate()
  let connected = true, requested = options.loading ?? false, error: string | null = null
  const attributes: Attribute[] = []
  const removers: (() => void)[] = [], tasks = new Set<number>()
  function lease(node: Element, name: string, enhancement = false) {
    const before = node.getAttribute(name)
    const item = { node, name, before, last: before, base: enhancement ? null : before }
    attributes.push(item)
    return item
  }
  const busy = lease(control, "aria-busy"), disabled = lease(control, "aria-disabled")
  const hidden = indicator ? lease(indicator, "hidden", true) : null
  const loading = () => requested || busy.base === "true"
  function write(item: Attribute, value: string | null) {
    if (item.node.getAttribute(item.name) !== value) {
      if (value === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, value)
    }
    item.last = value
  }
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const item = attributes.find(item => item.node === record.target && item.name === record.attributeName)
      if (item) item.before = item.base = item.last = item.node.getAttribute(item.name)
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    if (!root.isConnected || root.getRootNode() !== document || control.parentElement !== root) { disconnect(); return }
    attemptRefresh()
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, attributes: true,
      attributeFilter: ["disabled", "readonly", "type", "role", "checked", "value", "form", "hidden", "aria-hidden",
        "aria-checked", "aria-busy", "aria-disabled", "aria-label", "aria-labelledby", "data-switch-control", "data-switch"] })
    for (let node = root.parentElement; node; node = node.parentElement) observer.observe(node, { childList: true })
  }
  function refresh() {
    if (!connected) return
    pause()
    try {
      validate()
      error = null
      const active = loading()
      write(busy, active ? "true" : busy.base)
      write(disabled, active ? "true" : disabled.base)
      if (hidden) write(hidden, active ? hidden.base : hidden.base ?? "")
    } catch (reason) { error = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally { observe() }
  }
  function report(reason: unknown, previous: string | null) {
    error = reason instanceof Error ? reason.message : String(reason)
    if (error !== previous) root.dispatchEvent(new view!.CustomEvent("mui:switch-error", { detail: { message: error } }))
  }
  function attemptRefresh() {
    const previous = error
    try { refresh() } catch (reason) { report(reason, previous) }
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => { tasks.delete(id); if (connected) callback() }, 0)
    tasks.add(id)
  }
  function listen(node: EventTarget, type: string, callback: EventListener, capture = false) {
    node.addEventListener(type, callback, capture)
    removers.push(() => node.removeEventListener(type, callback, capture))
  }
  function setLoading(value: boolean) {
    if (!connected) throw new Error("Switch is disconnected.")
    if (typeof value !== "boolean") throw new TypeError("setLoading needs a boolean.")
    refresh()
    requested = value
    refresh()
  }
  function setChecked(value: boolean) {
    if (!connected) throw new Error("Switch is disconnected.")
    if (typeof value !== "boolean") throw new TypeError("setChecked needs a boolean; native value/defaultValue are submission strings.")
    refresh()
    if (control.checked !== value) control.checked = value
    refresh()
  }
  function disconnect() {
    if (!connected) return
    pause(); connected = false
    removers.splice(0).forEach(remove => remove())
    tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    for (const node of [root, control] as Owned[]) if (node[owner] === controller) delete node[owner]
  }
  const controller: SwitchController = {
    control, get connected() { return connected }, get loading() { return connected && loading() }, get error() { return error },
    setLoading, setChecked, refresh, disconnect,
  }
  for (const node of [root, control]) Object.defineProperty(node, owner, { value: controller, configurable: true })
  listen(root, "click", event => {
    if (event.target !== control) return
    const previous = error
    try {
      refresh()
      // Native pre-activation has already toggled checkedness. Never toggle it back manually.
      if (loading() || disabled.base === "true" || control.matches(":disabled")) event.preventDefault()
    } catch (reason) { event.preventDefault(); report(reason, previous) }
    later(attemptRefresh)
  }, true)
  listen(control, "input", attemptRefresh)
  listen(control, "change", attemptRefresh)
  listen(document!, "reset", event => { if (event.target === control.form) later(attemptRefresh) }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return controller
}
