import { ViewElement } from "../../core/index.js"
import { buttonSizes } from "./model.js"
import type { ButtonSize } from "./model.js"

/** @region {"name":"items","accepts":["Button"],"min":0,"max":null,"element":"m-button"} */
export class ButtonGroup extends ViewElement {
  public static readonly tag = "m-button-group"
  public static get observedAttributes(): string[] { return ["size", "vertical"] }
  public connectedCallback(): void {
    this.upgradeProperties()
    this.validate()
    this.dataset.part = "button-group"
    if (!this.hasAttribute("role")) this.setAttribute("role", "group")
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.validate()
  }

  public get size(): ButtonSize | null {
    return this.choiceAttribute("size", buttonSizes, null)
  }
  public set size(value: ButtonSize | null) { this.setNullableChoiceAttribute("size", value, buttonSizes) }

  public get vertical(): boolean { return this.hasAttribute("vertical") }
  public set vertical(value: boolean) { this.setBooleanAttribute("vertical", value) }

  private validate(): void {
    void this.size
  }
}
