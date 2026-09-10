export interface NumberFormatSettings {
  precision?: number
  locale?: string
  showSeparator?: boolean
}
export function finiteNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError("Number Animation endpoints must be finite Numbers, not strings, BigInt or decimal-money objects.")
  return value
}
export function numberFormatter(options: NumberFormatSettings = {}) {
  const precision = options.precision ?? 0, locale = options.locale ?? "en-US", showSeparator = options.showSeparator ?? false
  if (Object.values(options).some(value => value === null) || !Number.isInteger(precision) || precision < 0 || precision > 20
    || typeof locale !== "string" || !locale || locale.length > 128 || locale.trim() !== locale
    || typeof showSeparator !== "boolean" || !Intl.NumberFormat.supportedLocalesOf(locale, { localeMatcher: "lookup" }).length) {
    throw new TypeError("Use precision 0..20, a supported native locale and boolean showSeparator.")
  }
  return new Intl.NumberFormat(locale, { minimumFractionDigits: precision, maximumFractionDigits: precision, useGrouping: showSeparator })
}
export function formatAnimatedNumber(value: number, options: NumberFormatSettings = {}): string {
  finiteNumber(value)
  if (!options || typeof options !== "object" || Array.isArray(options) || Object.keys(options).some(key => !["precision", "locale", "showSeparator"].includes(key))) throw new TypeError("Unsupported Number Animation formatting options.")
  return numberFormatter(options).format(value)
}
/** Convex interpolation avoids the overflowing (to - from) for opposite signs. */
export function interpolateNumber(from: number, to: number, progress: number): number {
  finiteNumber(from); finiteNumber(to)
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new RangeError("Interpolation progress must be 0..1.")
  if (progress === 0) return from
  if (progress === 1) return to
  const opposite = from < 0 && to >= 0 || from >= 0 && to < 0
  const value = opposite ? from * (1 - progress) + to * progress
    : progress < .5 ? from + (to - from) * progress : to - (to - from) * (1 - progress)
  if (!Number.isFinite(value)) throw new RangeError("Interpolation did not produce a finite value.")
  return Math.max(Math.min(from, to), Math.min(Math.max(from, to), value))
}
