export interface AutoCompleteSuggestion { value: string; label?: string; disabled?: boolean }
export interface AutoCompleteLoadContext { readonly input: HTMLInputElement; readonly signal: AbortSignal }
export type AutoCompleteLoader = (query: string, context: AutoCompleteLoadContext) =>
  readonly (string | AutoCompleteSuggestion)[] | Promise<readonly (string | AutoCompleteSuggestion)[]>
export type AutoCompleteState = "idle" | "waiting" | "loading" | "ready" | "empty" | "error"
export interface AutoCompleteOptions {
  load?: AutoCompleteLoader
  maxResults?: number
  minLength?: number
  debounce?: number
  status?: HTMLElement
}
export interface AutoCompleteQueryResult {
  readonly status: "updated" | "skipped" | "aborted"
  readonly query: string
  readonly count: number
  readonly current: boolean
}
export interface AutoCompleteController {
  readonly input: HTMLInputElement
  readonly list: HTMLDataListElement
  readonly connected: boolean
  readonly state: AutoCompleteState
  readonly error: unknown
  query(): Promise<AutoCompleteQueryResult>
  setSuggestions(suggestions: readonly (string | AutoCompleteSuggestion)[]): void
  refresh(): void
  disconnect(): void
}

const owner = Symbol.for("markup-ui.auto-complete.owner")
type Owned = Element & { [owner]?: AutoCompleteController }
interface ListSnapshot { nodes: ChildNode[]; html: string }

