export type DataTableScope = "page" | "filtered" | "all"
export interface DataTableColumn {
  key: string
  compare?: (left: HTMLTableRowElement, right: HTMLTableRowElement) => number
  filter?: (row: HTMLTableRowElement, value: string) => boolean
}
export interface DataTableSummary {
  key: string
  scope: DataTableScope
  value: (rows: readonly HTMLTableRowElement[]) => string
}
export interface DataTableSort { readonly key: string; readonly order: "ascending" | "descending" }
export interface DataTableValues {
  sort?: DataTableSort | null
  filters?: Readonly<Record<string, string>> | null
  page?: number
  pageSize?: number | null
  loading?: boolean
}
export interface DataTableOptions extends DataTableValues {
  columns: readonly DataTableColumn[]
  summaries?: readonly DataTableSummary[]
}
export interface DataTableState {
  readonly sourceKeys: readonly string[]
  readonly filteredKeys: readonly string[]
  readonly visibleKeys: readonly string[]
  readonly checkedKeys: readonly string[]
  readonly sort: DataTableSort | null
  readonly filters: Readonly<Record<string, string>>
  readonly page: number
  readonly pageSize: number | null
  readonly pageCount: number
  readonly total: number
  readonly loading: boolean
}
export interface DataTableChange {
  readonly source: "sort" | "filter" | "page" | "page-size" | "selection"
  readonly state: DataTableState
  readonly event: Event
}
export interface DataTableController {
  readonly table: HTMLTableElement
  readonly connected: boolean
  readonly error: unknown
  readonly state: DataTableState
  set(values: DataTableValues): void
  setCheckedKeys(keys: readonly string[]): void
  select(scope: DataTableScope, checked: boolean): void
  refresh(options?: { sourceOrder?: readonly string[] }): void
  reveal(key: string): HTMLTableRowElement
  revealAll(): void
  disconnect(): void
}
interface Row { key: string; element: HTMLTableRowElement; check: HTMLInputElement | null; excluded: boolean }
interface Attribute { node: HTMLElement; name: string; before: string | null; last: string | null }
interface Property { node: HTMLInputElement; name: "checked" | "indeterminate"; before: boolean; last: boolean }
type FilterControl = HTMLInputElement | HTMLSelectElement
const owner = Symbol.for("markup-ui.data-table.owner"), checkboxOwner = Symbol.for("markup-ui.checkbox-group.owner")
type Owned = Element & { [owner]?: object; [checkboxOwner]?: object }
const scopes: readonly string[] = ["page", "filtered", "all"]

