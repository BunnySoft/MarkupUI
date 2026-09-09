export type SelectValue = string | null | string[]
export interface SelectController {
  readonly control: HTMLSelectElement
  readonly filter: HTMLInputElement | null
  readonly connected: boolean
  readonly error: string | null
  readonly value: SelectValue
  setValue(value: string | null | readonly string[]): void
  setFilter(value: string): void
  clear(): boolean
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.select.owner")
type Owned = Element & { [owner]?: SelectController }
interface Attribute { node: Element; name: string; before: string | null; base: string | null; last: string | null }

/** Enhances authored options without replacing the native select or its editing engine. */
export function createSelect(root: HTMLElement): SelectController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement)) throw new TypeError("Select needs an authored root.")
  if ((root as Owned)[owner]) throw new Error("Select root already has an owner.")
  const own = (node: Element) => node.closest("[data-select]") === root
  function one(selector: string, required = false): HTMLElement | null {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Select needs ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const field = one("[data-select-control]", true)
  if (!(field instanceof view.HTMLSelectElement)) throw new TypeError("Select requires an authored native select.")
  const control = field, multiple = control.multiple
  const clearButton = one("[data-select-clear]") as HTMLButtonElement | null
  const filter = one("[data-select-filter]") as HTMLInputElement | null
  const search = one("[data-select-search]"), empty = one("[data-select-empty]")
  if ((control as Owned)[owner] || filter && (filter as Owned)[owner]) throw new Error("Native Select control/filter already has an owner.")
  let connected = true, composing = false, pattern = "", error: string | null = null
  let options: HTMLOptionElement[] = [], groups: HTMLOptGroupElement[] = [], placeholder: HTMLOptionElement | null = null
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>()
  function label(node: HTMLSelectElement | HTMLInputElement) {
    return [...node.labels ?? []].some(item => item.textContent?.trim())
  }
  function validate() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-select[data-select]")
      || root.hasAttribute("role") || root.hasAttribute("tabindex") || root.closest("label, button, a[href], summary")
      || [control, clearButton, filter, search, empty].some(node => node && (!root.contains(node) || !own(node)))) {
      throw new TypeError("Keep Select in its connected light-DOM root, outside labels/interactive wrappers, with no wrapper role/tabindex.")
    }
    if (!label(control) || control.hasAttribute("role") || control.hasAttribute("readonly")) {
      throw new TypeError("Use a labelled native select; no replacement role or fictitious readonly attribute.")
    }
    if (control.multiple !== multiple) throw new TypeError("Select multiple mode changed; disconnect and create a new controller.")
    if (clearButton && (!(clearButton instanceof view!.HTMLButtonElement) || clearButton.getAttribute("type")?.toLowerCase() !== "button"
      || !(clearButton.getAttribute("aria-label")?.trim() || clearButton.textContent?.trim())
      || clearButton.parentElement?.closest("label, button, a[href], summary") || clearButton.hasAttribute("role")
      || clearButton.getAttribute("aria-hidden") === "true"
      || clearButton.hasAttribute("popovertarget") || clearButton.hasAttribute("commandfor")
      || clearButton.querySelector("input, button, select, textarea, a[href], [tabindex], [contenteditable], [role]"))) {
      throw new TypeError("Clear requires a named native type=button without nested interaction or other commands.")
    }
    if (filter && (!(filter instanceof view!.HTMLInputElement) || !["text", "search"].includes(filter.type)
      || !label(filter) || filter.hasAttribute("role") || !search?.contains(filter)
      || search.contains(control) || clearButton && search.contains(clearButton)
      || !multiple && control.size < 2)) throw new TypeError("Literal filtering needs a labelled native text/search input in data-select-search and a native list (multiple or size >= 2).")
    if (search && !filter) throw new TypeError("A search enhancement region needs its native filter input.")
    if (empty && (empty.hasAttribute("aria-live") || empty.hasAttribute("role") || empty.contains(control))) throw new TypeError("Empty content is authored text, not a live popup/validator.")
    const next = [...control.options], nextGroups = [...control.querySelectorAll("optgroup")]
    const keys = new Set<string>()
    for (const option of next) {
      if (!option.hasAttribute("value") || keys.has(option.value)) throw new TypeError("Every option needs an explicit unique native string value, including an empty-string option.")
      if (option.parentElement !== control && !(option.parentElement instanceof view!.HTMLOptGroupElement && option.parentElement.parentElement === control)) {
        throw new TypeError("Use direct options or one native optgroup level.")
      }
      keys.add(option.value)
    }
    for (const group of nextGroups) if (group.parentElement !== control || !group.label.trim()) throw new TypeError("Use direct optgroups with nonempty native labels.")
    const placeholders = next.filter(option => option.hasAttribute("data-select-placeholder"))
    if (placeholders.length > 1 || placeholders.length && (multiple || control.size > 1 || placeholders[0] !== next[0]
      || placeholders[0]!.parentElement !== control || placeholders[0]!.value !== "")) {
      throw new TypeError("A placeholder marker needs the first direct empty-value option of a single dropdown.")
    }
    return { next, nextGroups, placeholder: placeholders[0] ?? null }
  }
  function lease(node: Element, name: string, enhancement = false) {
    let item = attributes.find(item => item.node === node && item.name === name)
    if (!item) {
      const before = node.getAttribute(name)
      item = { node, name, before, base: enhancement ? null : before, last: before }; attributes.push(item)
    }
    return item
  }
  function write(item: Attribute, value: string | null) {
    if (item.node.getAttribute(item.name) !== value) {
      if (value === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, value)
    }
    item.last = value
  }
  function restore(item: Attribute) {
    if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
  }
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const item = attributes.find(item => item.node === record.target && item.name === record.attributeName)
      if (item) item.before = item.base = item.last = item.node.getAttribute(item.name)
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    if (!root.isConnected || root.getRootNode() !== document || !root.contains(control)) { disconnect(); return }
    attemptRefresh()
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["hidden", "disabled", "readonly", "multiple", "size", "value", "selected", "label", "form",
        "type", "role", "aria-disabled", "aria-readonly", "data-select-placeholder"] })
    for (let node = root.parentElement; node; node = node.parentElement) observer.observe(node, { childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"] })
  }
  function current(): SelectValue {
    return multiple ? [...control.selectedOptions].map(option => option.value) : control.selectedIndex < 0 ? null : control.value
  }
  function canClear() {
    return connected && !control.matches(":disabled") && !control.hasAttribute("readonly")
      && control.getAttribute("aria-readonly") !== "true" && control.getAttribute("aria-disabled") !== "true"
      && !control.closest("[hidden], [inert]")
  }
  function hasSelection() { return [...control.selectedOptions].some(option => option !== placeholder) }
  function refresh() {
    if (!connected) return
    pause()
    try {
      const state = validate()
      options = state.next; groups = state.nextGroups; placeholder = state.placeholder; error = null
      for (let i = attributes.length - 1; i >= 0; i--) {
        const item = attributes[i]!
        if ((item.node instanceof view!.HTMLOptionElement || item.node instanceof view!.HTMLOptGroupElement)
          && !options.includes(item.node as HTMLOptionElement) && !groups.includes(item.node as HTMLOptGroupElement)) {
          restore(item); attributes.splice(i, 1)
        }
      }
      if (filter && !composing) pattern = filter.value.trim().toLowerCase()
      let matches = 0
      for (const option of options) {
        const group = option.parentElement instanceof view!.HTMLOptGroupElement ? option.parentElement : null
        const matched = !filter || `${option.label} ${group?.label ?? ""}`.toLowerCase().includes(pattern)
        const hidden = filter ? lease(option, "hidden") : null
        if (hidden) write(hidden, hidden.base !== null || !option.selected && !matched ? hidden.base ?? "" : null)
        if (option !== placeholder && matched && (hidden ? hidden.base === null : !option.hidden)
          && (!group || (filter ? lease(group, "hidden").base === null : !group.hidden))) matches++
      }
      if (filter) for (const group of groups) {
        const hidden = lease(group, "hidden")
        write(hidden, hidden.base !== null || !!pattern && [...group.children].filter(node => node instanceof view!.HTMLOptionElement).every(node => (node as HTMLOptionElement).hidden)
          ? hidden.base ?? "" : null)
      }
      if (search) { const hidden = lease(search, "hidden", true); write(hidden, hidden.base) }
      if (empty) { const hidden = lease(empty, "hidden", true); write(hidden, matches ? hidden.base ?? "" : hidden.base) }
      if (clearButton) {
        const hidden = lease(clearButton, "hidden", true), disabled = lease(clearButton, "disabled")
        const hide = !hasSelection() || hidden.base !== null
        if (hide && document!.activeElement === clearButton && canClear()) {
          control.focus({ preventScroll: true }); if (!connected) return
        }
        write(hidden, hide ? hidden.base ?? "" : null)
        write(disabled, canClear() ? disabled.base : disabled.base ?? "")
      }
    } catch (reason) {
      error = reason instanceof Error ? reason.message : String(reason)
      if (control.multiple !== multiple) disconnect()
      throw reason
    } finally { observe() }
  }
  function report(reason: unknown, previous: string | null) {
    error = reason instanceof Error ? reason.message : String(reason)
    if (previous !== error) root.dispatchEvent(new view!.CustomEvent("mui:select-error", { detail: { message: error } }))
  }
  function attemptRefresh() { const previous = error; try { refresh() } catch (reason) { report(reason, previous) } }
  function setValue(value: string | null | readonly string[]) {
    if (!connected) throw new Error("Select is disconnected.")
    refresh()
    const keys = multiple ? value : value === null ? [] : [value]
    if (!Array.isArray(keys) || !multiple && Array.isArray(value) || keys.some(key => typeof key !== "string")
      || new Set(keys).size !== keys.length || keys.some(key => !options.some(option => option.value === key))) {
      throw new TypeError("Use an existing string/null for single mode or unique existing strings[] for multiple mode.")
    }
    if (multiple) {
      for (const option of options) { const selected = keys.includes(option.value); if (option.selected !== selected) option.selected = selected }
    } else if (value === null) control.selectedIndex = -1
    else if (current() !== value) control.value = value as string
    refresh()
  }
  function setFilter(value: string) {
    if (!connected || !filter) throw new Error("Select has no connected filter.")
    if (typeof value !== "string") throw new TypeError("Filter needs a literal string.")
    if (composing) throw new view!.DOMException("Do not replace a composing filter draft.", "InvalidStateError")
    filter.value = value; refresh()
  }
  function clear() {
    refresh()
    if (!canClear() || !hasSelection()) return false
    const previous = current()
    if (document!.activeElement === clearButton) control.focus({ preventScroll: true })
    if (!canClear()) return false
    setValue(multiple ? [] : placeholder ? "" : null)
    control.dispatchEvent(new view!.Event("input", { bubbles: true, composed: true }))
    control.dispatchEvent(new view!.Event("change", { bubbles: true }))
    control.dispatchEvent(new view!.CustomEvent("mui:select-clear", { bubbles: true, detail: { previous } }))
    return true
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => { tasks.delete(id); if (connected) callback() }, 0); tasks.add(id)
  }
  function listen(node: EventTarget, type: string, callback: EventListener, capture = false) {
    node.addEventListener(type, callback, capture); removers.push(() => node.removeEventListener(type, callback, capture))
  }
  function disconnect() {
    if (!connected) return
    pause(); connected = false
    removers.splice(0).forEach(remove => remove())
    tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    const active = document!.activeElement
    if ((filter && active === filter && search && lease(search, "hidden").before !== null
      || clearButton && active === clearButton && lease(clearButton, "hidden").before !== null)
      && control.isConnected && !control.matches(":disabled") && !control.closest("[hidden], [inert]")) control.focus({ preventScroll: true })
    attributes.forEach(restore)
    for (const node of [root, control, filter] as (Owned | null)[]) if (node?.[owner] === controller) delete node[owner]
  }
  const controller: SelectController = {
    control, filter, get connected() { return connected }, get error() { return error },
    get value() { if (!connected) throw new Error("Select is disconnected."); validate(); return current() },
    setValue, setFilter, clear, refresh, disconnect,
  }
  validate()
  for (const node of [root, control, filter]) if (node) Object.defineProperty(node, owner, { value: controller, configurable: true })
  listen(control, "input", attemptRefresh); listen(control, "change", attemptRefresh)
  if (clearButton) listen(clearButton, "click", event => later(() => {
    if (!event.defaultPrevented && !clearButton.disabled && !clearButton.hidden && !clearButton.matches(":disabled")) {
      const previous = error; try { clear() } catch (reason) { report(reason, previous) }
    }
  }))
  if (filter) {
    listen(filter, "input", event => { if (!(event instanceof view!.InputEvent && event.isComposing)) attemptRefresh() })
    listen(filter, "compositionstart", () => { composing = true })
    listen(filter, "compositionend", () => { composing = false; attemptRefresh() })
    listen(filter, "change", attemptRefresh)
  }
  listen(document!, "reset", event => {
    if (event.target === control.form || filter && event.target === filter.form) later(() => {
      if (!event.defaultPrevented && filter?.form === event.target) composing = false
      attemptRefresh()
    })
  }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return controller
}
