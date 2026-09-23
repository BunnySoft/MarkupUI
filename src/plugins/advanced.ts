import { advancedStyles as styles } from "./advanced.styles.js"
import type { MarkupUIApi } from "../core/api.js"
import type { MPlugin } from "../core/plugin.js"

interface DataColumn {
  readonly key: string
  readonly label: string
  readonly sortable: boolean
}

export interface DataGridElement extends HTMLElement {
  rows: ReadonlyArray<Record<string, unknown>>
  refresh(): void
}

function validateRows(rows: unknown): asserts rows is ReadonlyArray<Record<string, unknown>> {
  if (!Array.isArray(rows) || rows.length > 1000) throw new TypeError("DataGrid accepts at most 1000 object rows.")
  for (const row of rows) {
    if (!row || typeof row !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(row))
      || Object.getOwnPropertySymbols(row).length) throw new TypeError("DataGrid rows must be plain records.")
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(row))) {
      const value: unknown = descriptor.value
      if (["__proto__", "prototype", "constructor"].includes(key) || descriptor.get || descriptor.set
        || value != null && typeof value !== "string" && typeof value !== "boolean"
        && !(typeof value === "number" && Number.isFinite(value))) {
        throw new TypeError("DataGrid cells must be plain finite scalar values.")
      }
    }
  }
}

export const advancedElementNames = [
  "m-data-column",
  "m-data-grid",
] as const

