export type SplitSize = number | `${number}px`
export interface SplitMeasure { readonly unit: "ratio" | "px"; readonly value: number; readonly size: SplitSize }
export function splitMeasure(input: unknown): SplitMeasure {
  if (typeof input === "number") {
    if (!Number.isFinite(input) || input < 0 || input > 1) throw new RangeError("Numeric Split sizes/bounds must be ratios from 0 to 1.")
    return { unit: "ratio", value: input, size: input }
  }
  if (typeof input !== "string" || !/^(?:\d+(?:\.\d+)?|\.\d+)px$/.test(input)) throw new TypeError("Split sizes are ratios or nonnegative decimal px strings; no percentages/calc/unit inference.")
  const value = Number(input.slice(0, -2))
  if (!Number.isFinite(value) || value > 1_000_000) throw new RangeError("Pixel Split sizes/bounds must be at most 1000000px.")
  return { unit: "px", value, size: `${value}px` }
}
export function splitPixels(value: SplitMeasure, available: number) { return value.unit === "ratio" ? value.value * available : value.value }
export function splitValue(pixels: number, available: number, unit: SplitMeasure["unit"]): SplitSize {
  return unit === "ratio" ? Math.max(0, Math.min(1, pixels / available)) : `${Math.round(pixels * 1000) / 1000}px`
}
export function splitBounds(min: SplitMeasure, max: SplitMeasure, available: number) {
  if (min.unit === max.unit && min.value > max.value) throw new RangeError("Split min must not exceed max.")
  const lower = splitPixels(min, available), upper = Math.min(available, splitPixels(max, available))
  return { min: lower, max: upper, feasible: available > 0 && lower <= upper }
}
