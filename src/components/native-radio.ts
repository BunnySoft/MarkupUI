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

/** Shared native contract for RadioGroup and the unmigrated Rate composition. */
export function radioMembers(root: HTMLFieldSetElement): HTMLInputElement[] {
  const document = root.ownerDocument, view = document.defaultView!
  if (root.isConnected && root.getRootNode() !== document || !root.matches(".m-radio-group[data-radio-group]")
    || root.hasAttribute("role") || root.hasAttribute("tabindex")
    || ![...root.children].find(node => node.localName === "legend")?.textContent?.trim()) {
    throw new TypeError("Keep a light-DOM fieldset with a named first legend, no role or tabindex.")
  }
  const nodes = [...root.querySelectorAll<HTMLInputElement>("[data-radio]")].filter(node => node.closest("[data-radio-group],m-radio-group") === root)
  const keys = new Set<string>()
  let name: string | undefined, form: HTMLFormElement | null | undefined
  for (const node of nodes) {
    const labels = [...node.labels ?? []]
    const ancestor = node.closest("label")
    if (!node.isConnected && ancestor) labels.push(ancestor)
    if (!(node instanceof view.HTMLInputElement) || node.type !== "radio" || node.hasAttribute("role")
      || !labels.some(label => label.textContent?.trim())) {
      throw new TypeError("Each member needs an original native radio with a label.")
    }
    if (!node.name || name !== undefined && node.name !== name) throw new TypeError("Members need one common nonempty native name.")
    if (node.isConnected && node.hasAttribute("form") && !node.form || form !== undefined && node.form !== form) {
      throw new TypeError("Members need one actual form owner; explicit form targets must resolve.")
    }
    if (!node.hasAttribute("value") || !node.value || keys.has(node.value)) {
      throw new TypeError("Values must be explicit, nonempty, unique native strings.")
    }
    name = node.name; form = node.form; keys.add(node.value)
  }
  // Visual boundaries never override the browser's name + form + tree grouping.
  if (name !== undefined) for (const peer of (root.getRootNode() as ParentNode).querySelectorAll<HTMLInputElement>("input")) {
    if (peer.type === "radio" && peer.name === name && peer.form === form && !nodes.includes(peer)) {
      throw new TypeError("RadioGroup has an out-of-scope native peer with the same name and form owner.")
    }
  }
  if (nodes.filter(node => node.checked).length > 1) throw new TypeError("A native group must have at most one checked member.")
  return nodes
}

export function setRadioValue(root: HTMLFieldSetElement, value: string | null): void {
  const nodes = radioMembers(root)
  if (value !== null && (typeof value !== "string" || !nodes.some(node => node.value === value))) {
    throw new TypeError("Expected an existing native string key or null.")
  }
  if (value === null) {
    for (const node of nodes) if (node.checked) node.checked = false
  } else {
    const selected = nodes.find(node => node.value === value)!
    if (!selected.checked) selected.checked = true
  }
}

/** Validates one complete native radio group, without owning its keyboard or exclusivity engine. */
export function createRadioGroup(root: HTMLFieldSetElement): RadioGroupController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLFieldSetElement)) throw new TypeError("RadioGroup needs a native fieldset.")
  if ((root as Owned)[owner]) throw new Error("RadioGroup already has an owner.")
  let connected = true, error: string | null = null
  let members: HTMLInputElement[] = []
  const removers: (() => void)[] = [], tasks = new Set<number>()
  function collect(): HTMLInputElement[] {
    if (!root.isConnected) throw new TypeError("RadioGroup needs a connected fieldset.")
    const nodes = radioMembers(root)
    for (const node of nodes) {
      if ((node as Owned)[owner] && (node as Owned)[owner] !== controller) (node as Owned)[owner]!.refresh()
      if ((node as Owned)[owner] && (node as Owned)[owner] !== controller) throw new Error("Radio already has a group owner.")
    }
    return nodes
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
    if (message !== previous) root.dispatchEvent(new view!.CustomEvent("m:radio-group-error", { detail: { message } }))
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
      later(() => root.dispatchEvent(new view!.CustomEvent("m:radio-group-change", { detail })))
    } catch (reason) { report(reason, previous) }
  }
  function setValue(value: string | null) {
    if (!connected) throw new Error("RadioGroup is disconnected.")
    refresh()
    setRadioValue(root, value)
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
  if (!root.isConnected) throw new TypeError("RadioGroup needs a connected fieldset.")
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
