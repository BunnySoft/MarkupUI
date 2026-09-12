import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { flexAlignments, flexJustifications, flexSizes } from "./model.js"
import type { FlexAlign, FlexJustify, FlexSize } from "./model.js"

function gap(value: number | null): number | null {
  if (value !== null && (!Number.isFinite(value) || value < 0)) throw new RangeError("Flex gaps must be nonnegative finite numbers or null.")
  return value
}

/**
 * Native flex layout of author-owned nodes, without generated items or semantic owners.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class Flex extends ViewElement {
  public static readonly tag = "m-flex"
  public static readonly observedAttributes = ["vertical", "inline", "wrap", "reverse", "size", "align", "justify", "row-gap", "column-gap"]
  private initialized = false
  private readonly writes = ownedWrites()

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }

  public disconnectedCallback(): void { this.writes.restore() }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.render()
  }

  /** A column always uses nowrap, regardless of the wrap preference. */
  public get vertical(): boolean { return this.hasAttribute("vertical") }
  public set vertical(value: boolean) { this.setBooleanAttribute("vertical", value) }
  public get inline(): boolean { return this.hasAttribute("inline") }
  public set inline(value: boolean) { this.setBooleanAttribute("inline", value) }
  /** Row wrapping preference; vertical layout always uses nowrap. */
  public get wrap(): boolean { return this.booleanAttribute("wrap", true) }
  public set wrap(value: boolean) { this.setBooleanAttribute("wrap", value, false) }
  /** Visual reversal only; DOM, reading and keyboard order do not change. */
  public get reverse(): boolean { return this.hasAttribute("reverse") }
  public set reverse(value: boolean) { this.setBooleanAttribute("reverse", value) }
  public get size(): FlexSize { return this.choiceAttribute("size", flexSizes, "medium") }
  public set size(value: FlexSize) { this.setChoiceAttribute("size", value, flexSizes) }
  /** Native CSS alignment keywords, without translating start/end to flex-start/flex-end. */
  public get align(): FlexAlign { return this.choiceAttribute("align", flexAlignments, "normal") }
  public set align(value: FlexAlign) { this.setChoiceAttribute("align", value, flexAlignments) }
  /** Native CSS justification. Distributed modes can add space beyond the gap. */
  public get justify(): FlexJustify { return this.choiceAttribute("justify", flexJustifications, "start") }
  public set justify(value: FlexJustify) { this.setChoiceAttribute("justify", value, flexJustifications) }

  /** CSS pixels on Web; null uses the preset/style resource. Axes never swap.
   * @min 0
   */
  public get rowGap(): number | null { return gap(this.numberAttribute("row-gap", null)) }
  public set rowGap(value: number | null) { gap(value); this.setStringAttribute("row-gap", value === null ? null : String(value)) }
  /** CSS pixels on Web; null uses the preset/style resource. Axes never swap.
   * @min 0
   */
  public get columnGap(): number | null { return gap(this.numberAttribute("column-gap", null)) }
  public set columnGap(value: number | null) { gap(value); this.setStringAttribute("column-gap", value === null ? null : String(value)) }

  private render(): void {
    const row = this.rowGap, column = this.columnGap
    void this.size; void this.align; void this.justify; void this.wrap
    this.writes.restore()
    if (row !== null) this.writes.style(this, "row-gap", `${row}px`)
    if (column !== null) this.writes.style(this, "column-gap", `${column}px`)
  }
}
