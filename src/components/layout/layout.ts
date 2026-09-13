import { ViewElement } from "../../core/index.js"
import { layoutPositions } from "./model.js"
import type { LayoutPosition } from "./model.js"

/**
 * Flex layout shell with column default or row layout when a sidebar is present.
 * @region {"name":"content","accepts":["native flow","text","components","Layout regions"],"min":0,"max":null}
 */
export class Layout extends ViewElement {
  public static readonly tag = "m-layout"
  public static readonly observedAttributes = ["has-sider", "embedded", "position"]
  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.render()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.render()
  }

  /** Row flex layout when a sidebar is present; column shell by default. */
  public get hasSider(): boolean { return this.hasAttribute("has-sider") }
  public set hasSider(value: boolean) { this.setBooleanAttribute("has-sider", value) }

  /** Embedded background token on nested layouts. */
  public get embedded(): boolean { return this.hasAttribute("embedded") }
  public set embedded(value: boolean) { this.setBooleanAttribute("embedded", value) }

  /** Normal flow or absolute positioning within an application containing block. */
  public get position(): LayoutPosition { return this.choiceAttribute("position", layoutPositions, "static") }
  public set position(value: LayoutPosition) { this.setChoiceAttribute("position", value, layoutPositions) }

  private render(): void {
    void this.hasSider; void this.embedded; void this.position
  }
}
