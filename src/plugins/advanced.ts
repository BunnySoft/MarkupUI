import type { MarkupUIApi } from "../core/api.js"
import type { MuiPlugin } from "../core/plugin.js"

const styles = `
mui-data-column{display:none}
mui-data-grid{display:block;overflow:auto;border:1px solid var(--mui-border);border-radius:var(--mui-radius-md)}
mui-data-grid table{width:100%;border-collapse:collapse;background:var(--mui-bg-surface);color:var(--mui-text-primary)}
mui-data-grid th,mui-data-grid td{padding:9px 12px;border-bottom:1px solid var(--mui-border);text-align:left;white-space:nowrap}
mui-data-grid th{background:var(--mui-bg-muted);font-size:.875em;font-weight:700}
mui-data-grid th[sortable]{cursor:pointer;transition:color var(--mui-motion-fast) var(--mui-ease),background-color var(--mui-motion-fast) var(--mui-ease)}
mui-data-grid th[sortable]:hover{background:var(--mui-bg-hover);color:var(--mui-color-primary)}
mui-data-grid tbody tr{transition:background-color var(--mui-motion-fast) var(--mui-ease)}
mui-data-grid tbody tr:hover{background:var(--mui-bg-muted)}
mui-data-grid tbody tr:last-child td{border-bottom:0}
mui-date-picker,mui-time-picker,mui-upload{display:inline-flex}
mui-date-picker>input,mui-time-picker>input,mui-upload>input{min-height:var(--mui-control-height);padding:0 10px;border:1px solid var(--mui-border);border-radius:6px;background:var(--mui-bg-surface);color:var(--mui-text-primary);font:inherit;transition:border-color var(--mui-motion-fast) var(--mui-ease),box-shadow var(--mui-motion-fast) var(--mui-ease)}
mui-date-picker>input:focus,mui-time-picker>input:focus,mui-upload>input:focus{outline:0;border-color:var(--mui-color-primary);box-shadow:0 0 0 3px var(--mui-focus-ring)}
mui-virtual-list{display:block;overflow:auto;border:1px solid var(--mui-border);border-radius:var(--mui-radius-md)}
mui-virtual-list>[data-mui-virtual-space]{position:relative;width:100%}
mui-virtual-list [data-mui-virtual-item]{position:absolute;right:0;left:0;display:flex;align-items:center;padding:0 12px;border-bottom:1px solid var(--mui-border);background:var(--mui-bg-surface);transition:background-color var(--mui-motion-fast) var(--mui-ease)}
mui-virtual-list [data-mui-virtual-item]:hover{background:var(--mui-bg-muted)}
`

interface DataColumn {
  readonly key: string
  readonly label: string
  readonly sortable: boolean
}

export const advancedElementNames = [
  "mui-data-column",
  "mui-data-grid",
  "mui-date-picker",
  "mui-time-picker",
  "mui-upload",
  "mui-virtual-list",
] as const

export const advancedPlugin: MuiPlugin<MarkupUIApi> = {
  name: "advanced",
  install(api) {
    const Base = api.elements.Base

    class MuiDataColumn extends Base {}

    class MuiDataGrid extends Base {
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
        return [...this.querySelectorAll<HTMLElement>(":scope > mui-data-column")].map((column) => ({
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
        this.dispatchEvent(new CustomEvent("mui:sort", {
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

    abstract class MuiDateTimeInput extends Base {
      protected control: HTMLInputElement | undefined
      protected abstract readonly inputType: "date" | "time"
      public connectedCallback(): void {
        if (this.control !== undefined) return
        this.control = this.ownerDocument.createElement("input")
        this.control.type = this.inputType
        for (const name of ["name", "value", "min", "max", "step", "aria-label"]) {
          const value = this.getAttribute(name)
          if (value !== null) this.control.setAttribute(name, value)
        }
        this.control.addEventListener("input", () => this.emitValue("input"))
        this.control.addEventListener("change", () => this.emitValue("change"))
        this.replaceChildren(this.control)
      }
      public get value(): string { return this.control?.value ?? "" }
      public set value(value: string) { if (this.control !== undefined) this.control.value = value }
      private emitValue(name: string): void {
        this.dispatchEvent(new CustomEvent(`mui:${name}`, {
          bubbles: true,
          detail: this.value,
        }))
      }
    }

    class MuiDatePicker extends MuiDateTimeInput {
      protected readonly inputType = "date"
    }

    class MuiTimePicker extends MuiDateTimeInput {
      protected readonly inputType = "time"
    }

    class MuiUpload extends Base {
      private control: HTMLInputElement | undefined
      public connectedCallback(): void {
        if (this.control !== undefined) return
        this.control = this.ownerDocument.createElement("input")
        this.control.type = "file"
        const accept = this.getAttribute("accept")
        if (accept !== null) this.control.accept = accept
        this.control.multiple = this.hasAttribute("multiple")
        this.control.addEventListener("change", () => {
          this.dispatchEvent(new CustomEvent("mui:change", {
            bubbles: true,
            detail: [...(this.control?.files ?? [])],
          }))
        })
        this.replaceChildren(this.control)
      }
      public get files(): File[] {
        return [...(this.control?.files ?? [])]
      }
    }

    class MuiVirtualList extends Base {
      private data: readonly unknown[] = []
      private spacer: HTMLElement | undefined
      private readonly onScroll = (): void => this.renderWindow()

      public connectedCallback(): void {
        this.style.height = this.getAttribute("height") ?? "240px"
        this.spacer = this.ownerDocument.createElement("div")
        this.spacer.dataset.muiVirtualSpace = ""
        this.replaceChildren(this.spacer)
        this.addEventListener("scroll", this.onScroll)
        this.renderWindow()
      }

      public disconnectedCallback(): void {
        this.removeEventListener("scroll", this.onScroll)
      }

      public get items(): readonly unknown[] { return this.data }
      public set items(value: readonly unknown[]) {
        this.data = Array.isArray(value) ? value : []
        this.renderWindow()
      }

      private renderWindow(): void {
        if (this.spacer === undefined) return
        const itemHeight = Math.max(20, this.numberAttribute("item-height", 36))
        const viewportHeight = this.clientHeight || Number.parseInt(this.style.height, 10) || 240
        const start = Math.max(0, Math.floor(this.scrollTop / itemHeight) - 2)
        const visible = Math.ceil(viewportHeight / itemHeight) + 4
        const end = Math.min(this.data.length, start + visible)
        this.spacer.style.height = `${this.data.length * itemHeight}px`
        const elements = this.data.slice(start, end).map((item, index) => {
          const element = this.ownerDocument.createElement("div")
          element.dataset.muiVirtualItem = ""
          element.style.top = `${(start + index) * itemHeight}px`
          element.style.height = `${itemHeight}px`
          element.textContent = String(item)
          return element
        })
        this.spacer.replaceChildren(...elements)
        this.dispatchEvent(new CustomEvent("mui:rangechange", {
          bubbles: true,
          detail: { start, end },
        }))
      }
    }

    const style = document.createElement("style")
    style.id = "mui-advanced-styles"
    style.textContent = styles
    if (document.getElementById(style.id) === null) document.head.append(style)

    const constructors = [
      MuiDataColumn,
      MuiDataGrid,
      MuiDatePicker,
      MuiTimePicker,
      MuiUpload,
      MuiVirtualList,
    ] as const
    advancedElementNames.forEach((name, index) => {
      const constructor = constructors[index]
      if (constructor !== undefined) api.elements.register(name, constructor)
    })
  },
}
