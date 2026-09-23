import { widgetStyles as styles } from "./widgets.styles.js"
import type { MarkupUIApi } from "../core/api.js"
import type { MPlugin } from "../core/plugin.js"

export const widgetElementNames = ["m-rating"] as const

export interface RatingElement extends HTMLElement {
  max: number
  value: number
  disabled: boolean
}

function integer(value: number, min: number, max: number): number {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new RangeError(`Rating requires an integer from ${min} to ${max}.`)
  return value
}

export const widgetsPlugin: MPlugin<MarkupUIApi> = {
  name: "widgets",
  install(api) {
    const Base = api.elements.Base

    class Rating extends Base {
      public static readonly tag = "m-rating"
      public static readonly observedAttributes = ["max", "value", "disabled"]
      private active = false
      private buttons: HTMLButtonElement[] = []
      private addedRole = false
      private onClick = (event: Event): void => {
        if (!this.active || this.disabled || !(event.target instanceof Element)) return
        const button = event.target.closest("button")
        const index = this.buttons.indexOf(button as HTMLButtonElement)
        if (index < 0 || button?.parentNode !== this || button.matches(":disabled")) return
        try {
          if (this.value === index + 1) return
          this.value = index + 1
        } catch (error) {
          this.emit("m:error", error)
          return
        }
        this.emit("m:change", this.value)
      }

      public connectedCallback(): void {
        this.upgradeProperties()
        const role = this.getAttribute("role")
        if (role !== null && role !== "group") throw new TypeError("Rating uses a button group, not a radio group.")
        this.active = true
        this.render()
        this.addedRole = role === null
        if (this.addedRole) this.setAttribute("role", "group")
        this.addEventListener("click", this.onClick)
      }

      public disconnectedCallback(): void {
        this.active = false
        this.removeEventListener("click", this.onClick)
        if (this.addedRole && this.getAttribute("role") === "group") this.removeAttribute("role")
        this.addedRole = false
      }

      public attributeChangedCallback(): void {
        if (!this.active) return
        try { this.render() } catch (error) { this.emit("m:error", error) }
      }

      public get max(): number { return integer(this.numberAttribute("max", 5), 1, 10) }
      public set max(value: number) {
        integer(value, 1, 10)
        integer(this.numberAttribute("value", 0), 0, value)
        this.setAttribute("max", String(value))
      }
      public get value(): number { return integer(this.numberAttribute("value", 0), 0, this.max) }
      public set value(value: number) {
        integer(value, 0, this.max)
        this.setAttribute("value", String(value))
      }
      public get disabled(): boolean { return this.hasAttribute("disabled") }
      public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }

      private render(): void {
        if (!this.active) return
        const current = this.value
        const maximum = this.max
        const focused = this.buttons.find(button => button === this.ownerDocument.activeElement)
        while (this.buttons.length > maximum) this.buttons.pop()!.remove()
        while (this.buttons.length < maximum) {
          const button = this.ownerDocument.createElement("button")
          button.type = "button"
          button.dataset.part = "score"
          button.textContent = "\u2605"
          this.buttons.push(button)
        }
        this.buttons.forEach((button, index) => {
          const value = index + 1
          button.dataset.state = value <= current ? "active" : "inactive"
          button.disabled = this.disabled
          button.setAttribute("aria-label", `${value} of ${maximum}`)
          button.setAttribute("aria-pressed", String(value === current))
          if (button.parentNode !== this) this.append(button)
        })
        if (focused && !this.buttons.includes(focused) && !this.disabled) this.buttons.at(-1)?.focus({ preventScroll: true })
      }
    }

    Base.register([Rating])
    const style = document.createElement("style")
    style.id = "m-widgets-styles"
    style.textContent = styles
    if (document.getElementById(style.id) === null) document.head.append(style)
  },
}
