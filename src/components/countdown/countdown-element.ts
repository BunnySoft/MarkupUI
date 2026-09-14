import { ViewElement } from "../../core/index.js"
import { formatCountdown, precision as validatePrecision } from "./format.js"
import type { CountdownPrecision } from "./format.js"

/**
 * A countdown component for displaying elapsed time toward zero.
 * @region {"name":"content","accepts":["text","phrasing"],"min":0,"max":null}
 * @event {"name":"Finish","web":"m:finish","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"number"}}
 */
export class Countdown extends ViewElement {
  public static readonly tag = "m-countdown"
  public static readonly observedAttributes = ["duration", "active", "precision"]

  private initialized = false
  private timer: number | undefined
  private remaining = 0
  private base = 0
  private startedAt = 0
  private completed = false

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-countdown")
    this.remaining = this.duration
    this.base = this.remaining
    this.completed = false
    this.renderDisplay(this.remaining)
    if (this.active) {
      this.startRun()
    }
  }

  public disconnectedCallback(): void {
    this.stopTimer()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.initialized || !this.isConnected) return
    if (name === "duration") {
      this.reset()
    } else if (name === "active") {
      if (this.active) {
        if (!this.completed) {
          this.resumeRun()
        }
      } else {
        this.pauseRun()
      }
    } else if (name === "precision") {
      this.renderDisplay(this.remaining)
    }
  }

  /**
   * Future reset duration in milliseconds.
   * @min 0
   */
  public get duration(): number {
    return this.numberAttribute("duration", 0)
  }
  public set duration(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError("Invalid countdown duration.")
    }
    this.setAttribute("duration", String(value))
  }

  /**
   * Whether the countdown is actively running.
   */
  public get active(): boolean {
    return this.booleanAttribute("active", true)
  }
  public set active(value: boolean) {
    this.setBooleanAttribute("active", value, false)
  }

  /**
   * Display precision in decimal digits (0 to 3).
   * @min 0
   * @max 3
   * @integer
   */
  public get precision(): number {
    return this.numberAttribute("precision", 0)
  }
  public set precision(value: number) {
    validatePrecision(value)
    this.setAttribute("precision", String(value))
  }

  public start(): void {
    if (!this.active) {
      this.active = true
    } else if (!this.completed && this.timer === undefined && this.isConnected) {
      this.resumeRun()
    }
  }

  public pause(): void {
    if (this.active) {
      this.active = false
    } else {
      this.pauseRun()
    }
  }

  public reset(): void {
    this.stopTimer()
    this.completed = false
    this.remaining = this.duration
    this.base = this.remaining
    this.startedAt = performance.now()
    this.renderDisplay(this.remaining)
    if (this.active && this.isConnected) {
      this.startRun()
    }
  }

  private startRun(): void {
    this.stopTimer()
    this.startedAt = performance.now()
    this.base = this.remaining
    if (this.remaining <= 0) {
      this.timer = window.setTimeout(() => this.finish(), 50)
      return
    }
    this.scheduleNextTick()
  }

  private resumeRun(): void {
    this.stopTimer()
    this.startedAt = performance.now()
    this.base = this.remaining
    if (this.remaining <= 0) {
      this.timer = window.setTimeout(() => this.finish(), 50)
      return
    }
    this.scheduleNextTick()
  }

  private pauseRun(): void {
    if (this.timer !== undefined) {
      const now = performance.now()
      const elapsed = now - this.startedAt
      this.remaining = Math.max(0, this.base - elapsed)
      this.stopTimer()
      this.renderDisplay(this.remaining)
      if (this.remaining <= 0 && !this.completed) {
        this.finish()
      }
    }
  }

  private scheduleNextTick(): void {
    this.stopTimer()
    if (!this.isConnected || !this.active || this.completed) return

    const digits = this.precision as CountdownPrecision
    const quantum = 10 ** (3 - digits)
    const boundary = this.remaining - (Math.ceil(this.remaining / quantum) - 1) * quantum
    const delay = Math.max(50, Math.min(this.remaining, boundary || quantum))

    this.timer = window.setTimeout(() => this.tick(), delay)
  }

  private tick(): void {
    this.timer = undefined
    if (!this.isConnected || !this.active || this.completed) return

    const now = performance.now()
    const elapsed = now - this.startedAt
    this.remaining = Math.max(0, this.base - elapsed)
    this.renderDisplay(this.remaining)

    if (this.remaining <= 0) {
      this.finish()
    } else {
      this.scheduleNextTick()
    }
  }

  private finish(): void {
    this.stopTimer()
    if (this.completed) return
    this.completed = true
    this.remaining = 0
    this.renderDisplay(0)
    this.emit<{ value: number }>("m:finish", { value: 0 }, { bubbles: true, cancelable: false, composed: false })
  }

  private stopTimer(): void {
    if (this.timer !== undefined) {
      window.clearTimeout(this.timer)
      this.timer = undefined
    }
  }

  private renderDisplay(val: number): void {
    const clamped = Math.max(0, val)
    const prec = this.precision as CountdownPrecision
    const info = formatCountdown(clamped, prec)

    if (this.hasAttribute("datetime")) {
      this.setAttribute("datetime", info.datetime)
    }

    const hours = this.querySelector("[data-countdown-hours]")
    const minutes = this.querySelector("[data-countdown-minutes]")
    const seconds = this.querySelector("[data-countdown-seconds]")
    const fraction = this.querySelector("[data-countdown-fraction]")

    if (hours && minutes && seconds) {
      hours.textContent = String(info.hours).padStart(2, "0")
      minutes.textContent = String(info.minutes).padStart(2, "0")
      seconds.textContent = String(info.seconds).padStart(2, "0")
      if (fraction) {
        fraction.textContent = prec ? `.${String(info.milliseconds).padStart(3, "0").slice(0, prec)}` : ""
      }
      return
    }

    const textTarget = this.querySelector("[data-countdown-text]")
    if (textTarget) {
      textTarget.textContent = info.text
      return
    }

    if (this.childNodes.length === 0) {
      this.textContent = info.text
      return
    }

    if (this.childNodes.length === 1 && this.firstChild?.nodeType === Node.TEXT_NODE) {
      this.firstChild.textContent = info.text
      return
    }

    const timeEl = this.querySelector("time")
    if (timeEl) {
      timeEl.setAttribute("datetime", info.datetime)
      timeEl.textContent = info.text
      return
    }

    this.textContent = info.text
  }
}

export { Countdown as MCountdown }

export function registerCountdown(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Countdown], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Countdown.tag)) registerCountdown()
