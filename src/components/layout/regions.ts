import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { layoutPositions, nonnegativeNumber, siderSides } from "./model.js"
import type { LayoutPosition, LayoutSide } from "./model.js"

/**
 * Fixed-size layout header region.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class LayoutHeader extends ViewElement {
  public static readonly tag = "m-layout-header"
  public static readonly observedAttributes = ["bordered", "inverted", "position"]
  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.render()
  }

  /** Separator border on the block-end edge. */
  public get bordered(): boolean { return this.hasAttribute("bordered") }
  public set bordered(value: boolean) { this.setBooleanAttribute("bordered", value) }

  /** Dark inverted appearance with light foreground tokens. */
  public get inverted(): boolean { return this.hasAttribute("inverted") }
  public set inverted(value: boolean) { this.setBooleanAttribute("inverted", value) }

  /** Normal flow or absolute positioning pinned to block-start. */
  public get position(): LayoutPosition { return this.choiceAttribute("position", layoutPositions, "static") }
  public set position(value: LayoutPosition) { this.setChoiceAttribute("position", value, layoutPositions) }

  private render(): void {
    void this.bordered; void this.inverted; void this.position
  }
}

/**
 * Flexible content region filling remaining layout space.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class LayoutContent extends ViewElement {
  public static readonly tag = "m-layout-content"
  public static readonly observedAttributes = ["embedded", "position"]
  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.render()
  }

  /** Embedded background token on nested content. */
  public get embedded(): boolean { return this.hasAttribute("embedded") }
  public set embedded(value: boolean) { this.setBooleanAttribute("embedded", value) }

  /** Normal flow or absolute positioning within an application containing block. */
  public get position(): LayoutPosition { return this.choiceAttribute("position", layoutPositions, "static") }
  public set position(value: LayoutPosition) { this.setChoiceAttribute("position", value, layoutPositions) }

  private render(): void {
    void this.embedded; void this.position
  }
}

/**
 * Fixed-size layout footer region.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class LayoutFooter extends ViewElement {
  public static readonly tag = "m-layout-footer"
  public static readonly observedAttributes = ["bordered", "inverted", "position"]
  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.render()
  }

  /** Separator border on the block-start edge. */
  public get bordered(): boolean { return this.hasAttribute("bordered") }
  public set bordered(value: boolean) { this.setBooleanAttribute("bordered", value) }

  /** Dark inverted appearance with light foreground tokens. */
  public get inverted(): boolean { return this.hasAttribute("inverted") }
  public set inverted(value: boolean) { this.setBooleanAttribute("inverted", value) }

  /** Normal flow or absolute positioning pinned to block-end. */
  public get position(): LayoutPosition { return this.choiceAttribute("position", layoutPositions, "static") }
  public set position(value: LayoutPosition) { this.setChoiceAttribute("position", value, layoutPositions) }

  private render(): void {
    void this.bordered; void this.inverted; void this.position
  }
}

/**
 * Layout sidebar region with logical start/end placement and collapsible width.
 * @region {"name":"content","accepts":["native flow","text","components","details"],"min":0,"max":null}
 */
export class LayoutSider extends ViewElement {
  public static readonly tag = "m-layout-sider"
  public static readonly observedAttributes = ["bordered", "inverted", "position", "side", "width", "collapsed-width", "collapsed"]
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

  /** Separator border on the inner inline edge. */
  public get bordered(): boolean { return this.hasAttribute("bordered") }
  public set bordered(value: boolean) { this.setBooleanAttribute("bordered", value) }

  /** Dark inverted appearance with light foreground tokens. */
  public get inverted(): boolean { return this.hasAttribute("inverted") }
  public set inverted(value: boolean) { this.setBooleanAttribute("inverted", value) }

  /** Normal flow or absolute positioning pinned to the inline side. */
  public get position(): LayoutPosition { return this.choiceAttribute("position", layoutPositions, "static") }
  public set position(value: LayoutPosition) { this.setChoiceAttribute("position", value, layoutPositions) }

  /** Logical start or end border and positioning edge. */
  public get side(): LayoutSide { return this.choiceAttribute("side", siderSides, "start") }
  public set side(value: LayoutSide) { this.setChoiceAttribute("side", value, siderSides) }

  /** Sider width in CSS pixels when expanded; null uses style resources, initially 272px.
   * @min 0
   */
  public get width(): number | null { return nonnegativeNumber(this.numberAttribute("width", null)) }
  public set width(value: number | null) {
    if (value !== null) nonnegativeNumber(value)
    this.setStringAttribute("width", value === null ? null : String(value))
  }

  /** Collapsed sider width in CSS pixels when closed; null uses style resources, initially 48px.
   * @min 0
   */
  public get collapsedWidth(): number | null { return nonnegativeNumber(this.numberAttribute("collapsed-width", null)) }
  public set collapsedWidth(value: number | null) {
    if (value !== null) nonnegativeNumber(value)
    this.setStringAttribute("collapsed-width", value === null ? null : String(value))
  }

  /** Collapsed sidebar width when closed; native details disclosure hides content. */
  public get collapsed(): boolean { return this.hasAttribute("collapsed") }
  public set collapsed(value: boolean) { this.setBooleanAttribute("collapsed", value) }

  private render(): void {
    const width = this.width, collapsedWidth = this.collapsedWidth
    void this.bordered; void this.inverted; void this.position; void this.side; void this.collapsed
    this.writes.restore()
    if (width !== null) this.writes.style(this, "--_m-layout-sider-width", `${width}px`)
    if (collapsedWidth !== null) this.writes.style(this, "--_m-layout-sider-collapsed-width", `${collapsedWidth}px`)
  }
}
