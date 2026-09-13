import { ViewElement } from "../../core/index.js"
import { tableSizes } from "./model.js"
import type { TableSize } from "./model.js"

export { tableSizes } from "./model.js"
export type { TableSize } from "./model.js"

/**
 * Canonical Table component extending ViewElement.
 * Retains native table rendering and semantic table/thead/tbody/tr/th/td elements.
 * @region {"name":"content","accepts":["native table","table content"],"min":0,"max":null}
 */
export class Table extends ViewElement {
  public static readonly tag = "m-table"
  public static get observedAttributes(): string[] {
    return [
      "bordered",
      "bottom-bordered",
      "single-line",
      "single-column",
      "size",
      "striped",
    ]
  }

  private initialized = false
  private generatedTable: HTMLTableElement | undefined
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.mTable = ""
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

  public get bottomBordered(): boolean {
    return this.booleanAttribute("bottom-bordered", true)
  }
  public set bottomBordered(value: boolean) {
    this.setBooleanAttribute("bottom-bordered", value, false)
  }

  public get singleLine(): boolean {
    return this.booleanAttribute("single-line", true)
  }
  public set singleLine(value: boolean) {
    this.setBooleanAttribute("single-line", value, false)
  }

  public get singleColumn(): boolean {
    return this.hasAttribute("single-column")
  }
  public set singleColumn(value: boolean) {
    this.setBooleanAttribute("single-column", value)
  }

  public get size(): TableSize {
    return this.choiceAttribute("size", tableSizes, "medium")
  }
  public set size(value: TableSize) {
    this.setChoiceAttribute("size", value, tableSizes)
  }

  public get striped(): boolean {
    return this.hasAttribute("striped")
  }
  public set striped(value: boolean) {
    this.setBooleanAttribute("striped", value)
  }

  public get native(): HTMLTableElement | null {
    return this.querySelector(":scope > table") ?? this.generatedTable ?? null
  }

  public get caption(): HTMLTableCaptionElement | null {
    return this.native?.caption ?? null
  }

  public get tHead(): HTMLTableSectionElement | null {
    return this.native?.tHead ?? null
  }

  public get tFoot(): HTMLTableSectionElement | null {
    return this.native?.tFoot ?? null
  }

  public get tBodies(): HTMLCollectionOf<HTMLTableSectionElement> | null {
    return this.native?.tBodies ?? null
  }

  public get rows(): HTMLCollectionOf<HTMLTableRowElement> | null {
    return this.native?.rows ?? null
  }

  private synchronize(): void {
    this.observer?.disconnect()
    const authored = [...this.children].find((node): node is HTMLTableElement =>
      node instanceof HTMLTableElement && node !== this.generatedTable)
    if (authored && this.generatedTable) {
      this.generatedTable.remove()
      this.generatedTable = undefined
    }
    const loose = [...this.childNodes].filter(node =>
      node !== authored && node !== this.generatedTable && !(node instanceof Element && node.matches("template,script,style")))
    if (!authored && loose.length > 0) {
      if (!this.generatedTable) {
        this.generatedTable = this.ownerDocument.createElement("table")
        this.append(this.generatedTable)
      }
      for (const node of loose) {
        this.generatedTable.append(node)
      }
    }
    const table = authored ?? this.generatedTable
    if (table) {
      if (!table.classList.contains("m-table")) table.classList.add("m-table")
      if (this.bordered) table.removeAttribute("data-bordered")
      else table.dataset.bordered = "false"

      if (this.bottomBordered) table.removeAttribute("data-bottom-bordered")
      else table.dataset.bottomBordered = "false"

      if (this.singleLine) table.removeAttribute("data-single-line")
      else table.dataset.singleLine = "false"

      table.toggleAttribute("data-single-column", this.singleColumn)

      if (this.size !== "medium") table.dataset.size = this.size
      else delete table.dataset.size

      table.toggleAttribute("data-striped", this.striped)
    }
    if (this.isConnected) {
      this.observer?.observe(this, { childList: true })
    }
  }
}

export { Table as MTable }
