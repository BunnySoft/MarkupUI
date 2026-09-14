import { ViewElement } from "../../core/index.js"
import { floatButtonTypes, floatButtonShapes } from "./model.js"
import type { FloatButtonType, FloatButtonShape, FloatButtonClickDetail } from "./model.js"

export type { FloatButtonType, FloatButtonShape, FloatButtonClickDetail } from "./model.js"

/**
 * A floating button component for quick actions fixed or positioned on the page.
 * @region {"name":"content","accepts":["text","phrasing","icon"],"min":0,"max":null}
 * @region {"name":"description","accepts":["text","phrasing"],"min":0,"max":1}
 * @event {"name":"Click","web":"m:click","bubbles":true,"cancelable":true,"composed":false,"detail":{"originalEvent":"MouseEvent"}}
 */
export class FloatButton extends ViewElement {
  public static readonly tag = "m-float-button"
  public static get observedAttributes(): string[] {
    return ["type", "shape", "right", "bottom"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mFloatButton = ""
    this.classList.add("m-float-button")
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", this.hasAttribute("href") ? "link" : "button")
    }
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0")
    }
    this.updatePosition()
    this.updatePresentation()

    this.addEventListener("click", this.onClick)
    this.addEventListener("keydown", this.onKeyDown)
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.onClick)
    this.removeEventListener("keydown", this.onKeyDown)
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === "right" || name === "bottom") {
      this.updatePosition()
    } else if (name === "type" || name === "shape") {
      this.updatePresentation()
    }
  }

  public get type(): FloatButtonType {
    return this.choiceAttribute("type", floatButtonTypes, "default")
  }
  public set type(value: FloatButtonType) {
    this.setChoiceAttribute("type", value, floatButtonTypes)
    this.updatePresentation()
  }

  public get shape(): FloatButtonShape {
    return this.choiceAttribute("shape", floatButtonShapes, "circle")
  }
  public set shape(value: FloatButtonShape) {
    this.setChoiceAttribute("shape", value, floatButtonShapes)
    this.updatePresentation()
  }

  public get right(): string | number | null {
    const value = this.getAttribute("right")
    if (value === null) return null
    const num = Number(value)
    return Number.isFinite(num) && value.trim() === String(num) ? num : value
  }
  public set right(value: string | number | null) {
    if (value !== null && typeof value !== "string" && typeof value !== "number") {
      throw new RangeError("Invalid right.")
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new RangeError("Invalid right.")
    }
    if (value === null) {
      this.removeAttribute("right")
    } else {
      this.setAttribute("right", String(value))
    }
    this.updatePosition()
  }

  public get bottom(): string | number | null {
    const value = this.getAttribute("bottom")
    if (value === null) return null
    const num = Number(value)
    return Number.isFinite(num) && value.trim() === String(num) ? num : value
  }
  public set bottom(value: string | number | null) {
    if (value !== null && typeof value !== "string" && typeof value !== "number") {
      throw new RangeError("Invalid bottom.")
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new RangeError("Invalid bottom.")
    }
    if (value === null) {
      this.removeAttribute("bottom")
    } else {
      this.setAttribute("bottom", String(value))
    }
    this.updatePosition()
  }

  private updatePosition(): void {
    const right = this.getAttribute("right")
    if (right !== null) {
      const val = Number.isFinite(Number(right)) ? `${right}px` : right
      this.style.setProperty("--m-float-inline-end", val)
    } else {
      this.style.removeProperty("--m-float-inline-end")
    }
    const bottom = this.getAttribute("bottom")
    if (bottom !== null) {
      const val = Number.isFinite(Number(bottom)) ? `${bottom}px` : bottom
      this.style.setProperty("--m-float-block-end", val)
    } else {
      this.style.removeProperty("--m-float-block-end")
    }
  }

  private updatePresentation(): void {
    try {
      this.dataset.type = this.type
    } catch {
      // Preserve dataset if attribute is invalid
    }
    try {
      this.dataset.shape = this.shape
    } catch {
      // Preserve dataset if attribute is invalid
    }
  }

  private onClick = (event: MouseEvent): void => {
    if (this.hasAttribute("disabled") || this.getAttribute("aria-disabled") === "true") {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
    const custom = this.emit<FloatButtonClickDetail>(
      "m:click",
      { originalEvent: event },
      { bubbles: true, cancelable: true, composed: false },
    )
    if (!custom) {
      event.preventDefault()
    }
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.hasAttribute("disabled") || this.getAttribute("aria-disabled") === "true") return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      this.click()
    }
  }
}
