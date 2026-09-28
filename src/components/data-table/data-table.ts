export type DataTableScope = "page" | "filtered" | "all"
export interface DataTableRecord {
  readonly key: string
  readonly values: readonly (string | number | boolean | null)[]
  /** Native checkbox reset default, independent from current checkedKeys. */
  readonly checked?: boolean
  readonly disabled?: boolean
  readonly hidden?: boolean
}
export interface DataTableColumn {
  key: string
  compare?: (left: DataTableRecord, right: DataTableRecord) => number
  filter?: (row: DataTableRecord, value: string) => boolean
}
export interface DataTableSummary {
  key: string
  scope: DataTableScope
  value: (rows: readonly DataTableRecord[]) => string
}
export interface DataTableSort { readonly key: string; readonly order: "ascending" | "descending" }
export interface DataTableValues {
  sort?: DataTableSort | null
  filters?: Readonly<Record<string, string>> | null
  page?: number
  pageSize?: number | null
  loading?: boolean
}
export interface DataTableOptions extends DataTableValues { columns: readonly DataTableColumn[] }
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
/** @internal Explicit references created by the component's Web renderer. */
export interface DataTableView {
  root: HTMLElement
  table: HTMLTableElement
  headers: Map<string, HTMLTableCellElement>
  sortButtons: Map<HTMLButtonElement, string>
  filters: Map<string, HTMLInputElement>
  pages: Map<HTMLButtonElement, "previous" | "next">
  size: HTMLSelectElement
  count: HTMLElement
  empty: HTMLElement
  loading: HTMLElement
  all: HTMLInputElement | null
  summaries: { config: Readonly<DataTableSummary>; node: HTMLElement }[]
  rows: Map<string, HTMLTableRowElement>
  writeRows(data: readonly DataTableRecord[]): void
}
export interface DataTableController {
  readonly connected: boolean
  readonly error: unknown
  readonly state: DataTableState
  set(values: DataTableValues): void
  setData(data: readonly DataTableRecord[]): void
  setCheckedKeys(keys: readonly string[]): void
  select(scope: DataTableScope, checked: boolean): void
  refresh(): void
  reveal(key: string): HTMLTableRowElement
  revealAll(): void
  disconnect(): void
  assertMutable(): void
}
interface Lease { before: string | null; last: string | null }
const owner = Symbol.for("markup-ui.data-table.owner"), checkboxOwner = Symbol.for("markup-ui.checkbox-group.owner")
type Owned = HTMLElement & { [owner]?: object; [checkboxOwner]?: object }
const scopes = ["page", "filtered", "all"]

