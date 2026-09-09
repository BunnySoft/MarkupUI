export interface RadioGroupState { value: string | null; name: string | null; form: HTMLFormElement | null }
export interface RadioGroupChange { value: string }
export interface RadioGroupController {
  readonly connected: boolean
  readonly error: string | null
  readonly state: RadioGroupState
  setValue(value: string | null): void
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.radio-group.owner")
type Owned = Element & { [owner]?: RadioGroupController }

/** Validates one complete native radio group, without owning its keyboard or exclusivity engine. */
export function createRadioGroup(root: HTMLFieldSetElement): RadioGroupController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLFieldSetElement)) throw new TypeError("RadioGroup needs a native fieldset.")
  if ((root as Owned)[owner]) throw new Error("RadioGroup already has an owner.")
  let connected = true, error: string | null = null
  let members: HTMLInputElement[] = []
  const removers: (() => void)[] = [], tasks = new Set<number>()
  function collect(): HTMLInputElement[] {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-radio-group[data-radio-group]")
      || root.hasAttribute("role") || root.hasAttribute("tabindex")
      || ![...root.children].find(node => node.localName === "legend")?.textContent?.trim()) {
      throw new TypeError("Keep RadioGroup a connected light-DOM fieldset with a named first legend, no role or tabindex.")
    }
    const nodes = [...root.querySelectorAll("[data-radio]")].filter(node => node.closest("[data-radio-group]") === root)
    const keys = new Set<string>()
    let name: string | undefined, form: HTMLFormElement | null | undefined
    for (const node of nodes) {
      if (!(node instanceof view!.HTMLInputElement) || node.type !== "radio" || node.hasAttribute("role")
        || ![...node.labels ?? []].some(label => label.textContent?.trim())) {
        throw new TypeError("Each data-radio member needs an original input[type=radio] with a native label.")
      }
      if (!node.name || name !== undefined && node.name !== name) throw new TypeError("RadioGroup members need one common nonempty native name.")
      if (node.hasAttribute("form") && !node.form || form !== undefined && node.form !== form) {
        throw new TypeError("RadioGroup members need one actual form owner; explicit form targets must resolve.")
      }
      if (!node.hasAttribute("value") || !node.value || keys.has(node.value)) {
        throw new TypeError("RadioGroup values must be explicit, nonempty, unique native strings.")
      }
      if ((node as Owned)[owner] && (node as Owned)[owner] !== controller) throw new Error("Radio already has a group owner.")
      name = node.name; form = node.form
      keys.add(node.value)
    }
    // Native grouping is document/tree + actual form owner + name, not the fieldset boundary.
    if (name !== undefined) for (const peer of document!.querySelectorAll<HTMLInputElement>("input")) {
      if (peer.type === "radio" && peer.name === name && peer.form === form && !nodes.includes(peer)) {
        throw new TypeError("RadioGroup has an out-of-scope native peer with the same name and form owner.")
      }
    }
    const inputs = nodes as HTMLInputElement[]
    if (inputs.filter(node => node.checked).length > 1) throw new TypeError("A native radio group must have at most one checked member.")
    return inputs
  }
  function snapshot(nodes: HTMLInputElement[]): RadioGroupState {
    return { value: nodes.find(node => node.checked)?.value ?? null, name: nodes[0]?.name ?? null, form: nodes[0]?.form ?? null }
  }
  function release(control: HTMLInputElement) {
    if ((control as Owned)[owner] === controller) delete (control as Owned)[owner]
  }
  function refresh() {
    if (!connected) return
    try {
      const nodes = collect()
      for (const control of members) if (!nodes.includes(control)) release(control)
      for (const control of nodes) if (!members.includes(control)) Object.defineProperty(control, owner, { value: controller, configurable: true })
      members = nodes
      error = null
    } catch (reason) { error = reason instanceof Error ? reason.message : String(reason); throw reason }
  }
  function report(reason: unknown, previous: string | null) {
    const message = reason instanceof Error ? reason.message : String(reason)
    error = message
    if (message !== previous) root.dispatchEvent(new view!.CustomEvent("mui:radio-group-error", { detail: { message } }))
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
  function onChange(event: Event) {
    const control = event.target
    if (!(control instanceof view!.HTMLInputElement) || !control.hasAttribute("data-radio")
      || control.closest("[data-radio-group]") !== root || !control.checked) return
    const previous = error
    try {
      refresh()
      const detail: RadioGroupChange = { value: control.value }
      later(() => root.dispatchEvent(new view!.CustomEvent("mui:radio-group-change", { detail })))
    } catch (reason) { report(reason, previous) }
  }
  function setValue(value: string | null) {
    if (!connected) throw new Error("RadioGroup is disconnected.")
    refresh()
    if (value !== null && (typeof value !== "string" || !members.some(node => node.value === value))) {
      throw new TypeError("setValue needs an existing native string key or null; unknown/numeric/boolean keys are not ignored.")
    }
    if (value === null) {
      for (const node of members) if (node.checked) node.checked = false
    } else {
      const node = members.find(node => node.value === value)!
      if (!node.checked) node.checked = true
    }
    refresh()
  }
  const observer = new view.MutationObserver(() => {
    if (!root.isConnected || root.getRootNode() !== document) { disconnect(); return }
    attemptRefresh()
  })
  function disconnect() {
    if (!connected) return
    connected = false; observer.disconnect()
    removers.splice(0).forEach(remove => remove())
    tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    members.forEach(release); members = []
    if ((root as Owned)[owner] === controller) delete (root as Owned)[owner]
  }
  const controller: RadioGroupController = {
    get connected() { return connected }, get error() { return error },
    get state() {
      if (!connected) throw new Error("RadioGroup is disconnected.")
      return snapshot(collect())
    },
    setValue, refresh, disconnect,
  }
  collect()
  Object.defineProperty(root, owner, { value: controller, configurable: true })
  listen(root, "change", onChange)
  listen(document!, "reset", event => {
    if (members.some(node => node.form === event.target)) later(attemptRefresh)
  }, true)
  // Outside peers and form IDs can change anywhere in this native tree; observe structure,
  // not checked property writes. No attributes or controls are rendered by this observer.
  observer.observe(document!, { subtree: true, childList: true, attributes: true, attributeFilter: ["name", "form", "type", "id"] })
  observer.observe(root, { subtree: true, attributes: true,
    attributeFilter: ["checked", "value", "disabled", "data-radio", "data-radio-group", "role", "class"] })
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return controller
}
