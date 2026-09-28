import { ViewElement } from "../../core/index.js"
import { createDataTable } from "./data-table.js"
import type { DataTableColumn, DataTableController, DataTableOptions, DataTableRecord, DataTableScope, DataTableState, DataTableSummary, DataTableValues, DataTableView } from "./data-table.js"
export type { DataTableRecord } from "./data-table.js"

export type DataTableSize = "small" | "medium" | "large"
export const dataTableSizes: readonly DataTableSize[] = ["small", "medium", "large"]
export interface DataTableField extends DataTableColumn {
  readonly label: string
  readonly sort?: "text" | "number"
  readonly filterable?: boolean
}
export interface DataTableDefinition extends DataTableValues {
  readonly columns: readonly DataTableField[]
  readonly summaries?: readonly DataTableSummary[]
  readonly selection?: { readonly name: string; readonly scope: DataTableScope }
  readonly pageSizes?: readonly number[]
}
function fields(value: object, names: readonly string[]): boolean {
  return !value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !names.includes(key))
}

/**
 * Keyed local data mapped to native table, sorting, filtering, paging and selection.
 * Operation callbacks consume immutable records; native inspection is Web-only.
 * @event {"name":"Change","web":"m:data-table-change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Error","web":"m:data-table-error","bubbles":true,"cancelable":false,"composed":false}
 */
export class DataTable extends ViewElement {
  public static readonly tag = "m-data-table"
  public static readonly observedAttributes = ["bordered", "striped", "single-line", "size", "label", "options", "data"]
  #initialized = false
  #preparing = false
  #upgrading = false
  #definition: Readonly<DataTableDefinition> | null = null
  #data: readonly DataTableRecord[] = Object.freeze([])
  #controller: DataTableController | null = null
  #view: DataTableView | null = null
  #rows = new Map<string, HTMLTableRowElement>()
  #operations: DataTableOptions | null = null
  #values: DataTableValues = {}
  #defaults: DataTableValues | undefined

