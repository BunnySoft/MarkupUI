import { ViewElement } from "../../core/index.js"
import { createMarquee } from "./marquee.js"
import type { MarqueeController } from "./marquee.js"

/**
 * One original horizontal track with optional native motion and static fallback.
 * @region {"name":"content","accepts":["phrasing","text"],"min":0,"max":null}
 * @event {"name":"MarqueeChange","web":"m:marquee-change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"MarqueeFinish","web":"m:marquee-finish","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"MarqueeError","web":"m:marquee-error","bubbles":true,"cancelable":false,"composed":false}
 */
export class Marquee extends ViewElement {
  public static readonly tag = "m-marquee"
  public static readonly observedAttributes = ["speed", "pause-on-hover", "reverse"]

  private controller: MarqueeController | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-marquee")
    this.setAttribute("data-marquee", "")
    if (!this.getAttribute("aria-label")?.trim() && !this.getAttribute("aria-labelledby")?.trim()) {
      this.setAttribute("aria-label", "Marquee")
    }
    this.ensureStructure()
    this.attachController()
  }

  public disconnectedCallback(): void {
    this.controller?.disconnect()
    this.controller = undefined
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected || !this.controller) return
    if (name === "speed") {
      try {
        this.controller.set({ speed: this.speed })
      } catch { /* Invalid values rejected */ }
    } else if (name === "reverse") {
      try {
        this.controller.set({ direction: this.reverse ? "right" : "left" })
      } catch { /* Rejected */ }
    } else if (name === "pause-on-hover") {
      try {
        this.controller.set({ pauseOnHover: this.pauseOnHover })
      } catch { /* Rejected */ }
    }
  }

  /**
   * Scrolling speed in CSS pixels per second.
   * @min 1
   * @max 1000
   */
  public get speed(): number {
    return this.numberAttribute("speed", 50)
  }
  public set speed(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > 1000) {
      throw new RangeError("Invalid speed.")
    }
    this.setAttribute("speed", String(value))
  }

  /**
   * Whether to pause animation on pointer hover.
   */
  public get pauseOnHover(): boolean {
    return this.booleanAttribute("pause-on-hover", true)
  }
  public set pauseOnHover(value: boolean) {
    this.setBooleanAttribute("pause-on-hover", value, false)
  }

  /**
   * Whether to reverse the scrolling direction.
   */
  public get reverse(): boolean {
    return this.hasAttribute("reverse")
  }
  public set reverse(value: boolean) {
    this.setBooleanAttribute("reverse", value)
  }

  public play(): void {
    this.controller?.play()
  }

  public pause(): void {
    this.controller?.pause()
  }

  public refresh(): void {
    this.controller?.refresh()
  }

  private ensureStructure(): void {
    let viewport = this.querySelector<HTMLElement>(":scope > [data-marquee-viewport]")
    if (!viewport) {
      viewport = this.ownerDocument.createElement("div")
      viewport.setAttribute("data-marquee-viewport", "")
      viewport.setAttribute("tabindex", "0")
      viewport.setAttribute("aria-label", this.getAttribute("aria-label")?.trim() || "Scrollable announcement")

      const content = this.ownerDocument.createElement("div")
      content.setAttribute("data-marquee-content", "")
      while (this.firstChild) {
        content.appendChild(this.firstChild)
      }
      viewport.appendChild(content)
      this.appendChild(viewport)
    }

    if (!viewport.hasAttribute("tabindex")) {
      viewport.setAttribute("tabindex", "0")
    }
    if (!viewport.getAttribute("aria-label")?.trim() && !viewport.getAttribute("aria-labelledby")?.trim()) {
      viewport.setAttribute("aria-label", this.getAttribute("aria-label")?.trim() || "Scrollable announcement")
    }

    let controls = this.querySelector<HTMLElement>(":scope > [data-marquee-controls]")
    if (!controls) {
      controls = this.ownerDocument.createElement("div")
      controls.setAttribute("data-marquee-controls", "")
      controls.hidden = true
      const button = this.ownerDocument.createElement("button")
      button.type = "button"
      button.setAttribute("data-marquee-toggle", "")
      const label = this.ownerDocument.createElement("span")
      label.setAttribute("data-marquee-label", "")
      label.textContent = "Play motion"
      button.appendChild(label)
      controls.appendChild(button)
      this.appendChild(controls)
    }

    let status = this.querySelector<HTMLElement>(":scope > [data-marquee-status]")
    if (!status) {
      status = this.ownerDocument.createElement("p")
      status.setAttribute("data-marquee-status", "")
      status.textContent = "Static content; use native scrolling to read all text."
      this.appendChild(status)
    }
  }

  private attachController(): void {
    if (this.controller) return
    try {
      this.controller = createMarquee(this, {
        speed: this.speed,
        direction: this.reverse ? "right" : "left",
        pauseOnHover: this.pauseOnHover,
      })
    } catch {
      // In non-standard or detached environments, static fallback
    }
  }
}

export const MMarquee = Marquee

export function registerMarquee(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Marquee], registry)
}
