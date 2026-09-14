import { ViewElement } from "../../core/index.js"
import { formatAnimatedNumber, interpolateNumber } from "./number.js"

/**
 * A number animation component that smoothly animates numeric transitions between from and to values.
 * @region {"name":"content","accepts":["text","phrasing"],"min":0,"max":null}
 * @event {"name":"Finish","web":"m:finish","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"number"}}
 */
export class NumberAnimation extends ViewElement {
  public static readonly tag = "m-number-animation"
  public static readonly observedAttributes = ["from", "to", "duration", "precision"]

  private frameId: number | null = null
  private startTime = 0
  private elapsedPaused = 0
  private isPaused = false
  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-number-animation")
    this.play()
  }

  public disconnectedCallback(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    this.elapsedPaused = 0
    this.play()
  }

  public get from(): number {
    return this.numberAttribute("from", 0)
  }
  public set from(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new RangeError("Invalid number from.")
    }
    this.setAttribute("from", String(value))
  }

  public get to(): number {
    return this.numberAttribute("to", 0)
  }
  public set to(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new RangeError("Invalid number to.")
    }
    this.setAttribute("to", String(value))
  }

  /**
   * @min 0
   * @integer
   */
  public get duration(): number {
    return this.numberAttribute("duration", 1000)
  }
  public set duration(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError("Invalid number duration.")
    }
    this.setAttribute("duration", String(value))
  }

  /**
   * @min 0
   * @max 20
   * @integer
   */
  public get precision(): number {
    return this.numberAttribute("precision", 0)
  }
  public set precision(value: number) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 20) {
      throw new RangeError("Invalid number precision.")
    }
    this.setAttribute("precision", String(value))
  }

  public play(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
    this.isPaused = false
    const from = this.from
    const to = this.to
    const duration = this.duration

    const reduced = typeof window !== "undefined" && typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced || duration <= 0) {
      this.renderValue(to)
      this.emit<{ value: number }>("m:finish", { value: to }, { bubbles: true, cancelable: false, composed: false })
      return
    }

    this.renderValue(from)
    const clock = typeof performance !== "undefined" ? () => performance.now() : () => Date.now()
    this.startTime = clock() - this.elapsedPaused

    const tick = (now?: number): void => {
      if (this.isPaused) return
      const currentTime = typeof now === "number" ? now : clock()
      const elapsed = currentTime - this.startTime
      if (elapsed >= duration) {
        this.frameId = null
        this.elapsedPaused = 0
        this.renderValue(to)
        this.emit<{ value: number }>("m:finish", { value: to }, { bubbles: true, cancelable: false, composed: false })
      } else {
        const progress = Math.min(1, Math.max(0, elapsed / duration))
        const eased = 1 - Math.pow(1 - progress, 5)
        const current = interpolateNumber(from, to, eased)
        this.renderValue(current)
        this.frameId = requestAnimationFrame(tick)
      }
    }
    this.frameId = requestAnimationFrame(tick)
  }

  public pause(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
    if (!this.isPaused) {
      this.isPaused = true
      const now = typeof performance !== "undefined" ? performance.now() : Date.now()
      this.elapsedPaused = Math.max(0, now - this.startTime)
    }
  }

  public reset(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
    this.isPaused = false
    this.elapsedPaused = 0
    this.renderValue(this.from)
  }

  private renderValue(value: number): void {
    const formatted = formatAnimatedNumber(value, { precision: this.precision })
    const target = this.querySelector<HTMLElement>("[data-number-text]") ?? this
    target.textContent = formatted
  }
}
