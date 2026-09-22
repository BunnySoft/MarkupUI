import { widgetStyles as styles } from "./widgets.styles.js"
import type { MarkupUIApi } from "../core/api.js"
import type { MPlugin } from "../core/plugin.js"

export const widgetElementNames = ["m-rating"] as const

export const widgetsPlugin: MPlugin<MarkupUIApi> = {
  name: "widgets",
  install(api) {
    const Base = api.elements.Base

    class Rating extends Base {
      public static readonly tag = "m-rating"
      public connectedCallback(): void {
        this.upgradeProperties()
        this.render()
      }
      public get value(): number { return Math.max(0, this.numberAttribute("value", 0)) }
      public set value(value: number) {
        if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid rating value.")
        this.setAttribute("value", String(Math.max(0, Math.min(Math.round(value), this.max))))
        this.render()
        this.emit("m:change", this.value)
      }
      private get max(): number { return Math.max(1, Math.round(this.numberAttribute("max", 5))) }
      private render(): void {
        if (!this.isConnected) return
        const current = this.value
        const maximum = this.max
        const buttons = Array.from({ length: maximum }, (_, index) => {
          const value = index + 1
          const button = this.ownerDocument.createElement("button")
          button.type = "button"
          button.textContent = "\u2605"
          button.toggleAttribute("data-active", value <= current)
          button.toggleAttribute("selected", value === current)
          button.setAttribute("aria-label", `${value} of ${maximum}`)
          button.setAttribute("aria-pressed", String(value === current))
          button.addEventListener("click", () => { this.value = value })
          return button
        })
        this.setAttribute("role", "radiogroup")
        this.replaceChildren(...buttons)
      }
    }

    Base.register([Rating])
    const style = document.createElement("style")
    style.id = "m-widgets-styles"
    style.textContent = styles
    if (document.getElementById(style.id) === null) document.head.append(style)
  },
}