export const advancedPlugin: MPlugin<MarkupUIApi> = {
  name: "advanced",
  install(api) {
    const Base = api.elements.Base

    class DataColumnElement extends Base {
      public static readonly tag = "m-data-column"
      public get key(): string { return this.getAttribute("key") ?? "" }
      public set key(value: string) { this.setStringAttribute("key", value) }
      public get label(): string { return this.getAttribute("label") ?? this.key }
      public set label(value: string | null) { this.setStringAttribute("label", value) }
      public get sortable(): boolean { return this.hasAttribute("sortable") }
      public set sortable(value: boolean) { this.setBooleanAttribute("sortable", value) }
      public connectedCallback(): void { this.upgradeProperties() }
    }

    class DataGrid extends Base {
      public static readonly tag = "m-data-grid"
      private table: HTMLTableElement | undefined
      private data: ReadonlyArray<Record<string, unknown>> = []
      private sortKey = ""
      private sortDirection: "asc" | "desc" = "asc"
      private active = false
      private observer: MutationObserver | undefined
      private headers = new Map<string, { cell: HTMLTableCellElement; button: HTMLButtonElement | null }>()
      private onSort = (event: Event): void => {
        if (!this.active || !(event.target instanceof Element)) return
        const button = event.target.closest("button")
        const key = [...this.headers].find(([, header]) => header.button === button)?.[0]
        const column = this.columns().find(column => column.key === key && column.sortable)
        if (column) this.sort(column)
      }

      public connectedCallback(): void {
        this.upgradeProperties()
        this.active = true
        this.observer = new MutationObserver(records => {
          if (!records.some(record => record.type === "attributes"
            ? record.target.parentNode === this && (record.target as Element).localName === "m-data-column"
            : record.target === this && [...record.addedNodes, ...record.removedNodes]
              .some(node => node instanceof Element && node.localName === "m-data-column"))) return
          try { this.refresh() } catch (error) { this.emit("m:error", error) }
        })
        this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["key", "label", "sortable"] })
        this.refresh()
      }

      public disconnectedCallback(): void {
        this.active = false
        this.observer?.disconnect()
        this.observer = undefined
        this.table?.tHead?.removeEventListener("click", this.onSort)
      }

      public get rows(): ReadonlyArray<Record<string, unknown>> {
        return this.data
      }

      public set rows(value: ReadonlyArray<Record<string, unknown>>) {
        validateRows(value)
        this.columns()
        this.data = value
        this.refresh()
      }

      private columns(): DataColumn[] {
        const columns = [...this.querySelectorAll<HTMLElement>(":scope > m-data-column")].map((column) => ({
          key: column.getAttribute("key") ?? "",
          label: column.getAttribute("label") ?? column.getAttribute("key") ?? "",
          sortable: column.hasAttribute("sortable"),
        }))
        const keys = new Set<string>()
        if (columns.length > 32) throw new RangeError("DataGrid accepts at most 32 columns.")
        for (const column of columns) {
          if (!column.key.trim() || ["__proto__", "prototype", "constructor"].includes(column.key) || keys.has(column.key)) {
            throw new TypeError("DataGrid columns require unique, safe nonempty keys.")
          }
          keys.add(column.key)
        }
        return columns
      }

      private sortedRows(): ReadonlyArray<Record<string, unknown>> {
        if (!this.sortKey) return this.data
        return [...this.data].sort((left, right) => {
          const a = String(Object.hasOwn(left, this.sortKey) ? left[this.sortKey] ?? "" : "")
          const b = String(Object.hasOwn(right, this.sortKey) ? right[this.sortKey] ?? "" : "")
          const result = a.localeCompare(b, undefined, { numeric: true })
          return this.sortDirection === "asc" ? result : -result
        })
      }

      private sort(column: DataColumn): void {
        validateRows(this.data)
        this.sortDirection = this.sortKey === column.key && this.sortDirection === "asc"
          ? "desc"
          : "asc"
        this.sortKey = column.key
        this.refresh()
        this.emit("m:sort", { key: this.sortKey, direction: this.sortDirection })
      }

      public refresh(): void {
        if (!this.active) return
        const columns = this.columns()
        validateRows(this.data)
        if (!columns.some(column => column.key === this.sortKey && column.sortable)) this.sortKey = ""
        if (!this.table) {
          this.table = this.ownerDocument.createElement("table")
          this.table.dataset.part = "table"
          this.table.createTHead().insertRow()
          this.table.createTBody()
        }
        const table = this.table, head = table.tHead!.rows[0]!
        table.tHead!.addEventListener("click", this.onSort)
        const focused = [...this.headers.values()].find(header => header.button === this.ownerDocument.activeElement)?.button
        for (const [key, header] of this.headers) {
          if (!columns.some(column => column.key === key)) { header.cell.remove(); this.headers.delete(key) }
        }
        columns.forEach((column, index) => {
          let header = this.headers.get(column.key)
          if (!header) {
            const cell = this.ownerDocument.createElement("th")
            cell.scope = "col"
            header = { cell, button: null }
            this.headers.set(column.key, header)
          }
          const { cell } = header
          if (column.sortable) {
            if (!header.button) {
              header.button = this.ownerDocument.createElement("button")
              header.button.type = "button"
              cell.replaceChildren(header.button)
            }
            header.button.textContent = column.label
            cell.setAttribute("aria-sort", column.key === this.sortKey ? this.sortDirection === "asc" ? "ascending" : "descending" : "none")
          } else {
            cell.textContent = column.label
            cell.removeAttribute("aria-sort")
            header.button = null
          }
          if (head.children[index] !== cell) head.insertBefore(cell, head.children[index] ?? null)
        })
        const body = table.tBodies[0]!
        body.replaceChildren()
        this.sortedRows().forEach((row) => {
          const tableRow = body.insertRow()
          columns.forEach((column) => {
            tableRow.insertCell().textContent = String(Object.hasOwn(row, column.key) ? row[column.key] ?? "" : "")
          })
        })
        if (!columns.length) table.remove()
        else if (table.parentNode !== this) this.append(table)
        if (focused && this.ownerDocument.activeElement !== focused) {
          const target = [...this.headers.values()].some(header => header.button === focused)
            ? focused : [...this.headers.values()].find(header => header.button)?.button
          target?.focus({ preventScroll: true })
        }
      }
    }

    Base.register([DataColumnElement, DataGrid])
    const style = document.createElement("style")
    style.id = "m-advanced-styles"
    style.textContent = styles
    if (document.getElementById(style.id) === null) document.head.append(style)
  },
}
