import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { gridAlignments, gridJustifications, positiveInteger } from "./model.js"
import type { GridAlign, GridJustify } from "./model.js"

function gap(value: number | null): number | null {
  if (value !== null && (!Number.isFinite(value) || value < 0)) throw new RangeError("Grid gaps must be nonnegative finite numbers or null.")
  return value
}

function tracks(value: string | null, document: Document): string | null {
  if (value === null) return value
  if (typeof value !== "string" || !value.trim()) throw new RangeError("Expected CSS column tracks or null.")
  const style = document.createElement("span").style
  style.gridTemplateColumns = value
  if (!style.gridTemplateColumns) throw new RangeError("Invalid CSS column tracks.")
  return value
}

/**
 * Native CSS Grid of original children. No generated items, placement engine or semantic owner.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class Grid extends ViewElement {
  public static readonly tag = "m-grid"
  public static readonly observedAttributes = ["cols", "columns", "row-gap", "column-gap", "align", "justify"]
  private initialized = false
  private readonly writes = ownedWrites()

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }
  public disconnectedCallback(): void { this.writes.restore() }
  public attributeChangedCallback(): void { if (this.initialized && this.isConnected) this.render() }

  /** Equal minmax(0, 1fr) columns when no explicit columns/style tracks are selected.
   * @min 1
   * @integer
   */
  public get cols(): number { return positiveInteger(this.numberAttribute("cols", 24)) }
  public set cols(value: number) { positiveInteger(value); this.setAttribute("cols", String(value)) }
  /** Web CSS grid-template-columns; null uses the equal-column recipe or authored style resource.
   * CSS-wide reset/inheritance keywords lease the native declaration rather than a custom property.
   */
  public get columns(): string | null { return tracks(this.getAttribute("columns"), this.ownerDocument) }
  public set columns(value: string | null) { tracks(value, this.ownerDocument); this.setStringAttribute("columns", value) }
  /** CSS pixels on Web; null uses style resources, initially 0px. Axes never swap.
   * @min 0
   */
  public get rowGap(): number | null { return gap(this.numberAttribute("row-gap", null)) }
  public set rowGap(value: number | null) { gap(value); this.setStringAttribute("row-gap", value === null ? null : String(value)) }
  /** CSS pixels on Web; null uses style resources, initially 0px. Axes never swap.
   * @min 0
   */
  public get columnGap(): number | null { return gap(this.numberAttribute("column-gap", null)) }
  public set columnGap(value: number | null) { gap(value); this.setStringAttribute("column-gap", value === null ? null : String(value)) }
  /** Native align-items, not track distribution. */
  public get align(): GridAlign { return this.choiceAttribute("align", gridAlignments, "normal") }
  public set align(value: GridAlign) { this.setChoiceAttribute("align", value, gridAlignments) }
  /** Native justify-items, not Flex's justify-content. */
  public get justify(): GridJustify { return this.choiceAttribute("justify", gridJustifications, "normal") }
  public set justify(value: GridJustify) { this.setChoiceAttribute("justify", value, gridJustifications) }

  private render(): void {
    const cols = this.cols, columns = this.columns, row = this.rowGap, column = this.columnGap
    const align = this.align, justify = this.justify
    this.writes.restore()
    if (this.hasAttribute("cols")) this.writes.style(this, "--_m-grid-cols", String(cols))
    if (columns !== null) {
      const property = /^(inherit|initial|unset|revert|revert-layer)$/i.test(columns.trim()) ? "grid-template-columns" : "--_m-grid-tracks"
      this.writes.style(this, property, columns)
    }
    if (row !== null) this.writes.style(this, "--_m-grid-y-gap", `${row}px`)
    if (column !== null) this.writes.style(this, "--_m-grid-x-gap", `${column}px`)
    if (this.hasAttribute("align")) this.writes.style(this, "--_m-grid-align", align)
    if (this.hasAttribute("justify")) this.writes.style(this, "--_m-grid-justify", justify)
  }
}
