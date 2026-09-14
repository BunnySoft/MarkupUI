import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { spaceAlignments, spaceJustifications, spaceSizes } from "./model.js"
import type { SpaceAlign, SpaceJustify, SpaceSize } from "./model.js"

function gap(v: number | null): number | null {
  if (v !== null && (!Number.isFinite(v) || v < 0)) throw new RangeError("Invalid gap")
  return v
}

/**
 * Native layout of author-owned children, without generated items or semantic owners.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class Space extends ViewElement {
  public static readonly tag = "m-space"
  public static readonly observedAttributes = "vertical inline wrap size align justify row-gap column-gap".split(" ")
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
  public set vertical(v: boolean) { this.setBooleanAttribute("vertical", v) }
  public get inline(): boolean { return this.hasAttribute("inline") }
  public set inline(v: boolean) { this.setBooleanAttribute("inline", v) }
  /** Row wrapping preference; vertical layout always uses nowrap. */
  public get wrap(): boolean { return this.booleanAttribute("wrap", true) }
  public set wrap(v: boolean) { this.setBooleanAttribute("wrap", v, false) }
  public get size(): SpaceSize { return this.choiceAttribute("size", spaceSizes, "medium") }
  public set size(v: SpaceSize) { this.setChoiceAttribute("size", v, spaceSizes) }
  public get align(): SpaceAlign { return this.choiceAttribute("align", spaceAlignments, "normal") }
  public set align(v: SpaceAlign) { this.setChoiceAttribute("align", v, spaceAlignments) }
  public get justify(): SpaceJustify { return this.choiceAttribute("justify", spaceJustifications, "start") }
  public set justify(v: SpaceJustify) { this.setChoiceAttribute("justify", v, spaceJustifications) }

  /** CSS pixels on Web; null uses the preset/style resource. Independent of direction.
   * @min 0
   */
  public get rowGap(): number | null { return gap(this.numberAttribute("row-gap", null)) }
  public set rowGap(v: number | null) { gap(v); this.setStringAttribute("row-gap", v == null ? null : String(v)) }
  /** CSS pixels on Web; null uses the preset/style resource. Independent of direction.
   * @min 0
   */
  public get columnGap(): number | null { return gap(this.numberAttribute("column-gap", null)) }
  public set columnGap(v: number | null) { gap(v); this.setStringAttribute("column-gap", v == null ? null : String(v)) }

  private render(): void {
    const r = this.rowGap, c = this.columnGap
    this.writes.restore()
    if (r !== null) this.writes.style(this, "row-gap", `${r}px`)
    if (c !== null) this.writes.style(this, "column-gap", `${c}px`)
  }
}
