import { ViewElement } from "../../core/index.js"

export type DataTableSize = "small" | "medium" | "large"
export const dataTableSizes: readonly DataTableSize[] = ["small", "medium", "large"] as const

/**
 * Canonical Data Table component extending ViewElement.
 * Retains native table rendering and semantics with sorting, filtering, and pagination presentation.
 * @region {"name":"content","accepts":["table","controls","regions","content"],"min":0,"max":null}
 * @event {"name":"DataTableChange","web":"m:data-table-change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"DataTableError","web":"m:data-table-error","bubbles":true,"cancelable":false,"composed":false}
 */
export class DataTable extends ViewElement {
  public static readonly tag = "m-data-table"
  public static get observedAttributes(): string[] {
    return [
      "bordered",
      "striped",
      "single-line",
      "size",
      "pagination",
    ]
  }

  private initialized = false
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.mDataTable = ""
    this.dataset.dataTable = ""
    this.classList.add("m-data-table")
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.synchronize()
  }

  public get bordered(): boolean {
    return this.booleanAttribute("bordered", true)
  }
  public set bordered(value: boolean) {
    this.setBooleanAttribute("bordered", value, false)
  }

  public get striped(): boolean {
    return this.hasAttribute("striped")
  }
  public set striped(value: boolean) {
    this.setBooleanAttribute("striped", value)
  }

  public get singleLine(): boolean {
    return this.booleanAttribute("single-line", true)
  }
  public set singleLine(value: boolean) {
    this.setBooleanAttribute("single-line", value, false)
  }

  public get size(): DataTableSize {
    return this.choiceAttribute("size", dataTableSizes, "medium")
  }
  public set size(value: DataTableSize) {
    this.setChoiceAttribute("size", value, dataTableSizes)
  }

  public get pagination(): boolean {
    return this.hasAttribute("pagination")
  }
  public set pagination(value: boolean) {
    this.setBooleanAttribute("pagination", value)
  }

  public get table(): HTMLTableElement | null {
    return this.querySelector<HTMLTableElement>("table")
  }

  private synchronize(): void {
    this.observer?.disconnect()
    const table = this.querySelector<HTMLElement>("m-table, table")
    if (table) {
      if (!table.classList.contains("m-table")) table.classList.add("m-table")
      if (this.bordered) {
        table.removeAttribute("data-bordered")
        if (table.localName === "m-table") table.removeAttribute("bordered")
      } else {
        table.dataset.bordered = "false"
        if (table.localName === "m-table") table.setAttribute("bordered", "false")
      }

      if (this.singleLine) {
        table.removeAttribute("data-single-line")
        if (table.localName === "m-table") table.removeAttribute("single-line")
      } else {
        table.dataset.singleLine = "false"
        if (table.localName === "m-table") table.setAttribute("single-line", "false")
      }

      if (this.size !== "medium") {
        table.dataset.size = this.size
        if (table.localName === "m-table") table.setAttribute("size", this.size)
      } else {
        delete table.dataset.size
        if (table.localName === "m-table") table.removeAttribute("size")
      }

      table.toggleAttribute("data-striped", this.striped)
      if (table.localName === "m-table") table.toggleAttribute("striped", this.striped)
    }
    if (this.isConnected) {
      this.observer?.observe(this, { childList: true, subtree: true })
    }
  }
}

export { DataTable as MDataTable }
