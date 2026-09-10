export const maximumDuration = 365 * 24 * 60 * 60 * 1000
export type CountdownPrecision = 0 | 1 | 2 | 3
export interface CountdownTimeInfo {
  readonly hours: number
  readonly minutes: number
  readonly seconds: number
  readonly milliseconds: number
  readonly remaining: number
  readonly displayed: number
  readonly precision: CountdownPrecision
}
export interface CountdownDisplay extends CountdownTimeInfo {
  readonly text: string
  readonly datetime: string
}
export function duration(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > maximumDuration) throw new RangeError("Countdown durations must be finite milliseconds in 0..31,536,000,000 (365 days), not dates or epoch deadlines.")
  return value
}
export function precision(value: unknown): CountdownPrecision {
  if (![0, 1, 2, 3].includes(value as number)) throw new RangeError("precision must be 0, 1, 2 or 3.")
  return value as CountdownPrecision
}
/** Display rounds upward at the requested quantum; completion still uses actual elapsed time. */
export function formatCountdown(value: number, digits: CountdownPrecision = 0): CountdownDisplay {
  duration(value); precision(digits)
  const quantum = 10 ** (3 - digits), displayed = Math.ceil(value / quantum) * quantum
  const hours = Math.floor(displayed / 3600000), minutes = Math.floor(displayed / 60000) % 60,
    seconds = Math.floor(displayed / 1000) % 60, milliseconds = displayed % 1000
  const fraction = digits ? `.${String(milliseconds).padStart(3, "0").slice(0, digits)}` : ""
  return Object.freeze({ hours, minutes, seconds, milliseconds, remaining: value, displayed, precision: digits,
    text: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${fraction}`,
    datetime: `PT${displayed / 1000}S` })
}