  public connectedCallback(): void {
    if (!this.#initialized) {
      this.#upgrading = true
      try {
        if (this.hasAttribute("options")) this.options = JSON.parse(this.getAttribute("options")!)
        if (this.hasAttribute("data")) this.data = JSON.parse(this.getAttribute("data")!)
        this.upgradeProperties(); this.#initialized = true
      } finally { this.#upgrading = false }
    }
    this.#connect()
  }
  public disconnectedCallback(): void {
    if (this.#controller?.connected) {
      const { sort, filters, page, pageSize, loading } = this.#controller.state
      this.#values = { sort, filters, page, pageSize, loading }
      this.#controller.disconnect()
    }
  }
  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (!this.#initialized || before === after) return
    if (name === "options") this.options = after === null ? null : JSON.parse(after)
    else if (name === "data") this.data = after === null ? [] : JSON.parse(after)
    else this.#sync()
  }
  public get bordered(): boolean { return this.booleanAttribute("bordered", true) }
  public set bordered(value: boolean) { this.#guard(); this.setBooleanAttribute("bordered", value, false) }
  public get striped(): boolean { return this.hasAttribute("striped") }
  public set striped(value: boolean) { this.#guard(); this.setBooleanAttribute("striped", value) }
  public get singleLine(): boolean { return this.booleanAttribute("single-line", true) }
  public set singleLine(value: boolean) { this.#guard(); this.setBooleanAttribute("single-line", value, false) }
  public get size(): DataTableSize { return this.choiceAttribute("size", dataTableSizes, "medium") }
  public set size(value: DataTableSize) { this.#guard(); this.setChoiceAttribute("size", value, dataTableSizes) }
  public get label(): string { return this.getAttribute("label") ?? "Records" }
  public set label(value: string) {
    this.#guard()
    if (typeof value !== "string" || !value.trim()) throw new TypeError("Use a nonempty Data Table label.")
    this.setStringAttribute("label", value)
  }
  /** Initial schema and reset defaults. Disconnect before replacing an active schema. */
  public get options(): Readonly<DataTableDefinition> | null { return this.#definition }
  public set options(value: DataTableDefinition | null) {
    this.#guard()
    if (this.#controller?.connected) throw new Error("Disconnect before replacing Data Table schema.")
    if (value !== null) {
      if (fields(value, ["columns", "summaries", "selection", "pageSizes", "sort", "filters", "page", "pageSize", "loading"]) || !Array.isArray(value.columns) || !value.columns.length
        || value.columns.length + Number(!!value.selection) > 64
        || new Set(value.columns.map(column => column.key)).size !== value.columns.length
        || Array.from(value.columns).some(column => fields(column, ["key", "label", "sort", "filterable", "compare", "filter"])
          || typeof column.key !== "string" || !column.key || column.key.length > 256
          || typeof column.label !== "string" || !column.label.trim()
          || column.sort !== undefined && !["text", "number"].includes(column.sort)
          || column.filterable !== undefined && typeof column.filterable !== "boolean"
          || [column.compare, column.filter].some(callback => callback !== undefined && typeof callback !== "function"))
        || value.selection !== undefined && (fields(value.selection, ["name", "scope"]) || typeof value.selection.name !== "string" || !["page", "filtered", "all"].includes(value.selection.scope))
        || value.pageSizes !== undefined && (!Array.isArray(value.pageSizes) || value.pageSizes.length > 20
          || Array.from(value.pageSizes).some(size => !Number.isInteger(size) || size < 1 || size > 2000))
        || value.summaries !== undefined && (!Array.isArray(value.summaries) || value.summaries.length > 64
          || new Set(value.summaries.map(summary => summary.key)).size !== value.summaries.length
          || Array.from(value.summaries).some(summary => fields(summary, ["key", "scope", "value"]) || typeof summary.key !== "string" || !summary.key || summary.key.length > 256
            || !["page", "filtered", "all"].includes(summary.scope) || typeof summary.value !== "function"))) throw new TypeError("Use bounded labelled columns, callbacks, selection and page sizes.")
      value = Object.freeze({ ...value, columns: Object.freeze(value.columns.map(column => Object.freeze({ ...column }))),
        ...(value.summaries && { summaries: Object.freeze(value.summaries.map(summary => Object.freeze({ ...summary }))) }),
        ...(value.filters && { filters: Object.freeze({ ...value.filters }) }), ...(value.sort && { sort: Object.freeze({ ...value.sort }) }),
        ...(value.selection && { selection: Object.freeze({ ...value.selection }) }),
        ...(value.pageSizes && { pageSizes: Object.freeze([...value.pageSizes]) }) })
    }
    this.#validate(this.#data, value)
    this.#definition = value
    this.#view?.root.remove(); this.#view = null; this.#rows.clear()
    this.#controller = null; this.#defaults = undefined
    this.#connect()
  }
  /** Stable keys preserve surviving rows, native edits and current checkbox state. */
  public get data(): readonly DataTableRecord[] { return this.#data }
  public set data(value: readonly DataTableRecord[]) {
    this.#guard()
    const next = this.#validate(value, this.options)
    if (this.#controller?.connected) this.#controller.setData(next)
    else if (this.#view) this.#writeRows(next, this.#data)
    this.#data = next
    this.#connect()
  }
  /** Web-only semantic table; no native table/template authoring is required. */
  public get native(): HTMLTableElement | null { return this.#view?.table ?? null }
  public get state(): DataTableState | null { return this.#controller?.connected ? this.#controller.state : null }
  public get error(): unknown { return this.#controller?.error ?? null }
  public get checkedKeys(): readonly string[] { return this.state?.checkedKeys ?? Object.freeze([]) }
  public set checkedKeys(value: readonly string[]) { this.#live().setCheckedKeys(value) }
  public set(values: DataTableValues): void { this.#live().set(values) }
  public select(scope: DataTableScope, checked: boolean): void { this.#live().select(scope, checked) }
  public refresh(): void { this.#live().refresh() }
  public reveal(key: string): HTMLTableRowElement { return this.#live().reveal(key) }
  public revealAll(): void { this.#live().revealAll() }
  public override focus(options?: FocusOptions): void { this.#view?.root.focus(options) }

  #guard(): void {
    if (this.#preparing) throw new Error("Do not reenter Data Table preparation.")
    if (this.#controller?.connected) this.#controller.assertMutable()
  }
  #live(): DataTableController {
    if (!this.isConnected || !this.#controller?.connected) throw new Error("Data Table is not configured or connected.")
    return this.#controller
  }
  #validate(data: readonly DataTableRecord[], definition: DataTableDefinition | null): readonly DataTableRecord[] {
    const keys = new Set<string>()
    if (!Array.isArray(data) || data.length > 2000) throw new RangeError("Use at most 2000 Data Table records.")
    return Object.freeze(Array.from(data, row => {
      if (!row || typeof row.key !== "string" || !row.key || row.key.length > 256 || keys.has(row.key)
        || !Array.isArray(row.values) || row.values.length > 64 || definition && row.values.length !== definition.columns.length
        || [row.checked, row.disabled, row.hidden].some(flag => flag !== undefined && typeof flag !== "boolean")
        || Array.from(row.values).some((value: unknown, i: number) => value !== null && (typeof value === "number" ? !Number.isFinite(value)
          : typeof value === "string" ? value.length > 4096 : typeof value !== "boolean")
          || value !== null && definition?.columns[i]?.sort === "number" && typeof value !== "number")) throw new TypeError("Use unique keys, bounded scalar cells and boolean row flags.")
      keys.add(row.key)
      return Object.freeze({ ...row, values: Object.freeze([...row.values]) })
    }))
  }
  #connect(): void {
    if (!this.isConnected || this.#upgrading || !this.#definition || this.#controller?.connected) return
    this.#preparing = true
    try {
      if (!this.#view) this.#render()
      this.#sync()
      this.#controller = createDataTable(this.#view!, { ...this.#operations!, ...this.#values }, this.#data, this, this.#defaults)
      const { sort, filters, pageSize, loading } = this.#controller.state
      this.#defaults ??= { sort, filters, pageSize, loading, page: 1 }
    } finally { this.#preparing = false }
  }
  #sync(): void {
    if (!this.#view) return
    const { root, table } = this.#view
    root.setAttribute("aria-label", this.label); table.caption!.textContent = this.label
    for (const [name, value] of [["bordered", this.bordered], ["single-line", this.singleLine]] as const) {
      if (value) table.removeAttribute(`data-${name}`); else table.setAttribute(`data-${name}`, "false")
    }
    table.dataset.size = this.size; table.toggleAttribute("data-striped", this.striped)
  }
  #writeRows(data: readonly DataTableRecord[], previous: readonly DataTableRecord[]): void {
    const body = this.#view!.table.tBodies[0]!, selection = this.options!.selection, offset = Number(!!selection)
    for (const record of data) {
      let row = this.#rows.get(record.key)
      const old = previous.find(item => item.key === record.key)
      if (!row) {
        row = this.ownerDocument.createElement("tr"); row.dataset.dataKey = record.key; this.#rows.set(record.key, row)
        if (selection) {
          const check = this.ownerDocument.createElement("input"); check.type = "checkbox"; check.dataset.dataCheck = ""
          check.name = selection.name; check.value = record.key; check.setAttribute("aria-label", `Select ${record.key}`); row.insertCell().append(check)
        }
        record.values.forEach(() => row!.insertCell())
      }
      record.values.forEach((value, i) => { if (!old || old.values[i] !== value) row!.cells[i + offset]!.textContent = value === null ? "" : String(value) })
      if (!old || old.hidden !== record.hidden) row.hidden = record.hidden ?? false
      const check = row.querySelector<HTMLInputElement>("[data-data-check]")
      if (check) {
        if (!old || old.checked !== record.checked) check.defaultChecked = record.checked ?? false
        if (!old || old.disabled !== record.disabled) check.disabled = record.disabled ?? false
      }
      if (row.parentElement !== body) body.append(row)
    }
    for (const [key, row] of this.#rows) if (!data.some(item => item.key === key)) { row.remove(); this.#rows.delete(key) }
    this.#data = data
  }
  #render(): void {
    const doc = this.ownerDocument, { columns, summaries, selection, pageSizes, ...initial } = this.#definition!
    this.#values = initial
    const make = <K extends keyof HTMLElementTagNameMap>(tag: K, part: string, value = "") => {
      const node = doc.createElement(tag); node.setAttribute(`data-data-${part}`, value); return node
    }
    const root = doc.createElement("section"); root.className = "m-data-table"; root.dataset.dataTable = ""; root.tabIndex = -1
    const controls = doc.createElement("div"); controls.className = "m-data-table-controls"
    const table = make("table", "table-table"); table.className = "m-table"; table.createCaption()
    const head = table.createTHead().insertRow(); table.createTBody()
    const view: DataTableView = this.#view = { root, table, headers: new Map(), sortButtons: new Map(), filters: new Map(), pages: new Map(),
      size: make("select", "page-size"), count: make("span", "count"), empty: make("p", "empty"), loading: make("p", "loading"), all: null, summaries: [],
      rows: this.#rows, writeRows: data => this.#writeRows(data, this.#data) }
    const header = (text: string) => { const th = doc.createElement("th"); th.scope = "col"; th.textContent = text; head.append(th); return th }
    const button = (part: string, value: string, text: string) => { const node = make("button", part, value); node.type = "button"; node.textContent = text; return node }
    if (selection) {
      const check = view.all = make("input", "check-all"); check.type = "checkbox"; check.dataset.dataScope = selection.scope
      check.setAttribute("aria-label", `Select ${selection.scope}`); header("").append(check)
    }
    const operations = columns.map((column, i): DataTableColumn => {
      const text = (row: DataTableRecord) => row.values[i] === null ? "" : String(row.values[i])
      const th = header(column.label); th.dataset.dataColumn = column.key; view.headers.set(column.key, th)
      const compare = column.compare ?? (column.sort ? (a: DataTableRecord, b: DataTableRecord) => {
        const left = column.sort === "number" ? Number(text(a)) : text(a), right = column.sort === "number" ? Number(text(b)) : text(b)
        return left < right ? -1 : left > right ? 1 : 0
      } : undefined)
      const filter = column.filter ?? (column.filterable ? (row: DataTableRecord, value: string) => text(row).toLocaleLowerCase().includes(value.toLocaleLowerCase()) : undefined)
      if (compare) { const sort = button("sort", column.key, column.label); th.textContent = ""; th.append(sort); view.sortButtons.set(sort, column.key) }
      if (filter) {
        const label = doc.createElement("label"), input = make("input", "filter", column.key)
        input.type = "search"; input.defaultValue = initial.filters && Object.hasOwn(initial.filters, column.key) ? initial.filters[column.key]! : ""
        label.append(`Filter ${column.label} `, input); controls.append(label)
        view.filters.set(column.key, input)
      }
      return { key: column.key, ...(compare && { compare }), ...(filter && { filter }) }
    })
    const size = view.size!, label = doc.createElement("label")
    for (const value of [...new Set([...(pageSizes ?? [10, 25, 50, 100]), ...(initial.pageSize ? [initial.pageSize] : [])]), null]) {
      const option = doc.createElement("option"); option.value = value === null ? "all" : String(value); option.textContent = value === null ? "All" : String(value)
      option.defaultSelected = value === (initial.pageSize ?? null); size.append(option)
    }
    label.append("Page size ", size); controls.append(label)
    for (const action of ["previous", "next"] as const) {
      const node = button("page", action, action === "previous" ? "Previous" : "Next"); view.pages.set(node, action); controls.append(node)
    }
    controls.append(view.count!)
    for (const config of summaries ?? []) {
      const cell = (table.tFoot ?? table.createTFoot()).insertRow().insertCell(); cell.colSpan = columns.length + Number(!!selection)
      const node = make("span", "summary", config.key); cell.append(`${config.key}: `, node); view.summaries.push({ config, node })
    }
    const scroll = doc.createElement("div"); scroll.className = "m-data-table-scroll"; scroll.append(table)
    view.empty!.textContent = "No matching rows"; view.loading!.textContent = "Loading"
    root.append(controls, scroll, view.empty!, view.loading!); this.append(root)
    this.#operations = { columns: operations }
    this.#writeRows(this.#data, [])
  }
}