/** Computes a complete data transaction before changing native rows or state. */
export function createDataTable(native: DataTableView, options: DataTableOptions, data: readonly DataTableRecord[],
  events: HTMLElement, resetDefaults?: DataTableValues): DataTableController {
  const { root, table, headers, sortButtons, filters, pages, size, count, empty, loading, all, summaries, rows } = native
  const document = root.ownerDocument, view = document.defaultView!, body = table.tBodies[0]!, head = table.tHead!
  const headerCells = [...head.rows[0]!.cells], token = {}, borrowed = new Set<Owned>()
  const columns = new Map(options.columns.map(column => [column.key, column]))
  const leases = new Map<HTMLElement, Map<string, Lease>>(), composing = new Set<HTMLInputElement>()
  const anatomy = [root, table, head, body, ...headers.values(), ...sortButtons.keys(), ...filters.values(), ...pages.keys(),
    size, count, empty, loading, ...all ? [all] : [], ...summaries.map(item => item.node)]
  let connected = true, busy = false, pendingReset = false, error: unknown = null, generation = 0
  let resetTask = 0
  let source = data, filtered: readonly DataTableRecord[] = [], visible: readonly DataTableRecord[] = [], pageCount = 0
  let current: Required<DataTableValues> = { sort: null, filters: {}, page: 1, pageSize: null, loading: false }
  let lastFocus: HTMLElement | null = null
  const headerState = all ? { checked: all.checked, indeterminate: all.indeterminate, lastChecked: all.checked, lastMixed: all.indeterminate } : null
  const own = (node: Element) => node.closest("[data-data-table]") === root
  const checks = new Map<string, HTMLInputElement | null>()
  const findCheck = (row: HTMLTableRowElement) => row.querySelector<HTMLInputElement>(":scope > td > [data-data-check]")
  for (const [key, row] of rows) checks.set(key, findCheck(row))
  const check = (key: string) => checks.get(key) ?? null
  function live() { if (!connected) throw new Error("Data Table is disconnected.") }
  function guard() { live(); if (busy || pendingReset) throw new Error("Data Table cannot reenter callbacks or pending reset.") }
  function original(node: HTMLElement, name: string) {
    const lease = leases.get(node)?.get(name), value = node.getAttribute(name)
    return lease && value === lease.last ? lease.before : value
  }
  function attr(node: HTMLElement, name: string, value: string | null) {
    let records = leases.get(node)
    if (!records) leases.set(node, records = new Map())
    let lease = records.get(name)
    const actual = node.getAttribute(name)
    if (!lease) records.set(name, lease = { before: actual, last: actual })
    if (actual !== lease.last) lease.before = actual
    if (actual !== value) { if (value === null) node.removeAttribute(name); else node.setAttribute(name, value) }
    lease.last = value
  }
  function release(node: Owned) {
    for (const [name, lease] of leases.get(node) ?? []) if (node.getAttribute(name) === lease.last) {
      if (lease.before === null) node.removeAttribute(name); else node.setAttribute(name, lease.before)
    }
    leases.delete(node)
    if (node[owner] === token) delete node[owner]
    if (node[checkboxOwner] === token) delete node[checkboxOwner]
    borrowed.delete(node)
  }
  function borrow(node: Owned) {
    if (node[owner] && node[owner] !== token || node[checkboxOwner] && node[checkboxOwner] !== token) throw new Error("Native Data Table node already has an owner.")
    node[owner] = token; borrowed.add(node)
    if (node instanceof view.HTMLInputElement && node.type === "checkbox") (node as Owned)[checkboxOwner] = token
  }
  function anatomyCheck() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".m-data-table[data-data-table]")
      || !table.classList.contains("m-table") || table.tHead !== head || table.tBodies.length !== 1 || table.tBodies[0] !== body || head.rows.length !== 1
      || headerCells.length !== head.rows[0]!.cells.length || headerCells.some((cell, i) => cell !== head.rows[0]!.cells[i]
        || cell.localName !== "th" || cell.scope !== "col" || cell.rowSpan !== 1 || cell.colSpan !== 1 || cell.hasAttribute("role"))
      || anatomy.some(node => !root.contains(node) || !own(node) || node.hasAttribute("role")
        || (node as Owned)[owner] && (node as Owned)[owner] !== token)
      || body.rows.length !== source.length || rows.size !== source.length
      || [...root.querySelectorAll("[data-data-sort],[data-data-filter],[data-data-page]")].filter(own).length !== sortButtons.size + filters.size + pages.size) throw new TypeError("Keep original native Data Table anatomy and keyed rows; update data instead.")
    for (const record of source) {
      const row = rows.get(record.key), control = check(record.key)
      if (!row || row.parentElement !== body || row.dataset.dataKey !== record.key || row.hasAttribute("role")
        || findCheck(row) !== control || row.getAttribute("hidden") === "until-found" || row.cells.length !== headerCells.length
        || [...row.cells].some(cell => cell.rowSpan !== 1 || cell.colSpan !== 1 || cell.hasAttribute("role"))
        || control && (control.type !== "checkbox" || control.value !== record.key || !control.hasAttribute("aria-label")
          || control.hasAttribute("role") || (control as Owned)[checkboxOwner] && (control as Owned)[checkboxOwner] !== token)
        || all && !control) throw new TypeError("Keep native unspanned cells, immutable keys and owned named checkboxes.")
    }
    for (const [key, node] of headers) if (node.dataset.dataColumn !== key || !head.contains(node)) throw new TypeError("Column identity changed.")
    for (const [button, key] of sortButtons) if (button.type !== "button" || button.closest("th") !== headers.get(key)
      || button.dataset.dataSort !== key || button.matches("[popovertarget],[commandfor]")) throw new TypeError("Sort button anatomy changed.")
    for (const [button, action] of pages) if (button.type !== "button" || button.dataset.dataPage !== action
      || table.contains(button) || button.matches("[popovertarget],[commandfor]")) throw new TypeError("Pager anatomy changed.")
    for (const [key, input] of filters) if (!["text", "search"].includes(input.type) || input.dataset.dataFilter !== key
      || !input.labels?.length || table.contains(input)) throw new TypeError("Keep labelled native filter inputs.")
    if (size.multiple || !size.labels?.length || table.contains(size)
      || all && (all.type !== "checkbox" || all.name || all.required || !head.contains(all) || !scopes.includes(all.dataset.dataScope!))
      || [count, empty, loading, ...summaries.map(item => item.node)].some(node => node.childElementCount)
      || summaries.some(item => !table.tFoot?.contains(item.node) || item.node.dataset.dataSummary !== item.config.key)) throw new TypeError("Keep page size, scoped selection and plain-text views.")
  }
  function synchronous(value: unknown) {
    if (value && (typeof value === "object" || typeof value === "function") && typeof (value as { then?: unknown }).then === "function") {
      void Promise.resolve(value).catch(() => {}); throw new TypeError("Data Table callbacks must be synchronous.")
    }
    live()
  }
  function values(input: DataTableValues) {
    if (!input || typeof input !== "object" || Array.isArray(input)
      || Object.keys(input).some(key => !["sort", "filters", "page", "pageSize", "loading"].includes(key))) throw new TypeError("Unsupported Data Table values.")
    const result = { ...current, ...input }
    if (result.sort !== null) {
      if (!result.sort || Object.keys(result.sort).some(key => key !== "key" && key !== "order")
        || !columns.get(result.sort.key)?.compare || !["ascending", "descending"].includes(result.sort.order)) throw new TypeError("Use a known comparator and ascending/descending sort.")
      result.sort = Object.freeze({ ...result.sort })
    }
    const query = result.filters === null ? {} : result.filters
    if (!query || typeof query !== "object" || Array.isArray(query)
      || Object.entries(query).some(([key, value]) => !columns.get(key)?.filter || typeof value !== "string" || value.length > 1024)) throw new TypeError("Use known filter keys and strings up to 1024 characters.")
    result.filters = Object.freeze(Object.assign(Object.create(null), query))
    if (!Number.isSafeInteger(result.page) || result.page < 1 || typeof result.loading !== "boolean"
      || result.pageSize !== null && (!Number.isInteger(result.pageSize) || result.pageSize < 1 || result.pageSize > 2000)
      || ![...size.options].some(option => option.value === (result.pageSize === null ? "all" : String(result.pageSize)))) throw new RangeError("Use a positive page and configured page size (1..2000 or all).")
    for (const [key, input] of filters) if (composing.has(input) && input.value !== (result.filters![key] ?? "")) throw new Error("Do not replace a composing filter draft.")
    return result
  }
  function scopeRows(scope: DataTableScope, all = source, matches = filtered, page = visible) {
    if (!scopes.includes(scope)) throw new TypeError("Use page/filtered/all scope.")
    return scope === "all" ? all : scope === "filtered" ? matches : page
  }
  function excluded(record: DataTableRecord) {
    const previous = source.find(row => row.key === record.key), row = rows.get(record.key)
    return !previous || record.hidden !== previous.hidden ? !!record.hidden : row ? original(row, "hidden") !== null : !!record.hidden
  }
  function plan(next: readonly DataTableRecord[], config: Required<DataTableValues>) {
    const matches = next.filter(row => !excluded(row) && Object.entries(config.filters!).every(([key, value]) => {
      if (!value) return true
      const result = columns.get(key)!.filter!(row, value); synchronous(result)
      if (typeof result !== "boolean") throw new TypeError("Filters must return boolean.")
      return result
    }))
    if (config.sort) {
      const compare = columns.get(config.sort.key)!.compare!, indices = new Map(next.map((row, i) => [row, i]))
      matches.sort((a, b) => {
        const result = compare(a, b); synchronous(result)
        if (typeof result !== "number" || !Number.isFinite(result)) throw new TypeError("Comparators must return finite numbers.")
        return result === 0 ? indices.get(a)! - indices.get(b)! : (result < 0 ? -1 : 1) * (config.sort!.order === "ascending" ? 1 : -1)
      })
    }
    const count = matches.length ? config.pageSize === null ? 1 : Math.ceil(matches.length / config.pageSize) : 0
    return { matches, count }
  }
  function available(node: HTMLElement) { return node.isConnected && !node.closest("[hidden],[inert]") && !node.matches(":disabled") }
  function syncSelection() {
    if (!all) return
    const eligible = scopeRows(all.dataset.dataScope as DataTableScope).map(row => check(row.key)).filter((node): node is HTMLInputElement => !!node && !node.matches(":disabled"))
    const checked = eligible.filter(node => node.checked).length
    all.checked = headerState!.lastChecked = eligible.length > 0 && checked === eligible.length
    all.indeterminate = headerState!.lastMixed = checked > 0 && checked < eligible.length
    attr(all, "disabled", eligible.length ? original(all, "disabled") : "")
  }
  function state(): DataTableState {
    return Object.freeze({ sourceKeys: Object.freeze(source.map(row => row.key)), filteredKeys: Object.freeze(filtered.map(row => row.key)),
      visibleKeys: Object.freeze(visible.map(row => row.key)), checkedKeys: Object.freeze(source.filter(row => check(row.key)?.checked).map(row => row.key)),
      sort: current.sort, filters: current.filters!, page: current.page, pageSize: current.pageSize, pageCount, total: source.length, loading: current.loading })
  }
  function transact(input: DataTableValues = {}, next = source, clamp = false, reveal?: string) {
    guard(); busy = true
    try {
      anatomyCheck()
      const before = [...body.rows].map(row => ({ row, hidden: original(row, "hidden") }))
      const config = values(input)
      if (input.filters !== undefined && input.page === undefined) config.page = 1
      const result = plan(next, config)
      if (reveal !== undefined) {
        const index = result.matches.findIndex(row => row.key === reveal)
        if (index < 0) throw new RangeError("Cannot reveal an unknown or hidden row.")
        config.page = config.pageSize === null ? 1 : Math.floor(index / config.pageSize) + 1
      } else if (clamp) config.page = Math.min(config.page, Math.max(1, result.count))
      if (config.page > Math.max(1, result.count)) throw new RangeError("Page is outside the local result.")
      const page = config.pageSize === null ? result.matches : result.matches.slice((config.page - 1) * config.pageSize, config.page * config.pageSize)
      const texts = summaries.map(({ config }) => {
        const value = config.value(Object.freeze([...scopeRows(config.scope, next, result.matches, page)])); synchronous(value)
        if (typeof value !== "string" || value.length > 16384) throw new TypeError("Summaries must return text up to 16384 characters.")
        return value
      })
      anatomyCheck(); live()
      if (before.some((item, i) => body.rows[i] !== item.row || original(item.row, "hidden") !== item.hidden)) throw new Error("Callbacks must not change row order or visibility.")
      const active = document.activeElement instanceof view.HTMLElement && root.contains(document.activeElement) ? document.activeElement
        : document.activeElement === document.body && lastFocus && !lastFocus.isConnected ? lastFocus : null
      const selection = active instanceof view.HTMLInputElement || active instanceof view.HTMLTextAreaElement
        ? [active.selectionStart, active.selectionEnd, active.selectionDirection] as const : null
      const prior = [...rows.values()]
      if (next !== source) {
        for (const record of next) if (record.hidden !== source.find(row => row.key === record.key)?.hidden) {
          const row = rows.get(record.key), lease = row && leases.get(row)?.get("hidden")
          if (lease) lease.before = record.hidden ? "" : null
        }
        native.writeRows(next); live()
        checks.clear(); for (const [key, row] of rows) checks.set(key, findCheck(row))
        for (const row of prior) if (!rows.has(row.dataset.dataKey!)) {
          for (const node of [...borrowed]) if (node === row || row.contains(node)) release(node)
        }
      }
      const shown = new Set(page), matching = new Set(result.matches)
      let anchor: Node | null = null
      for (const record of [...result.matches, ...next.filter(row => !matching.has(row))].reverse()) {
        const row = rows.get(record.key)!
        if (row.nextSibling !== anchor) {
          const movable = body as typeof body & { moveBefore?: (node: Node, before: Node | null) => void }
          if (movable.moveBefore) movable.moveBefore(row, anchor); else body.insertBefore(row, anchor)
          live()
        }
        anchor = row
        borrow(row); const control = check(record.key); if (control) borrow(control)
        attr(row, "hidden", shown.has(record) ? null : "")
      }
      source = next; filtered = result.matches; visible = page; current = config; pageCount = result.count; generation++
      for (const [key, header] of headers) attr(header, "aria-sort", config.sort?.key === key ? config.sort.order : null)
      for (const [key, input] of filters) if (!composing.has(input)) input.value = config.filters![key] ?? ""
      size.value = config.pageSize === null ? "all" : String(config.pageSize)
      for (const [button, action] of pages) attr(button, "disabled", (action === "previous" ? config.page <= 1 : config.page >= pageCount) ? "" : original(button, "disabled"))
      attr(empty, "hidden", result.matches.length ? "" : null); attr(loading, "hidden", config.loading ? null : "")
      attr(table, "aria-busy", config.loading ? "true" : original(table, "aria-busy"))
      count.textContent = result.count ? `Page ${config.page} of ${result.count} (${result.matches.length} of ${source.length} rows)` : `No matching rows (0 of ${source.length} rows)`
      summaries.forEach((item, i) => { item.node.textContent = texts[i]! })
      syncSelection(); error = null
      if (active && (document.activeElement === document.body || document.activeElement === active)) {
        if (!available(active)) root.focus({ preventScroll: true })
        else if (document.activeElement !== active) {
          active.focus({ preventScroll: true })
          if (selection && selection[0] !== null) (active as HTMLInputElement).setSelectionRange(selection[0], selection[1], selection[2] ?? undefined)
        }
      }
    } catch (cause) { error = cause; throw cause }
    finally { busy = false }
  }
  function checked(keys: readonly string[]) {
    guard(); anatomyCheck()
    if (!Array.isArray(keys) || new Set(keys).size !== keys.length || keys.some(key => !rows.has(key) || !check(key))) throw new TypeError("Use unique known checkbox row keys.")
    const wanted = new Set(keys)
    for (const row of source) {
      const input = check(row.key)
      if (input?.matches(":disabled") && input.checked !== wanted.has(row.key)) throw new Error("Disabled selection is protected.")
    }
    for (const row of source) { const input = check(row.key); if (input) input.checked = wanted.has(row.key) }
    syncSelection(); generation++
  }
  function select(scope: DataTableScope, value: boolean) {
    guard()
    if (typeof value !== "boolean") throw new TypeError("Selection requires boolean.")
    const keys = new Set(state().checkedKeys)
    for (const row of scopeRows(scope)) if (check(row.key) && !check(row.key)!.matches(":disabled")) {
      if (value) keys.add(row.key); else keys.delete(row.key)
    }
    checked([...keys])
  }
  function attempt(action: () => void) {
    try { action() } catch (cause) { error = cause; events.dispatchEvent(new view.CustomEvent("m:data-table-error", { bubbles: true, detail: { error: cause } })) }
  }
  function notify(source: DataTableChange["source"], event: Event) {
    if (connected) events.dispatchEvent(new view.CustomEvent<DataTableChange>("m:data-table-change", { bubbles: true, detail: { source, state: state(), event } }))
  }
  function click(event: Event) {
    const button = event.target instanceof view.Element ? event.target.closest("button") : null
    if (!button || !own(button) || !sortButtons.has(button) && !pages.has(button)) return
    const stamp = generation
    queueMicrotask(() => {
      if (!connected || stamp !== generation || event.defaultPrevented || !available(button)) return
      attempt(() => {
        const key = sortButtons.get(button)
        if (key) {
          transact({ sort: current.sort?.key !== key ? { key, order: "ascending" } : current.sort.order === "ascending" ? { key, order: "descending" } : null })
          notify("sort", event)
        } else { transact({ page: current.page + (pages.get(button) === "next" ? 1 : -1) }); notify("page", event) }
      })
    })
  }
  function change(event: Event) {
    const target = event.target
    if (!(target instanceof view.HTMLElement) || !own(target)) return
    attempt(() => {
      if (target === all) { select(all!.dataset.dataScope as DataTableScope, all!.checked); notify("selection", event) }
      else if (source.some(row => check(row.key) === target)) { anatomyCheck(); syncSelection(); notify("selection", event) }
      else if (target === size) { transact({ pageSize: size.value === "all" ? null : Number(size.value), page: 1 }); notify("page-size", event) }
      else for (const [key, input] of filters) if (target === input && !composing.has(input)) {
        transact({ filters: { ...current.filters, [key]: input.value } }); notify("filter", event)
      }
    })
  }
  function composition(event: Event) {
    const target = event.target as HTMLInputElement
    if (![...filters.values()].includes(target)) return
    if (event.type === "compositionstart") composing.add(target)
    else { composing.delete(target); change(event) }
  }
  function focus(event: Event) { if (event.target instanceof view.HTMLElement && own(event.target)) lastFocus = event.target }
  const defaults: DataTableValues = resetDefaults ?? { sort: options.sort ?? null, filters: options.filters ?? {}, pageSize: options.pageSize ?? null, loading: options.loading ?? false, page: 1 }
  function reset(event: Event) {
    if (!(event.target instanceof view.HTMLFormElement) || !(root.closest("form") === event.target
      || [...root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input,select")].some(node => own(node) && node.form === event.target))) return
    const stamp = generation; pendingReset = true
    view.clearTimeout(resetTask)
    resetTask = view.setTimeout(() => {
      pendingReset = false
      if (!connected || stamp !== generation || event.defaultPrevented) return
      composing.clear()
      attempt(() => transact({ ...defaults, filters: Object.fromEntries([...filters].map(([key, input]) => [key, input.value])) }, source, true))
    }, 0)
  }
  function disconnect() {
    if (!connected) return
    connected = false; generation++; view.clearTimeout(resetTask)
    root.removeEventListener("click", click); root.removeEventListener("change", change)
    root.removeEventListener("compositionstart", composition); root.removeEventListener("compositionend", composition)
    root.removeEventListener("focusin", focus); document.removeEventListener("reset", reset, true)
    for (const node of [...borrowed]) release(node)
    if (all && headerState) {
      if (all.checked === headerState.lastChecked) all.checked = headerState.checked
      if (all.indeterminate === headerState.lastMixed) all.indeterminate = headerState.indeterminate
    }
    composing.clear()
  }
  try {
    for (const node of anatomy) borrow(node)
    const { columns: ignored, ...initial } = options
    transact(initial, source, !!resetDefaults)
    root.addEventListener("click", click); root.addEventListener("change", change)
    root.addEventListener("compositionstart", composition); root.addEventListener("compositionend", composition)
    root.addEventListener("focusin", focus); document.addEventListener("reset", reset, true)
  } catch (cause) { disconnect(); throw cause }
  return {
    get connected() { return connected }, get error() { return error }, get state() { return state() },
    set: values => transact(values), setData: data => transact({}, data, true), setCheckedKeys: checked, select,
    refresh: () => transact({}, source, true),
    reveal(key) { transact({ filters: {} }, source, false, key); return rows.get(key)! },
    revealAll() { transact({ sort: null, filters: {}, pageSize: null, page: 1 }) },
    disconnect, assertMutable: guard,
  }
}
