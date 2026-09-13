import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { positiveInteger } from "./model.js"

/**
 * Optional direct Grid child with explicit column span/start. Native direct children also participate.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class GridItem extends ViewElement {
  public static readonly tag = "m-grid-item"
  public static readonly observedAttributes = ["span", "start"]
  private initialized = false
  private readonly writes = ownedWrites()

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }
  public disconnectedCallback(): void { this.writes.restore() }
  public attributeChangedCallback(): void { if (this.initialized && this.isConnected) this.render() }

  /** Positive column span. Native CSS can create implicit tracks; no clamping or zero-span hiding.
   * @min 1
   * @integer
   */
  public get span(): number { return positiveInteger(this.numberAttribute("span", 1)) }
  public set span(value: number) { positiveInteger(value); this.setAttribute("span", String(value)) }
  /** Absolute positive column line, not relative offset. Null uses native auto-placement/style resources.
   * @min 1
   * @integer
   */
  public get start(): number | null {
    const value = this.numberAttribute("start", null)
    return value === null ? null : positiveInteger(value)
  }
  public set start(value: number | null) {
    if (value !== null) positiveInteger(value)
    this.setStringAttribute("start", value === null ? null : String(value))
  }

  private render(): void {
    const span = this.span, start = this.start
    this.writes.restore()
    if (this.hasAttribute("span")) this.writes.style(this, "--_m-grid-span", String(span))
    if (start !== null) this.writes.style(this, "--_m-grid-start", String(start))
  }
}
