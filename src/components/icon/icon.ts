import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"

const depths = ["1", "2", "3", "4", "5"] as const

function size(value: number | null): number | null {
  if (value !== null && (!Number.isFinite(value) || value <= 0)) {
    throw new RangeError("Icon size must be positive and finite.")
  }
  return value
}

/**
 * A passive frame for authored SVG, images or glyphs. Native content owns its accessible name.
 * @region {"name":"content","accepts":["SVG","image","text"],"min":0,"max":1}
 */
export class Icon extends ViewElement {
  public static readonly tag = "m-icon"
  public static readonly observedAttributes = ["size", "depth"]
  private initialized = false
  private readonly writes = ownedWrites()

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.render()
  }

  public disconnectedCallback(): void {
    this.writes.restore()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) {
      this.render()
    }
  }

  /** CSS pixels on Web; null preserves inherited or authored sizing.
   * @minExclusive 0
   */
  public get size(): number | null {
    return size(this.numberAttribute("size", null))
  }

  public set size(value: number | null) {
    size(value)
    this.setStringAttribute("size", value === null ? null : String(value))
  }

  /** A theme opacity level, not a semantic or disabled state.
   * @integer
   * @min 1
   * @max 5
   */
  public get depth(): number | null {
    const value = this.choiceAttribute("depth", depths, null)
    return value === null ? null : Number(value)
  }

  public set depth(value: number | null) {
    if (value !== null && (!Number.isInteger(value) || value < 1 || value > 5)) {
      throw new RangeError("Icon depth must be an integer from 1 to 5.")
    }
    this.setStringAttribute("depth", value === null ? null : String(value))
  }

  private render(): void {
    const value = this.size
    void this.depth
    this.writes.restore()
    if (value !== null) {
      this.writes.style(this, "--m-icon-size", `${value}px`)
    }
  }
}

/**
 * A passive visual frame. Put it inside a native button/link when an action is needed.
 * @region {"name":"content","accepts":["Icon","native graphic","text"],"min":0,"max":1}
 */
export class IconWrapper extends ViewElement {
  public static readonly tag = "m-icon-wrapper"
  public static readonly observedAttributes = ["size"]
  private initialized = false
  private readonly writes = ownedWrites()

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.render()
  }

  public disconnectedCallback(): void {
    this.writes.restore()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) {
      this.render()
    }
  }

  /** CSS pixels on Web; null uses the style resource, whose default is 24px.
   * @minExclusive 0
   */
  public get size(): number | null {
    return size(this.numberAttribute("size", null))
  }

  public set size(value: number | null) {
    size(value)
    this.setStringAttribute("size", value === null ? null : String(value))
  }

  private render(): void {
    const value = this.size
    this.writes.restore()
    if (value !== null) {
      this.writes.style(this, "--m-icon-wrapper-size", `${value}px`)
    }
  }
}
