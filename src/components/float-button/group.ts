import { ViewElement } from "../../core/index.js"
import { floatButtonShapes } from "./model.js"
import type { FloatButtonShape } from "./model.js"

/**
 * A container for grouping multiple floating buttons.
 * @region {"name":"items","accepts":["FloatButton"],"min":0,"max":null,"element":"m-float-button"}
 */
export class FloatButtonGroup extends ViewElement {
  public static readonly tag = "m-float-button-group"
  public static get observedAttributes(): string[] {
    return ["shape"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mFloatGroup = ""
    this.classList.add("m-float-group")
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group")
    }
    this.updatePresentation()
  }

  public disconnectedCallback(): void {}

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === "shape") {
      this.updatePresentation()
    }
  }

  public get shape(): FloatButtonShape {
    return this.choiceAttribute("shape", floatButtonShapes, "circle")
  }
  public set shape(value: FloatButtonShape) {
    this.setChoiceAttribute("shape", value, floatButtonShapes)
    this.updatePresentation()
  }

  private updatePresentation(): void {
    try {
      this.dataset.shape = this.shape
    } catch {
      // Preserve dataset if attribute is invalid
    }
  }
}
