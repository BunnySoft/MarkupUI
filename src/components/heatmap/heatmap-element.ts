import { ViewElement } from "../../core/index.js"

/**
 * A calendar-by-week heatmap matrix component displaying values across rows and columns.
 * @region {"name":"content","accepts":["table","legend","content"],"min":0,"max":null}
 * @event {"name":"HeatmapChange","web":"m:heatmap-change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"HeatmapExplore","web":"m:heatmap-explore","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 */
export class Heatmap extends ViewElement {
  public static readonly tag = "m-heatmap"
  public static get observedAttributes(): string[] {
    return ["rows", "columns"]
  }

  private initialized = false
  private generatedContainer: HTMLDivElement | undefined
  private generatedTable: HTMLTableElement | undefined
  private generatedBody: HTMLTableSectionElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-heatmap")
    this.dataset.mHeatmap = ""
    this.render()
  }

  public disconnectedCallback(): void {
    // No-op
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.initialized && this.isConnected) {
      this.render()
    }
  }

  /**
   * Number of rows in the heatmap grid.
   * @min 1
   * @integer
   */
  public get rows(): number {
    return this.numberAttribute("rows", 7)
  }
  public set rows(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
      throw new RangeError("Invalid rows.")
    }
    this.setAttribute("rows", String(value))
  }

  /**
   * Number of columns in the heatmap grid.
   * @min 1
   * @integer
   */
  public get columns(): number {
    return this.numberAttribute("columns", 12)
  }
  public set columns(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
      throw new RangeError("Invalid columns.")
    }
    this.setAttribute("columns", String(value))
  }

  public refresh(): void {
    if (this.isConnected) {
      this.render()
    }
  }

  private render(): void {
    const authoredTable = this.querySelector(":scope > table, :scope > [data-heatmap-scroll] > table") as HTMLTableElement | null
    if (authoredTable && authoredTable !== this.generatedTable) return

    let r: number, c: number
    try {
      r = this.rows
      c = this.columns
    } catch {
      return
    }

    const doc = this.ownerDocument
    if (!this.generatedContainer) {
      const scroll = doc.createElement("div")
      scroll.setAttribute("data-heatmap-scroll", "")
      const table = doc.createElement("table")
      table.setAttribute("data-heatmap-table", "")
      const tbody = doc.createElement("tbody")
      tbody.setAttribute("data-heatmap-body", "")
      table.append(tbody)
      scroll.append(table)
      this.append(scroll)
      this.generatedContainer = scroll
      this.generatedTable = table
      this.generatedBody = tbody
    }

    const tbody = this.generatedBody!

    tbody.replaceChildren()
    for (let rowIndex = 0; rowIndex < r; ++rowIndex) {
      const tr = doc.createElement("tr")
      for (let colIndex = 0; colIndex < c; ++colIndex) {
        const td = doc.createElement("td")
        const button = doc.createElement("button")
        button.type = "button"
        button.setAttribute("data-heatmap-day", "")
        const swatch = doc.createElement("span")
        swatch.setAttribute("data-heatmap-swatch", "")
        swatch.setAttribute("aria-hidden", "true")
        button.append(swatch)
        td.append(button)
        tr.append(td)
      }
      tbody.append(tr)
    }
  }
}

export const MHeatmap = Heatmap
