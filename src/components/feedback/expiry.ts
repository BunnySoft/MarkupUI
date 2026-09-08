export interface FeedbackExpiry {
  readonly remaining: number
  readonly paused: boolean
  restart(duration: number, keepAliveOnHover: boolean): void
  dispose(): void
}

export function feedbackDuration(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 3_600_000) {
    throw new RangeError("Feedback duration must be an integer from 0 to 3600000 ms; zero is persistent.")
  }
  return value
}

/** A remaining-time clock: keyboard focus always pauses; hover is opt-in. */
export function createFeedbackExpiry(element: HTMLElement, expire: () => void): FeedbackExpiry {
  const window = element.ownerDocument.defaultView
  if (!window) throw new TypeError("Import feedback content into an active document before creating its clock.")
  const view = window
  let timer: number | null = null
  let epoch = 0
  let duration = 0
  let remaining = 0
  let started = 0
  let hover = false
  let keepHover = false
  let disposed = false
  const held = () => element.contains(element.ownerDocument.activeElement) || keepHover && hover
  function stop() {
    if (timer !== null) {
      remaining = Math.max(0, remaining - (view.performance.now() - started))
      view.clearTimeout(timer)
      timer = null
    }
    epoch++
  }
  function sync() {
    stop()
    if (disposed || duration === 0 || !element.isConnected || held()) return
    const token = epoch
    started = view.performance.now()
    timer = view.setTimeout(() => {
      if (disposed || token !== epoch) return
      timer = null
      remaining = 0
      if (!element.isConnected) return
      if (!held()) { duration = 0; expire() }
    }, remaining)
  }
  const enter = () => { hover = true; sync() }
  const leave = () => { hover = false; sync() }
  const focus = () => sync()
  const blur = () => { view.queueMicrotask(() => { if (!disposed) sync() }) }
  element.addEventListener("mouseenter", enter)
  element.addEventListener("mouseleave", leave)
  element.addEventListener("focusin", focus)
  element.addEventListener("focusout", blur)
  return {
    get remaining() { return timer === null ? remaining : Math.max(0, remaining - (view.performance.now() - started)) },
    get paused() { return duration > 0 && held() },
    restart(value, keepAliveOnHover) {
      feedbackDuration(value)
      if (typeof keepAliveOnHover !== "boolean") throw new TypeError("Hover policy must be boolean.")
      if (disposed) throw new Error("Feedback clock is disposed.")
      stop()
      duration = remaining = value
      keepHover = keepAliveOnHover
      hover = hover || element.matches(":hover")
      sync()
    },
    dispose() {
      if (disposed) return
      disposed = true
      stop()
      duration = remaining = 0
      element.removeEventListener("mouseenter", enter)
      element.removeEventListener("mouseleave", leave)
      element.removeEventListener("focusin", focus)
      element.removeEventListener("focusout", blur)
    },
  }
}