/** Enhances original native rows; never renders cells or serializes application data. */
export function createDataTable(root: HTMLElement, options: DataTableOptions): DataTableController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches(".mui-data-table[data-data-table]")
    || !["div", "section"].includes(root.localName) || (root as Owned)[owner]) throw new TypeError("Use an unowned native div/section.mui-data-table[data-data-table].")
  const token = {}
  function object(value: unknown, keys: readonly string[]) {
    if (!value || typeof value !== "object" || Array.isArray(value)
      || Object.keys(value).some(key => !keys.includes(key))) throw new TypeError("Unsupported Data Table configuration.")
  }
  object(options, ["columns", "summaries", "sort", "filters", "page", "pageSize", "loading"])
  function key(value: unknown): asserts value is string {
    if (typeof value !== "string" || !value || value.length > 256) throw new TypeError("Use explicit nonempty string keys of at most 256 characters.")
  }
  const own = (node: Element) => node.closest("[data-data-table]") === root
  const find = (selector: string) => [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
  function one(selector: string, required = false) {
    const nodes = find(selector)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const tableNode = one("table[data-data-table-table]", true)
  if (!(tableNode instanceof view.HTMLTableElement) || !tableNode.classList.contains("mui-table")) throw new TypeError("Author a real table.mui-table[data-data-table-table].")
  const table = tableNode, bodyNode = table.tBodies[0], headNode = table.tHead
  if (!bodyNode || !headNode) throw new TypeError("Author native thead and tbody.")
  const body = bodyNode, head = headNode
  const headerCells = [...head.rows[0]?.cells ?? []]
  const inTable = (node: Element) => node.closest("table") === table
  const columns = new Map<string, Readonly<DataTableColumn>>()
  if (!Array.isArray(options.columns) || options.columns.length > 64) throw new TypeError("Provide at most 64 column operation records.")
  for (const column of options.columns) {
    object(column, ["key", "compare", "filter"]); key(column.key)
    if (columns.has(column.key) || column.compare !== undefined && typeof column.compare !== "function"
      || column.filter !== undefined && typeof column.filter !== "function") throw new TypeError("Column keys must be unique with explicit synchronous callbacks.")
    columns.set(column.key, Object.freeze({ ...column }))
  }
  const headers = new Map<string, HTMLTableCellElement>(), sortButtons = new Map<HTMLButtonElement, string>()
  const filters = new Map<string, FilterControl>(), pages = new Map<HTMLButtonElement, "previous" | "next">()
  function named(node: HTMLElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => document!.getElementById(id)?.textContent?.trim())
      || [...(node as HTMLInputElement).labels ?? []].some(label => label.textContent?.trim()))
  }
  function button(node: HTMLElement): asserts node is HTMLButtonElement {
    if (!(node instanceof view!.HTMLButtonElement) || node.getAttribute("type") !== "button"
      || !(node.textContent?.trim() || named(node)) || node.hasAttribute("role") || node.hasAttribute("popovertarget")
      || node.hasAttribute("commandfor") || node.querySelector("input,select,textarea,button,a,[tabindex]")
      || node.closest("label,summary")) throw new TypeError("Actions need named native type=button controls.")
  }
  for (const node of find("[data-data-column]").filter(inTable)) {
    const name = node.getAttribute("data-data-column")!; key(name)
    if (!(node instanceof view.HTMLTableCellElement) || node.localName !== "th" || !head.contains(node) || node.scope !== "col" || headers.has(name)) throw new TypeError("Column keys identify distinct native th[scope=col] headers.")
    headers.set(name, node)
  }
  for (const name of columns.keys()) if (!headers.has(name)) throw new TypeError("Every operation column needs an authored keyed header.")
  for (const node of find("[data-data-sort]")) {
    button(node)
    const name = node.getAttribute("data-data-sort")!
    if (!columns.get(name)?.compare || node.closest("th") !== headers.get(name) || !inTable(node)
      || [...sortButtons.values()].includes(name)) throw new TypeError("Sort buttons need a unique column and explicit comparator.")
    sortButtons.set(node, name)
  }
  for (const node of find("[data-data-filter]")) {
    const name = node.getAttribute("data-data-filter")!
    if (!(node instanceof view.HTMLInputElement && ["text", "search"].includes(node.type)
      || node instanceof view.HTMLSelectElement && !node.multiple) || !named(node) || node.hasAttribute("role")
      || filters.has(name) || !columns.get(name)?.filter || inTable(node)) throw new TypeError("Filters need labelled native text/search inputs or single selects outside the table.")
    filters.set(name, node)
  }
  for (const node of find("[data-data-page]")) {
    button(node)
    const action = node.getAttribute("data-data-page")
    if (!["previous", "next"].includes(action!) || [...pages.values()].includes(action as "previous") || inTable(node)) throw new TypeError("Author at most one previous and next page button outside the table.")
    pages.set(node, action as "previous" | "next")
  }
  const sizeNode = one("[data-data-page-size]"), count = one("[data-data-count]"), empty = one("[data-data-empty]"), loading = one("[data-data-loading]")
  if (sizeNode && (!(sizeNode instanceof view.HTMLSelectElement) || sizeNode.multiple || !named(sizeNode) || inTable(sizeNode))) throw new TypeError("Page size needs a labelled native single select outside the table.")
  const size = sizeNode as HTMLSelectElement | null
  if ([count, empty, loading].some(node => node && (node.childElementCount || inTable(node) || node.closest("button,label")))) throw new TypeError("Count/empty/loading regions must be plain text outside the table.")
  const allNode = one("[data-data-check-all]")
  function checkbox(node: HTMLElement): asserts node is HTMLInputElement {
    if (!(node instanceof view!.HTMLInputElement) || node.type !== "checkbox" || !named(node)
      || node.hasAttribute("role") || (node as Owned)[checkboxOwner] && (node as Owned)[checkboxOwner] !== token) throw new TypeError("Use labelled native checkboxes, not another CheckboxGroup's controls.")
  }
  if (allNode) {
    checkbox(allNode)
    if (!head.contains(allNode) || !inTable(allNode) || allNode.name || allNode.required
      || !scopes.includes(allNode.getAttribute("data-data-scope")!)) throw new TypeError("Header selection is unnamed, non-required and has an explicit page/filtered/all scope.")
  }
  const all = allNode as HTMLInputElement | null
  const summaries: { config: Readonly<DataTableSummary>; node: HTMLElement }[] = []
  if (options.summaries !== undefined && !Array.isArray(options.summaries)) throw new TypeError("Summaries must be an array.")
  for (const config of options.summaries ?? []) {
    object(config, ["key", "scope", "value"]); key(config.key)
    const nodes = find("[data-data-summary]").filter(node => inTable(node) && node.getAttribute("data-data-summary") === config.key)
    if (nodes.length !== 1 || !table.tFoot?.contains(nodes[0]!) || nodes[0]!.localName !== "span" || nodes[0]!.childElementCount
      || summaries.some(item => item.config.key === config.key) || !scopes.includes(config.scope) || typeof config.value !== "function") throw new TypeError("Each summary needs a unique text-only tfoot span, explicit scope and synchronous text callback.")
    summaries.push({ config: Object.freeze({ ...config }), node: nodes[0]! })
  }
  const attributes: Attribute[] = [], properties: Property[] = [], borrowed = new Set<HTMLElement>()
  let rows: Row[] = [], filtered: Row[] = [], visible: Row[] = []
  let connected = true, busy = false, pendingReset = false, error: unknown = null, lastFocus: HTMLElement | null = null
  let current: Required<DataTableValues> = { sort: null, filters: {}, page: 1, pageSize: null, loading: false }
  let pageCount = 0
  const composing = new Set<FilterControl>()
  function live() { if (!connected) throw new Error("Data Table is disconnected.") }
  function synchronous(result: unknown) {
    if (result && (typeof result === "object" || typeof result === "function") && typeof (result as { then?: unknown }).then === "function") {
      void Promise.resolve(result).catch(() => {})
      throw new TypeError("Data Table callbacks must be synchronous.")
    }
    live()
  }
  function guard() { live(); if (busy || pendingReset) throw new Error("Data Table operations cannot reenter callbacks or pending native reset.") }
  function attr(node: HTMLElement, name: string, value: string | null) {
    let record = attributes.find(record => record.node === node && record.name === name)
    if (!record) { record = { node, name, before: node.getAttribute(name), last: node.getAttribute(name) }; attributes.push(record) }
    if (node.getAttribute(name) !== record.last) record.before = node.getAttribute(name)
    if (value === null) node.removeAttribute(name); else node.setAttribute(name, value)
    record.last = value
  }
  function original(node: HTMLElement, name: string) {
    const record = attributes.find(record => record.node === node && record.name === name)
    return record && node.getAttribute(name) === record.last ? record.before : node.getAttribute(name)
  }
  function prop(node: HTMLInputElement, name: Property["name"], value: boolean) {
    let record = properties.find(record => record.node === node && record.name === name)
    if (!record) { record = { node, name, before: node[name], last: node[name] }; properties.push(record) }
    if (node[name] !== record.last) record.before = node[name]
    node[name] = record.last = value
  }
  function lease(node: HTMLElement) {
    if ((node as Owned)[owner] && (node as Owned)[owner] !== token) throw new Error("Native Data Table node already has an owner.")
    borrowed.add(node); (node as Owned)[owner] = token
    if (node instanceof view!.HTMLInputElement && node.type === "checkbox"
      && (node === all || node.hasAttribute("data-data-check"))) (node as Owned)[checkboxOwner] = token
  }
  const anatomy = [table, head, body, ...headers.values(), ...sortButtons.keys(), ...filters.values(), ...pages.keys(), size, count, empty, loading, all, ...summaries.map(item => item.node)].filter((node): node is HTMLElement => !!node)
  function collect(): Row[] {
    if (!root.isConnected || root.getRootNode() !== document || root.hasAttribute("role")
      || !root.matches(".mui-data-table[data-data-table]") || !table.classList.contains("mui-table")
      || one("table[data-data-table-table]", true) !== table || table.tHead !== head || table.tBodies.length !== 1 || table.tBodies[0] !== body
      || head.rows.length !== 1 || head.rows[0]!.cells.length < 1 || head.rows[0]!.cells.length > 64
      || head.rows[0]!.cells.length !== headerCells.length || [...head.rows[0]!.cells].some((cell, index) => cell !== headerCells[index])
      || anatomy.some(node => !root.contains(node) || !own(node) || (node as Owned)[owner] && (node as Owned)[owner] !== token)
      || [table, head, body, ...head.rows, ...head.rows[0]!.cells].some(node => node.hasAttribute("role"))
      || [...head.rows[0]!.cells].some(cell => cell.localName !== "th" || cell.scope !== "col" || cell.colSpan !== 1 || cell.rowSpan !== 1)
      || [...body.children].some(node => !["tr", "template"].includes(node.localName))) throw new TypeError("Keep one native single-row unspanned header and one tbody; enhanced body spans/group headers are unsupported.")
    for (const [name, node] of headers) if (node.getAttribute("data-data-column") !== name || !head.contains(node)) throw new TypeError("Column identity changed; rebind the table.")
    for (const [node, name] of sortButtons) {
      button(node)
      if (node.getAttribute("data-data-sort") !== name || node.closest("th") !== headers.get(name)) throw new TypeError("Sort anatomy changed.")
    }
    for (const [node, action] of pages) { button(node); if (node.getAttribute("data-data-page") !== action) throw new TypeError("Pager identity changed.") }
    for (const [name, node] of filters) {
      if (node.getAttribute("data-data-filter") !== name || !named(node) || node.hasAttribute("role")
        || node instanceof view!.HTMLInputElement && !["text", "search"].includes(node.type)
        || node instanceof view!.HTMLSelectElement && (node.multiple || ![...node.options].some(option => option.value === ""))) throw new TypeError("Keep labelled filter controls; selects need an empty-value clear option.")
    }
    if (size) {
      const sizes = [...size.options].map(option => parseSize(option.value))
      if (size.multiple || !named(size) || size.hasAttribute("role") || !sizes.includes(null) || new Set(sizes).size !== sizes.length
        || sizes.some(value => value !== null && (!Number.isSafeInteger(value) || value < 1 || value > 2000))) throw new TypeError("Page-size select needs unique sizes 1..2000 and an all option for revealAll.")
    }
    if ([...head.rows[0]!.cells].some(cell => cell.hasAttribute("aria-sort") && !headers.has(cell.getAttribute("data-data-column")!))) throw new TypeError("Only operation headers may own aria-sort.")
    if (find("[data-data-sort]").length !== sortButtons.size || find("[data-data-filter]").length !== filters.size
      || find("[data-data-page]").length !== pages.size || one("[data-data-check-all]") !== all
      || one("[data-data-page-size]") !== size || one("[data-data-count]") !== count || one("[data-data-empty]") !== empty
      || one("[data-data-loading]") !== loading) throw new TypeError("Control anatomy changed; disconnect and rebind explicitly.")
    if (all) { checkbox(all); if (!head.contains(all) || !inTable(all) || all.name || all.required || !scopes.includes(all.getAttribute("data-data-scope")!)) throw new TypeError("Keep explicit unnamed header selection scope.") }
    if ([count, empty, loading].some(node => node && (node.childElementCount || inTable(node) || node.closest("button,label")))) throw new TypeError("Keep plain-text count/empty/loading regions outside the table.")
    if (summaries.some(item => !table.tFoot?.contains(item.node) || item.node.childElementCount || item.node.getAttribute("data-data-summary") !== item.config.key)) throw new TypeError("Keep plain-text footer summary spans and their original keys.")
    if (body.rows.length > 2000) throw new RangeError("Use at most 2000 native rows; this is not virtualization.")
    const next: Row[] = [], keys = new Set<string>()
    for (const element of [...body.rows]) {
      const name = element.getAttribute("data-data-key"); key(name)
      if (keys.has(name) || next.length >= 2000 || element.hasAttribute("role") || element.hasAttribute("is")
        || element.getAttribute("hidden") === "until-found" || element.cells.length !== head.rows[0]!.cells.length
        || [...element.cells].some(cell => cell.colSpan !== 1 || cell.rowSpan !== 1 || cell.hasAttribute("role"))) throw new TypeError("Use at most 2000 uniquely keyed native rows, with exactly one unspanned cell per header; hidden=until-found is unsupported.")
      const prior = rows.find(row => row.element === element)
      if (prior && prior.key !== name) throw new TypeError("An owned row key is immutable; replace the row explicitly.")
      const checks = [...element.querySelectorAll<HTMLElement>("[data-data-check]")].filter(node => own(node) && inTable(node))
      if (checks.length > 1) throw new TypeError("Use at most one selection checkbox per row.")
      const check = checks[0] as HTMLInputElement ?? null
      if (check) { checkbox(check); if (check.value !== name || !check.hasAttribute("value")) throw new TypeError("Selection checkbox value must equal its row key.") }
      for (const node of [element, check]) if (node && (node as Owned)[owner] && (node as Owned)[owner] !== token) throw new Error("A row or checkbox already has an owner.")
      keys.add(name); next.push({ key: name, element, check, excluded: original(element, "hidden") !== null })
    }
    if (all && next.some(row => !row.check)) throw new TypeError("Header selection requires one checkbox on every data row.")
    return next
  }
  function parseSize(value: string) {
    if (value === "all") return null
    if (!/^[1-9]\d*$/.test(value)) throw new TypeError("Page sizes must be decimal integers or all.")
    return Number(value)
  }
  function values(input: DataTableValues) {
    object(input, ["sort", "filters", "page", "pageSize", "loading"])
    const result = { ...current, ...input }
    if (result.sort !== null) {
      object(result.sort, ["key", "order"])
      if (!columns.get(result.sort.key)?.compare || !["ascending", "descending"].includes(result.sort.order)) throw new TypeError("Sort needs a known comparator column and ascending/descending, or null.")
      result.sort = Object.freeze({ ...result.sort })
    }
    const query = result.filters === null ? {} : result.filters
    if (!query || typeof query !== "object" || Array.isArray(query)) throw new TypeError("Filters need a string record or null.")
    for (const [name, value] of Object.entries(query)) if (!columns.get(name)?.filter || typeof value !== "string" || value.length > 1024) throw new TypeError("Filters need known predicate columns and strings up to 1024 characters.")
    result.filters = Object.freeze(Object.assign(Object.create(null), query))
    if (!Number.isSafeInteger(result.page) || result.page < 1 || result.pageSize !== null && (!Number.isSafeInteger(result.pageSize) || result.pageSize < 1 || result.pageSize > 2000)
      || typeof result.loading !== "boolean") throw new RangeError("Page is a positive safe integer; pageSize is 1..2000 or null; loading is boolean.")
    if (size && ![...size.options].some(option => parseSize(option.value) === result.pageSize)) throw new RangeError("Page size must exist in the authored select.")
    for (const [name, control] of filters) {
      const value = result.filters![name] ?? ""
      if (composing.has(control) && control.value !== value) throw new Error("Do not replace a composing filter draft.")
      if (control instanceof view!.HTMLSelectElement && ![...control.options].some(option => option.value === value)) throw new RangeError("Filter value must exist in the native select.")
    }
    return result
  }
  function scopeRows(scope: DataTableScope, source = rows, matches = filtered, page = visible) {
    if (!scopes.includes(scope)) throw new TypeError("Selection/summary scope must be page, filtered or all.")
    return scope === "all" ? source : scope === "filtered" ? matches : page
  }
  function plan(next: Row[], config: Required<DataTableValues>) {
    const matches = next.filter(row => !row.excluded && Object.entries(config.filters!).every(([name, value]) => {
      if (!value) return true
      const result = columns.get(name)!.filter!(row.element, value); synchronous(result)
      if (typeof result !== "boolean") throw new TypeError("Filters must synchronously return boolean.")
      return result
    }))
    if (config.sort) {
      const comparator = columns.get(config.sort.key)!.compare!, direction = config.sort.order === "ascending" ? 1 : -1
      const indices = new Map(next.map((row, index) => [row, index]))
      matches.sort((left, right) => {
        const result = comparator(left.element, right.element); synchronous(result)
        if (typeof result !== "number" || !Number.isFinite(result)) throw new TypeError("Comparators must synchronously return finite numbers.")
        return result === 0 ? indices.get(left)! - indices.get(right)! : (result < 0 ? -1 : 1) * direction
      })
    }
    const count = matches.length ? config.pageSize === null ? 1 : Math.ceil(matches.length / config.pageSize) : 0
    const page = config.pageSize === null ? matches : matches.slice((config.page - 1) * config.pageSize, config.page * config.pageSize)
    const summary = summaries.map(item => {
      const result = item.config.value(Object.freeze(scopeRows(item.config.scope, next, matches, page).map(row => row.element))); synchronous(result)
      if (typeof result !== "string" || result.length > 16384) throw new TypeError("Summaries must synchronously return text of at most 16384 characters.")
      return result
    })
    return { matches, count, page, summary }
  }
  function state(): DataTableState {
    return Object.freeze({ sourceKeys: Object.freeze(rows.map(row => row.key)), filteredKeys: Object.freeze(filtered.map(row => row.key)),
      visibleKeys: Object.freeze(visible.map(row => row.key)), checkedKeys: Object.freeze(rows.filter(row => row.check?.checked).map(row => row.key)),
      sort: current.sort, filters: current.filters!, page: current.page, pageSize: current.pageSize, pageCount, total: rows.length, loading: current.loading })
  }
  function available(node: HTMLElement) { return node.isConnected && !node.closest("[hidden],[inert]") && !node.matches(":disabled") }
  function focusRoot() { if (available(root)) { if (!root.hasAttribute("tabindex")) attr(root, "tabindex", "-1"); root.focus({ preventScroll: true }) } }
  function focusAfter(active: HTMLElement | null, selection: [number | null, number | null, "forward" | "backward" | "none" | null] | null) {
    if (!active || !connected || document!.activeElement !== document!.body && document!.activeElement !== active) return
    if (!available(active)) { focusRoot(); return }
    if (document!.activeElement !== active) {
      active.focus({ preventScroll: true })
      if (selection && (active instanceof view!.HTMLInputElement || active instanceof view!.HTMLTextAreaElement) && selection[0] !== null) active.setSelectionRange(selection[0], selection[1], selection[2] ?? undefined)
    }
  }
  function syncSelection() {
    if (all) {
      const eligible = scopeRows(all.getAttribute("data-data-scope") as DataTableScope).filter(row => row.check && !row.check.matches(":disabled"))
      const checked = eligible.filter(row => row.check!.checked).length
      prop(all, "checked", eligible.length > 0 && checked === eligible.length)
      prop(all, "indeterminate", checked > 0 && checked < eligible.length)
      attr(all, "disabled", !eligible.length ? "" : original(all, "disabled"))
    }
  }
  function release(node: HTMLElement) {
    for (let index = attributes.length - 1; index >= 0; index--) {
      const record = attributes[index]!
      if (record.node !== node) continue
      if (node.getAttribute(record.name) === record.last) {
        if (record.before === null) node.removeAttribute(record.name); else node.setAttribute(record.name, record.before)
      }
      attributes.splice(index, 1)
    }
    if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
    if ((node as Owned)[checkboxOwner] === token) delete (node as Owned)[checkboxOwner]
    borrowed.delete(node)
  }
  function transact(input: DataTableValues = {}, order?: readonly string[], clamp = false, reveal?: string) {
    guard(); busy = true
    try {
      const collected = collect(), byKey = new Map(collected.map(row => [row.key, row]))
      let next = [...rows.filter(row => byKey.has(row.key)).map(row => byKey.get(row.key)!), ...collected.filter(row => !rows.some(prior => prior.key === row.key))]
      if (order !== undefined) {
        if (!Array.isArray(order) || order.length !== collected.length || new Set(order).size !== order.length || order.some(name => !byKey.has(name))) throw new TypeError("sourceOrder must contain every current row key exactly once.")
        next = order.map(name => byKey.get(name)!)
      }
      const config = values(input)
      if (input.filters !== undefined && input.page === undefined) config.page = 1
      let result = plan(next, config)
      if (reveal !== undefined) {
        const index = result.matches.findIndex(row => row.key === reveal)
        if (index < 0) throw new RangeError("Cannot reveal an unknown or author-hidden row.")
        config.page = config.pageSize === null ? 1 : Math.floor(index / config.pageSize) + 1
        result = plan(next, config)
      } else if (clamp && config.page > Math.max(1, result.count)) {
        config.page = Math.max(1, result.count); result = plan(next, config)
      }
      if (config.page > Math.max(1, result.count)) throw new RangeError("Page is outside the current local result; no unrelated page was chosen.")
      const verified = collect()
      if (verified.length !== collected.length || verified.some((row, index) => row.element !== collected[index]!.element || row.key !== collected[index]!.key || row.check !== collected[index]!.check || row.excluded !== collected[index]!.excluded)) throw new Error("Callbacks must not mutate table structure or row visibility.")
      live()
      const active = document!.activeElement instanceof view!.HTMLElement && root.contains(document!.activeElement) ? document!.activeElement
        : document!.activeElement === document!.body && lastFocus && !lastFocus.isConnected ? lastFocus : null
      const selection = active instanceof view!.HTMLInputElement || active instanceof view!.HTMLTextAreaElement ? [active.selectionStart, active.selectionEnd, active.selectionDirection] as const : null
      for (const row of rows) {
        if (!next.some(item => item.element === row.element)) release(row.element)
        if (row.check && !next.some(item => item.check === row.check)) release(row.check)
      }
      for (const row of next) { lease(row.element); if (row.check) lease(row.check) }
      const shown = new Set(result.page), matching = new Set(result.matches)
      const displayOrder = [...result.matches, ...next.filter(row => !matching.has(row))]
      let anchor: Node | null = null
      for (let index = displayOrder.length - 1; index >= 0; index--) {
        const element = displayOrder[index]!.element
        if (element.nextSibling !== anchor) {
          const movable = body as typeof body & { moveBefore?: (node: Node, child: Node | null) => void }
          if (movable.moveBefore) movable.moveBefore(element, anchor); else body.insertBefore(element, anchor)
          live()
        }
        anchor = element
      }
      for (const row of next) attr(row.element, "hidden", shown.has(row) ? null : "")
      rows = next; filtered = result.matches; visible = result.page; current = config; pageCount = result.count
      for (const [name, header] of headers) attr(header, "aria-sort", config.sort?.key === name ? config.sort.order : null)
      for (const [node] of sortButtons) attr(node, "hidden", null)
      for (const [name, control] of filters) if (!composing.has(control)) control.value = config.filters![name] ?? ""
      if (size) size.value = config.pageSize === null ? "all" : String(config.pageSize)
      for (const [node, action] of pages) {
        attr(node, "hidden", null)
        attr(node, "disabled", (action === "previous" ? config.page <= 1 : config.page >= pageCount) ? "" : original(node, "disabled"))
      }
      if (empty) attr(empty, "hidden", result.matches.length ? "" : null)
      if (loading) attr(loading, "hidden", config.loading ? null : "")
      attr(table, "aria-busy", config.loading ? "true" : original(table, "aria-busy"))
      if (count) count.textContent = result.count ? `Page ${config.page} of ${result.count} (${result.matches.length} of ${rows.length} rows)` : `No matching rows (0 of ${rows.length} rows)`
      summaries.forEach((item, index) => { item.node.textContent = result.summary[index]! })
      syncSelection(); error = null
      focusAfter(active, selection ? [...selection] : null)
    } catch (cause) { error = cause; throw cause }
    finally { busy = false }
  }
  function checked(keys: readonly string[]) {
    guard()
    const collected = collect()
    if (collected.length !== rows.length || collected.some(row => !rows.some(prior => prior.key === row.key && prior.element === row.element && prior.check === row.check))) throw new Error("Refresh changed row data before selecting.")
    if (!Array.isArray(keys) || new Set(keys).size !== keys.length || keys.some(key => !rows.some(row => row.key === key && row.check))) throw new TypeError("Selection keys must be unique known checkbox row keys.")
    const wanted = new Set(keys)
    if (rows.some(row => row.check?.matches(":disabled") && row.check.checked !== wanted.has(row.key))) throw new Error("Disabled row selection is protected.")
    for (const row of rows) if (row.check) row.check.checked = wanted.has(row.key)
    syncSelection()
  }
  function select(scope: DataTableScope, value: boolean) {
    guard()
    if (typeof value !== "boolean") throw new TypeError("Selection value must be boolean.")
    const keys = new Set(rows.filter(row => row.check?.checked).map(row => row.key))
    for (const row of scopeRows(scope)) if (row.check && !row.check.matches(":disabled")) { if (value) keys.add(row.key); else keys.delete(row.key) }
    checked([...keys])
  }
  function notify(source: DataTableChange["source"], event: Event) {
    if (connected) root.dispatchEvent(new view!.CustomEvent<DataTableChange>("mui:data-table-change", { bubbles: true, detail: { source, state: state(), event } }))
  }
  function attempt(action: () => void) {
    try { action() } catch (cause) {
      error = cause
      root.dispatchEvent(new view!.CustomEvent("mui:data-table-error", { bubbles: true, detail: { error: cause } }))
    }
  }
  function click(event: Event) {
    const target = event.target instanceof view!.Element ? event.target.closest("button") as HTMLButtonElement | null : null
    if (!target || !own(target) || !sortButtons.has(target) && !pages.has(target)) return
    queueMicrotask(() => {
      if (!connected || event.defaultPrevented || !available(target)) return
      attempt(() => {
        if (sortButtons.has(target)) {
          const name = sortButtons.get(target)!, previous = current.sort
          transact({ sort: previous?.key !== name ? { key: name, order: "ascending" } : previous.order === "ascending" ? { key: name, order: "descending" } : null })
          notify("sort", event)
        } else { transact({ page: current.page + (pages.get(target) === "next" ? 1 : -1) }); notify("page", event) }
      })
    })
  }
  function change(event: Event) {
    const target = event.target
    if (!(target instanceof view!.HTMLElement) || !own(target)) return
    attempt(() => {
      if (target === all) { select(all!.getAttribute("data-data-scope") as DataTableScope, all!.checked); notify("selection", event) }
      else if (rows.some(row => row.check === target)) { syncSelection(); notify("selection", event) }
      else if (target === size) { transact({ pageSize: parseSize(size!.value), page: 1 }); notify("page-size", event) }
      else {
        const entry = [...filters].find(([, node]) => node === target)
        if (entry && !composing.has(entry[1])) { transact({ filters: { ...current.filters, [entry[0]]: entry[1].value } }); notify("filter", event) }
      }
    })
  }
  function composition(event: Event) {
    const target = event.target as FilterControl
    if (![...filters.values()].includes(target)) return
    if (event.type === "compositionstart") composing.add(target)
    else { composing.delete(target); change(event) }
  }
  function focus(event: Event) { if (event.target instanceof view!.HTMLElement && own(event.target)) lastFocus = event.target }
  let defaults: DataTableValues
  function reset(event: Event) {
    const form = event.target
    if (!(form instanceof view!.HTMLFormElement) || !(root.closest("form") === form
      || [...root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement>("input,select,textarea,button")]
        .some(node => own(node) && node.form === form))) return
    pendingReset = true
    queueMicrotask(() => {
      pendingReset = false
      if (!connected || event.defaultPrevented) return
      composing.clear()
      attempt(() => transact({ ...defaults, filters: { ...defaults.filters, ...Object.fromEntries([...filters].map(([name, node]) => [name, node.value])) } }, undefined, true))
    })
  }
  function disconnect() {
    if (!connected) return
    connected = false
    root.removeEventListener("click", click); root.removeEventListener("change", change)
    root.removeEventListener("compositionstart", composition); root.removeEventListener("compositionend", composition)
    root.removeEventListener("focusin", focus); document!.removeEventListener("reset", reset, true)
    for (const node of [...borrowed]) release(node)
    for (const record of properties) if (record.node[record.name] === record.last) record.node[record.name] = record.before
    properties.length = 0; composing.clear()
  }
  try {
    collect()
    for (const node of [root, ...anatomy]) lease(node)
    const initialFilters = Object.fromEntries([...filters].map(([name, node]) => [name, node.value]))
    defaults = { sort: options.sort ?? null, filters: options.filters ?? {}, pageSize: options.pageSize === undefined ? size ? parseSize(size.value) : null : options.pageSize, page: 1, loading: options.loading ?? false }
    const { columns: ignoredColumns, summaries: ignoredSummaries, ...initial } = options
    transact({ ...defaults, filters: initialFilters, ...initial })
    root.addEventListener("click", click); root.addEventListener("change", change)
    root.addEventListener("compositionstart", composition); root.addEventListener("compositionend", composition)
    root.addEventListener("focusin", focus); document!.addEventListener("reset", reset, true)
  } catch (cause) { disconnect(); throw cause }
  return {
    table, get connected() { return connected }, get error() { return error }, get state() { return state() },
    set: values => transact(values),
    setCheckedKeys: checked, select,
    refresh(input = {}) { object(input, ["sourceOrder"]); transact({}, input.sourceOrder, true) },
    reveal(name) { key(name); transact({ filters: {} }, undefined, false, name); return rows.find(row => row.key === name)!.element },
    revealAll() { transact({ sort: null, filters: {}, pageSize: null, page: 1 }) },
    disconnect
  }
}
