import { advancedStyles as styles } from "./advanced.styles.js"
import type { MarkupUIApi } from "../core/api.js"
import type { MPlugin } from "../core/plugin.js"

interface DataColumn {
  readonly key: string
  readonly label: string
  readonly sortable: boolean
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
    }

    class DataGrid extends Base {
      public static readonly tag = "m-data-grid"
      private table: HTMLTableElement | undefined
      private data: ReadonlyArray<Record<string, unknown>> = []
      private sortKey = ""
      private sortDirection: "asc" | "desc" = "asc"

      public connectedCallback(): void {
        this.render()
      }

      public get rows(): ReadonlyArray<Record<string, unknown>> {
        return this.data
      }

      public set rows(value: ReadonlyArray<Record<string, unknown>>) {
        this.data = Array.isArray(value) ? value : []
        this.render()
      }

      private columns(): DataColumn[] {
        return [...this.querySelectorAll<HTMLElement>(":scope > m-data-column")].map((column) => ({
          key: column.getAttribute("key") ?? "",
          label: column.getAttribute("label") ?? column.getAttribute("key") ?? "",
          sortable: column.hasAttribute("sortable"),
        })).filter((column) => column.key !== "")
      }

      private sortedRows(): ReadonlyArray<Record<string, unknown>> {
        if (!this.sortKey) return this.data
        return [...this.data].sort((left, right) => {
          const a = String(left[this.sortKey] ?? "")
          const b = String(right[this.sortKey] ?? "")
          const result = a.localeCompare(b, undefined, { numeric: true })
          return this.sortDirection === "asc" ? result : -result
        })
      }

      private sort(column: DataColumn): void {
        if (!column.sortable) return
        this.sortDirection = this.sortKey === column.key && this.sortDirection === "asc"
          ? "desc"
          : "asc"
        this.sortKey = column.key
        this.render()
        this.dispatchEvent(new CustomEvent("m:sort", {
          bubbles: true,
          detail: { key: this.sortKey, direction: this.sortDirection },
        }))
      }

      private render(): void {
        if (!this.isConnected) return
        const columns = this.columns()
        if (columns.length === 0) return
        this.table = this.ownerDocument.createElement("table")
        const head = this.table.createTHead().insertRow()
        columns.forEach((column) => {
          const cell = this.ownerDocument.createElement("th")
          cell.scope = "col"
          cell.textContent = column.label
          if (column.sortable) {
            cell.toggleAttribute("sortable", true)
            cell.tabIndex = 0
            cell.addEventListener("click", () => this.sort(column))
            cell.addEventListener("keydown", (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                this.sort(column)
              }
            })
          }
          head.append(cell)
        })
        const body = this.table.createTBody()
        this.sortedRows().forEach((row) => {
          const tableRow = body.insertRow()
          columns.forEach((column) => {
            tableRow.insertCell().textContent = String(row[column.key] ?? "")
          })
        })
        this.querySelectorAll(":scope > table").forEach((table) => table.remove())
        this.append(this.table)
      }
    }

    Base.register([DataColumnElement, DataGrid])
    const style = document.createElement("style")
    style.id = "m-advanced-styles"
    style.textContent = styles
    if (document.getElementById(style.id) === null) document.head.append(style)
  },
}