/** Updates only an exclusively associated native datalist; never edits or submits its input. */
export function createAutoComplete(input: HTMLInputElement, options: AutoCompleteOptions = {}): AutoCompleteController {
  const document = input?.ownerDocument, view = document?.defaultView
  if (!view || !(input instanceof view.HTMLInputElement)) throw new TypeError("Auto Complete needs a native input.")
  if (!options || Array.isArray(options) || Object.keys(options).some(key => !["load", "maxResults", "minLength", "debounce", "status"].includes(key))
    || options.load !== undefined && typeof options.load !== "function") throw new TypeError("Unsupported Auto Complete options.")
  const { load, status } = options
  const maxResults = options.maxResults ?? 20, minLength = options.minLength ?? 1, debounce = options.debounce ?? 150
  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 100
    || !Number.isInteger(minLength) || minLength < 0 || minLength > 1000
    || !Number.isInteger(debounce) || debounce < 0 || debounce > 1000) throw new TypeError("Use maxResults 1-100, minLength 0-1000 and debounce 0-1000 milliseconds.")
  const list = input.list
  if (!(list instanceof view.HTMLDataListElement)) throw new TypeError("Author a native input list association with a datalist.")
  const listId = list.id
  function anatomy() {
    return input.isConnected && list!.isConnected && input.getRootNode() === document && list!.getRootNode() === document
      && ["text", "search", "email", "url", "tel"].includes(input.type)
      && !["role", "aria-expanded", "aria-controls", "aria-activedescendant"].some(name => input.hasAttribute(name))
      && !!listId && !/\s/.test(listId) && list!.id === listId && input.list === list && input.getAttribute("list") === listId
      && [...document!.querySelectorAll("[id]")].filter(node => node.id === listId).length === 1
      && [...document!.querySelectorAll("input[list]")].filter(node => node.getAttribute("list") === listId).length === 1
      && (!status || status instanceof view!.HTMLElement && status !== input && status !== list
        && status.isConnected && status.getRootNode() === document && ["span", "p", "div"].includes(status.localName)
        && !status.children.length && !status.isContentEditable
        && !["role", "aria-live", "tabindex"].some(name => status.hasAttribute(name))
        && !status.closest("label, button, a[href], datalist"))
  }
  if (!anatomy()) throw new TypeError("Keep one connected input per managed datalist, a stable unique list id, native semantics and optional plain nonlive status.")
  const ownedNodes = [input, list, ...(status ? [status] : [])]
  for (const node of ownedNodes) if ((node as Owned)[owner]) throw new Error("Auto Complete node already has an owner.")
  let connected = true, composing = false, compositionGeneration = 0, generation = 0, state: AutoCompleteState = "idle", error: unknown = null
  let pending: AbortController | null = null, timer: number | null = null
  const resetTasks = new Set<number>(), removers: (() => void)[] = []
  function listSnapshot(): ListSnapshot { return { nodes: [...list!.childNodes], html: list!.innerHTML } }
  function sameList(a: ListSnapshot, b: ListSnapshot) {
    return a.html === b.html && a.nodes.length === b.nodes.length && a.nodes.every((node, index) => node === b.nodes[index])
  }
  let baseline = [...list.childNodes], managed: ListSnapshot | null = null, observedList = listSnapshot()
  function inputSnapshot() {
    return { value: input.value, form: input.form, name: input.name, type: input.type,
      available: !input.matches(":disabled") && !input.readOnly && !input.closest("[hidden], [inert]") }
  }
  let observedInput = inputSnapshot()
  function sameInput(a: ReturnType<typeof inputSnapshot>, b: ReturnType<typeof inputSnapshot>) {
    return a.value === b.value && a.form === b.form && a.name === b.name && a.type === b.type && a.available === b.available
  }
  let statusText: { before: string; last: string } | null = null
  let statusAttribute: { before: string | null; last: string | null } | null = null
  function show(next: AutoCompleteState, text: string) {
    state = next
    if (!status) return
    const currentText = status.textContent ?? "", currentAttribute = status.getAttribute("data-auto-complete-state")
    if (!statusText) statusText = { before: currentText, last: currentText }
    if (!statusAttribute) statusAttribute = { before: currentAttribute, last: currentAttribute }
    if (currentText !== statusText.last) statusText.before = currentText
    if (currentAttribute !== statusAttribute.last) statusAttribute.before = currentAttribute
    status.textContent = text; statusText.last = text
    status.setAttribute("data-auto-complete-state", next); statusAttribute.last = next
  }
  function restoreStatus() {
    if (statusText && status?.textContent === statusText.last) status.textContent = statusText.before
    if (statusAttribute && status?.getAttribute("data-auto-complete-state") === statusAttribute.last) {
      if (statusAttribute.before === null) status.removeAttribute("data-auto-complete-state")
      else status.setAttribute("data-auto-complete-state", statusAttribute.before)
    }
    statusText = statusAttribute = null; state = "idle"
  }
  function restoreOptions() {
    if (managed && sameList(managed, listSnapshot())) list!.replaceChildren(...baseline)
    managed = null
    baseline = [...list!.childNodes]; observedList = listSnapshot()
  }
  function cancel() {
    const version = ++generation
    const previous = pending; pending = null
    if (timer !== null) view!.clearTimeout(timer)
    timer = null
    if (state === "waiting" || state === "loading") restoreStatus()
    previous?.abort()
    return version
  }
  function owns() { return connected && ownedNodes.every(node => (node as Owned)[owner] === api) }
  function refresh() {
    if (!connected) return
    if (!anatomy() || managed && !sameList(managed, listSnapshot())) { disconnect(); return }
    const version = cancel()
    if (!owns() || generation !== version) return
    restoreOptions(); restoreStatus(); error = null
    observedInput = inputSnapshot()
    if (!anatomy()) disconnect()
  }
  function sync() {
    if (!connected) return
    if (!anatomy()) { disconnect(); return }
    const currentList = listSnapshot()
    if (!sameList(currentList, observedList)) {
      if (managed) { disconnect(); return }
      refresh()
    } else if (!sameInput(inputSnapshot(), observedInput)) refresh()
  }
  function normalize(values: readonly (string | AutoCompleteSuggestion)[]) {
    if (!Array.isArray(values) || values.length > maxResults) throw new TypeError(`Supply an array of at most ${maxResults} suggestions.`)
    const seen = new Set<string>()
    return Object.freeze(Array.from(values, value => {
      const item = typeof value === "string" ? { value } : value
      if (!item || typeof item !== "object" || Array.isArray(item)
        || Object.keys(item).some(key => !["value", "label", "disabled"].includes(key))
        || typeof item.value !== "string" || !item.value.length || item.value.length > 2048 || seen.has(item.value)
        || item.label !== undefined && (typeof item.label !== "string" || item.label.length > 2048)
        || item.disabled !== undefined && typeof item.disabled !== "boolean") throw new TypeError("Suggestions need unique nonempty string values (up to 2048 characters), optional string labels and boolean disabled.")
      seen.add(item.value)
      return Object.freeze({ value: item.value, ...(item.label !== undefined ? { label: item.label } : {}),
        ...(item.disabled !== undefined ? { disabled: item.disabled } : {}) })
    }))
  }
  function replace(values: readonly Readonly<AutoCompleteSuggestion>[]) {
    const nodes = values.map(value => {
      const option = document!.createElement("option")
      option.value = value.value
      if (value.label !== undefined) option.label = value.label
      option.disabled = value.disabled ?? false
      return option
    })
    list!.replaceChildren(...nodes)
    managed = observedList = listSnapshot()
    show(values.length ? "ready" : "empty", values.length ? `${values.length} suggestions supplied.` : "No suggestions supplied; free text is still allowed.")
  }
  function setSuggestions(suggestions: readonly (string | AutoCompleteSuggestion)[]) {
    const values = normalize(suggestions)
    sync()
    if (!connected) throw new Error("Auto Complete is disconnected.")
    const version = generation + 1
    refresh()
    if (!owns() || generation !== version) throw new Error("Auto Complete update was superseded or disconnected.")
    replace(values)
  }
  function report(reason: unknown, query: string) {
    input.dispatchEvent(new view!.CustomEvent("mui:auto-complete-error", { detail: { error: reason, query } }))
  }
  async function query(): Promise<AutoCompleteQueryResult> {
    sync()
    if (!connected) throw new Error("Auto Complete is disconnected.")
    const version = generation + 1, requested = input.value
    refresh()
    if (!owns() || generation !== version) return Object.freeze({ status: "aborted", query: requested, count: 0, current: false })
    const snapshot = inputSnapshot(), query = snapshot.value
    let resultList = listSnapshot()
    const current = () => connected && generation === version && anatomy() && sameInput(snapshot, inputSnapshot()) && sameList(resultList, listSnapshot())
    function result(status: AutoCompleteQueryResult["status"], count = 0): AutoCompleteQueryResult {
      return Object.freeze({ status, query, count, get current() { return status !== "aborted" && current() } })
    }
    if (!load || composing || !snapshot.available || query.length < minLength) return result("skipped")
    const controller = new view!.AbortController(), signal = controller.signal
    pending = controller
    show("loading", "Loading suggestions…")
    let remove = () => {}
    const cancelled = new Promise<null>(resolve => {
      const abort = () => resolve(null)
      signal.addEventListener("abort", abort, { once: true })
      remove = () => signal.removeEventListener("abort", abort)
    })
    const loading = Promise.resolve().then(() => signal.aborted ? null : load(query, Object.freeze({ input, signal })))
      .then(values => values === null && signal.aborted ? null : normalize(values as readonly (string | AutoCompleteSuggestion)[]))
      .catch(reason => {
        if (signal.aborted && reason instanceof view!.DOMException && reason.name === "AbortError") return null
        report(reason, query); throw reason
      })
    try {
      const values = await Promise.race([loading, cancelled])
      if (signal.aborted || !current() || values === null) {
        if (generation === version) refresh()
        return result("aborted")
      }
      replace(values); resultList = listSnapshot(); pending = null
      const completed = result("updated", values.length)
      input.dispatchEvent(new view!.CustomEvent("mui:auto-complete-results", { detail: { query, suggestions: values, result: completed } }))
      return completed
    } catch (reason) {
      if (current()) { pending = null; error = reason; show("error", "Suggestions could not be loaded; free text is still allowed.") }
      else if (generation === version) refresh()
      throw reason
    } finally { remove() }
  }
  function schedule() {
    const version = generation + 1
    refresh()
    if (!owns() || generation !== version || !load || composing || !observedInput.available || input.value.length < minLength) return
    show("waiting", "Waiting to query suggestions…")
    timer = view!.setTimeout(() => {
      timer = null
      sync()
      if (!connected || generation !== version) return
      // Loader failures have an explicit error event; event-driven work has no caller promise.
      void query().catch(() => {})
    }, debounce)
  }
  function listen(node: EventTarget, type: string, handler: EventListener, capture = false) {
    node.addEventListener(type, handler, capture); removers.push(() => node.removeEventListener(type, handler, capture))
  }
  const observer = new view.MutationObserver(sync)
  function disconnect() {
    if (!connected) return
    connected = false; observer.disconnect()
    removers.splice(0).forEach(remove => remove())
    resetTasks.forEach(id => view!.clearTimeout(id)); resetTasks.clear()
    restoreOptions(); restoreStatus()
    for (const node of ownedNodes) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
    cancel()
  }
  const api: AutoCompleteController = { input, list, get connected() { return connected }, get state() { return state }, get error() { return error },
    query, setSuggestions, refresh, disconnect }
  for (const node of ownedNodes) Object.defineProperty(node, owner, { value: api, configurable: true })
  listen(input, "input", event => { if ((event as InputEvent).isComposing) composing = true; schedule() })
  listen(input, "change", () => { if (!sameInput(inputSnapshot(), observedInput)) schedule() })
  listen(input, "compositionstart", () => { compositionGeneration++; composing = true; refresh() })
  listen(input, "compositionend", () => { compositionGeneration++; composing = false; schedule() })
  listen(document!, "reset", event => {
    if (event.target !== input.form) return
    const composition = compositionGeneration, version = cancel()
    if (!owns() || generation !== version) return
    const id = view!.setTimeout(() => {
      resetTasks.delete(id)
      if (!connected || event.defaultPrevented) return
      if (compositionGeneration === composition) composing = false
      if (generation === version) refresh()
    }, 0)
    resetTasks.add(id)
  }, true)
  observer.observe(document!, { childList: true, subtree: true, characterData: true, attributes: true,
    attributeFilter: ["id", "list", "type", "name", "form", "disabled", "readonly", "hidden", "inert", "value", "label",
      "role", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-live", "tabindex", "contenteditable"] })
  return api
}
