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
  private generation = 0
  private run: {
    from: number
    to: number
    duration: number
    precision: number
    startTime: number
    elapsed: number
    paused: boolean
  } | null = null
  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.classList.add("m-number-animation")
    this.play()
  }

  public disconnectedCallback(): void {
    this.clearRun()
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected || !this.initialized) return
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
    const value = this.numberAttribute("duration", 1000)
    if (value < 0) throw new RangeError("Invalid number duration.")
    return value
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
    const value = this.numberAttribute("precision", 0)
    if (!Number.isInteger(value) || value < 0 || value > 20) {
      throw new RangeError("Invalid number precision.")
    }
    return value
  }
  public set precision(value: number) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 20) {
      throw new RangeError("Invalid number precision.")
    }
    this.setAttribute("precision", String(value))
  }

  /** Starts or replays from `from`, including while playing or paused. */
  public play(): void {
    const values = this.readValues()
    const reduced = this.prefersReducedMotion()
    const text = formatAnimatedNumber(reduced || values.duration === 0 ? values.to : values.from, { precision: values.precision })
    const startTime = this.clock()
    this.clearRun()
    const generation = this.generation
    if (!reduced && values.duration > 0) {
      this.run = { ...values, startTime, elapsed: 0, paused: false }
    }
    this.renderText(text)
    if (generation !== this.generation) return
    if (this.run) this.scheduleFrame(this.run)
    else this.finish(values.to)
  }

  /** Freezes a running animation; idle and already-paused calls do nothing. */
  public pause(): void {
    const run = this.run
    if (!run || run.paused) return
    const elapsed = Math.max(0, this.clock() - run.startTime)
    this.cancelFrame()
    run.elapsed = elapsed
    run.paused = true
  }

  /** Continues a paused run without replaying `from` or counting time spent paused. */
  public resume(): void {
    const run = this.run
    if (!run || !run.paused) return
    this.readValues()
    if (this.prefersReducedMotion()) {
      const text = formatAnimatedNumber(run.to, { precision: run.precision })
      this.clearRun()
      const generation = this.generation
      this.renderText(text)
      if (generation === this.generation) this.finish(run.to)
      return
    }
    const startTime = this.clock() - run.elapsed
    this.cancelFrame()
    run.startTime = startTime
    run.paused = false
    this.scheduleFrame(run)
  }

  /** Cancels the run and displays `from` without emitting completion. */
  public reset(): void {
    const text = formatAnimatedNumber(this.from, { precision: this.precision })
    this.clearRun()
    this.renderText(text)
  }

  private readValues() {
    return { from: this.from, to: this.to, duration: this.duration, precision: this.precision }
  }

  private clock(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now()
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== "undefined" && typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  private cancelFrame(): void {
    this.generation++
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }

  private clearRun(): void {
    this.cancelFrame()
    this.run = null
  }

  private scheduleFrame(run: NonNullable<NumberAnimation["run"]>): void {
    const generation = ++this.generation
    this.frameId = requestAnimationFrame((now: number): void => {
      if (generation !== this.generation || this.run !== run || run.paused) return
      this.frameId = null
      const elapsed = (typeof now === "number" ? now : this.clock()) - run.startTime
      const progress = Math.min(1, Math.max(0, elapsed / run.duration))
      const eased = 1 - Math.pow(1 - progress, 5)
      const value = elapsed >= run.duration ? run.to : interpolateNumber(run.from, run.to, eased)
      try {
        this.renderText(formatAnimatedNumber(value, { precision: run.precision }))
      } catch (error) {
        if (generation === this.generation) this.clearRun()
        throw error
      }
      if (generation !== this.generation) return
      if (elapsed >= run.duration) {
        this.clearRun()
        this.finish(run.to)
      } else {
        this.scheduleFrame(run)
      }
    })
  }

  private finish(value: number): void {
    this.emit<{ value: number }>("m:finish", { value }, { bubbles: true, cancelable: false, composed: false })
  }

  private renderText(formatted: string): void {
    const target = this.querySelector<HTMLElement>("[data-number-text]") ?? this
    target.textContent = formatted
  }
}
