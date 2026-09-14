import { ViewElement } from "../../core/index.js"
import { gradientTextTypes } from "./model.js"
import type { GradientTextType } from "./model.js"

export { gradientTextTypes } from "./model.js"
export type { GradientTextType } from "./model.js"

/**
 * Text container with styled gradient background clipping.
 * @region {"name":"content","accepts":["phrasing content"],"min":0,"max":null}
 */
export class GradientText extends ViewElement {
  public static readonly tag = "m-gradient-text"
  public static get observedAttributes(): string[] {
    return ["type", "size", "weight"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.synchronize()
  }

  public disconnectedCallback(): void {
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public get type(): GradientTextType {
    return this.choiceAttribute("type", gradientTextTypes, "primary")
  }
  public set type(value: GradientTextType) {
    this.setChoiceAttribute("type", value, gradientTextTypes)
  }

  public get size(): string | number | null {
    const value = this.getAttribute("size")
    if (value === null) return null
    const trimmed = value.trim()
    if (trimmed !== "") {
      const num = Number(trimmed)
      if (Number.isFinite(num)) {
        if (num < 0) throw new RangeError("Invalid size.")
        return num
      }
    }
    return value
  }
  public set size(value: string | number | null) {
    if (value !== null && typeof value !== "string" && typeof value !== "number") {
      throw new RangeError("Invalid size.")
    }
    if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) {
      throw new RangeError("Invalid size.")
    }
    if (value === null) this.removeAttribute("size")
    else this.setAttribute("size", String(value))
  }

  public get weight(): string | number | null {
    const value = this.getAttribute("weight")
    if (value === null) return null
    const trimmed = value.trim()
    if (trimmed !== "") {
      const num = Number(trimmed)
      if (Number.isFinite(num)) {
        if (num <= 0) throw new RangeError("Invalid weight.")
        return num
      }
    }
    return value
  }
  public set weight(value: string | number | null) {
    if (value !== null && typeof value !== "string" && typeof value !== "number") {
      throw new RangeError("Invalid weight.")
    }
    if (typeof value === "number" && (!Number.isFinite(value) || value <= 0)) {
      throw new RangeError("Invalid weight.")
    }
    if (value === null) this.removeAttribute("weight")
    else this.setAttribute("weight", String(value))
  }

  private synchronize(): void {
    this.dataset.mGradientText = ""
    this.classList.add("m-gradient-text")

    try {
      const type = this.type
      this.dataset.type = type
    } catch {
      // Keep authored/fallback state if attribute is invalid
    }

    try {
      const size = this.size
      if (size !== null) {
        this.style.fontSize = typeof size === "number" ? `${size}px` : size
      } else {
        this.style.removeProperty("font-size")
      }
    } catch {
      // Keep authored/fallback state if attribute is invalid
    }

    try {
      const weight = this.weight
      if (weight !== null) {
        this.style.setProperty("--m-gradient-text-weight", String(weight))
      } else {
        this.style.removeProperty("--m-gradient-text-weight")
      }
    } catch {
      // Keep authored/fallback state if attribute is invalid
    }
  }
}

export { GradientText as MGradientText }
