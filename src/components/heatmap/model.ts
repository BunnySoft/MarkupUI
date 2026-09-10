import { carrier, dateString, fromOrdinal, lastOrdinal, ordinal, parseDate, weekday } from "../calendar/date.js"

export interface HeatmapDataItem { readonly date: string; readonly value?: number | null }
export interface HeatmapCell {
  readonly date: string
  readonly value: number | null
  readonly supplied: boolean
  readonly inRange: boolean
  readonly row: number
  readonly column: number
  readonly level: number | null
  readonly position: number | null
  readonly clamped: "low" | "high" | null
  readonly label: string
  readonly detail: string
}
export interface HeatmapSettings {
  data?: readonly HeatmapDataItem[]
  range?: readonly [string, string] | null
  domain?: readonly [number, number] | null
  thresholds?: readonly [number, number, number, number]
  firstDayOfWeek?: number
  fillCalendarLeading?: boolean
  locale?: string
  colorTheme?: "green" | "blue" | "orange" | "purple" | "red"
  activeColors?: readonly string[] | null
  minimumColor?: string | null
  showColorIndicator?: boolean
  showMonthLabels?: boolean
  showWeekLabels?: boolean
  size?: "small" | "medium" | "large"
  loading?: boolean
  describe?: ((cell: Readonly<Omit<HeatmapCell, "label" | "detail">>) => string) | null
}
export type HeatmapOptions = HeatmapSettings
export type HeatmapConfig = Required<HeatmapSettings>
export interface HeatmapModel {
  readonly cells: readonly (HeatmapCell | null)[]
  readonly weeks: number
  readonly start: string | null
  readonly end: string | null
  readonly domain: readonly [number, number] | null
  readonly thresholds: readonly number[]
  readonly numericCount: number
  readonly missingCount: number
  readonly weekLabels: readonly string[]
  readonly weekStarts: readonly string[]
  readonly months: readonly { label: string; columns: number }[]
}
export const heatmapDefaults: HeatmapConfig = {
  data: [], range: null, domain: null, thresholds: [.2, .4, .6, .8], firstDayOfWeek: 0,
  fillCalendarLeading: false, locale: "en-US", colorTheme: "green", activeColors: null, minimumColor: null,
  showColorIndicator: true, showMonthLabels: true, showWeekLabels: true, size: "medium", loading: false, describe: null,
}
export function numberText(value: number) { return Object.is(value, -0) ? "-0" : String(value) }
export function boundedNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > 1e12) throw new RangeError("Use finite Heatmap numbers in -1e12..1e12.")
  return value
}
export function validateThresholds(value: unknown): readonly [number, number, number, number] {
  if (!Array.isArray(value) || value.length !== 4 || [...value].some((item, i) => typeof item !== "number"
    || !Number.isFinite(item) || item <= 0 || item >= 1 || i > 0 && item <= value[i - 1])) throw new RangeError("Use four increasing thresholds strictly inside (0,1).")
  return Object.freeze([...value]) as readonly [number, number, number, number]
}
export function heatmapLevel(value: number, domain: readonly [number, number], thresholds: readonly number[] = [.2, .4, .6, .8]) {
  boundedNumber(value)
  if (!Array.isArray(domain) || domain.length !== 2 || boundedNumber(domain[0]) > boundedNumber(domain[1])) throw new RangeError("Use an ordered bounded numeric domain.")
  validateThresholds(thresholds)
  const [min, max] = domain
  const clamped = value < min ? "low" : value > max ? "high" : null
  const bounded = Math.min(max, Math.max(min, value))
  const position = min === max ? clamped === "low" ? 0 : clamped === "high" ? 1 : .5 : (bounded - min) / (max - min)
  return Object.freeze({ level: thresholds.filter(threshold => position >= threshold).length, position, clamped })
}
export function heatmapConfig(input: HeatmapSettings, previous: HeatmapConfig = heatmapDefaults): HeatmapConfig {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !Object.hasOwn(heatmapDefaults, key))) throw new TypeError("Unsupported Heatmap settings.")
  const next = { ...previous, ...input }
  if (!Array.isArray(next.data) || next.data.length > 366) throw new RangeError("Heatmap accepts at most 366 authored date records.")
  next.data = Object.freeze(next.data.map(item => {
    if (!item || typeof item !== "object" || Array.isArray(item) || Object.keys(item).some(key => !["date", "value"].includes(key))) throw new TypeError("Use date/value records, not timestamps or renderer metadata.")
    if (item.value !== null && item.value !== undefined) boundedNumber(item.value)
    return Object.freeze({ ...item })
  }))
  if (next.range !== null) {
    if (!Array.isArray(next.range) || next.range.length !== 2) throw new TypeError("range is null or [startDate,endDate].")
    next.range = Object.freeze([...next.range]) as readonly [string, string]
  }
  if (next.domain !== null) {
    if (!Array.isArray(next.domain) || next.domain.length !== 2 || boundedNumber(next.domain[0]) > boundedNumber(next.domain[1])) throw new RangeError("domain must be an ordered finite pair.")
    next.domain = Object.freeze([...next.domain]) as readonly [number, number]
  }
  next.thresholds = validateThresholds(next.thresholds)
  for (const flag of [next.fillCalendarLeading, next.showColorIndicator, next.showMonthLabels, next.showWeekLabels, next.loading]) if (typeof flag !== "boolean") throw new TypeError("Heatmap flags must be boolean.")
  if (!Number.isInteger(next.firstDayOfWeek) || next.firstDayOfWeek < 0 || next.firstDayOfWeek > 6
    || typeof next.locale !== "string" || !next.locale || next.locale.length > 128
    || !["green", "blue", "orange", "purple", "red"].includes(next.colorTheme)
    || !["small", "medium", "large"].includes(next.size)
    || next.describe !== null && typeof next.describe !== "function") throw new TypeError("Use weekday 0 Monday..6 Sunday, native locale, supported theme/size and a synchronous description.")
  const color = (value: unknown) => typeof value === "string" && /^#[\da-f]{6}$/i.test(value)
  if (next.activeColors !== null) {
    if (!Array.isArray(next.activeColors) || next.activeColors.length !== 5 || ![...next.activeColors].every(color)) throw new TypeError("activeColors needs exactly five #RRGGBB colors.")
    next.activeColors = Object.freeze([...next.activeColors])
  }
  if (next.minimumColor !== null && !color(next.minimumColor)) throw new TypeError("minimumColor must be #RRGGBB or null.")
  return Object.freeze(next)
}

/** Calendar-week model: no local timestamps, gap-to-zero coercion or sparse-range allocation. */
export function buildHeatmap(document: Document, options: HeatmapSettings = {}): HeatmapModel {
  const settings = heatmapConfig(options)
  const records = new Map<string, HeatmapDataItem>()
  const coordinates: number[] = []
  for (const item of settings.data) {
    const parts = parseDate(document, item.date)
    if (records.has(item.date)) throw new TypeError(`Duplicate date ${item.date}; aggregate before binding.`)
    records.set(item.date, item); coordinates.push(ordinal(parts))
  }
  let start: number | null = null, end: number | null = null
  if (settings.range) { start = ordinal(parseDate(document, settings.range[0])); end = ordinal(parseDate(document, settings.range[1])) }
  else if (coordinates.length) { start = Math.min(...coordinates); end = Math.max(...coordinates) }
  if (start !== null && end !== null && (end < start || end - start + 1 > 366)) throw new RangeError("Use an ordered range of at most 366 days.")
  if (start !== null && coordinates.some(value => value < start! || value > end!)) throw new RangeError("Every supplied date must be inside the explicit range.")
  const values = settings.data.filter(item => item.value !== undefined && item.value !== null).map(item => item.value!)
  const domain = settings.domain ?? (values.length ? Object.freeze([Math.min(...values), Math.max(...values)] as const) : null)
  const weekdayStart = (settings.firstDayOfWeek + 1) % 7
  const base = { calendar: "gregory", timeZone: "UTC" } as const
  if (!Intl.DateTimeFormat.supportedLocalesOf(settings.locale, { localeMatcher: "lookup" }).length) throw new RangeError("The native date-label locale is unavailable.")
  const full = new Intl.DateTimeFormat(settings.locale, { ...base, weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const week = new Intl.DateTimeFormat(settings.locale, { ...base, weekday: "long" })
  const month = new Intl.DateTimeFormat(settings.locale, { ...base, month: "short", year: "numeric" })
  if (full.resolvedOptions().calendar !== "gregory" || full.resolvedOptions().timeZone !== "UTC") throw new Error("Explicit native Gregorian/UTC labels are required.")
  const weekLabels = Array.from({ length: 7 }, (_, i) => week.format(carrier({ year: 2023, month: 1, date: (weekdayStart + i) % 7 + 1 })))
  if (start === null || end === null) return Object.freeze({ cells: Object.freeze([]), weeks: 0, start: null, end: null, domain,
    thresholds: settings.thresholds, numericCount: 0, missingCount: 0, weekLabels: Object.freeze(weekLabels), weekStarts: Object.freeze([]), months: Object.freeze([]) })
  const gridStart = start - (weekday(fromOrdinal(start)) - weekdayStart + 7) % 7
  const weeks = Math.ceil((end - gridStart + 1) / 7)
  if (weeks * 7 > 378) throw new RangeError("Padded Heatmap is limited to 378 cells.")
  let numericCount = 0, missingCount = 0
  const cells = Array.from({ length: weeks * 7 }, (_, i): HeatmapCell | null => {
    const coordinate = gridStart + i
    if (coordinate < 0 || coordinate > lastOrdinal || coordinate > end! || coordinate < start! && !settings.fillCalendarLeading) return null
    const parts = fromOrdinal(coordinate), date = dateString(parts), item = records.get(date), value = item?.value ?? null
    if (value === null) ++missingCount
    else ++numericCount
    const scale = value === null || !domain ? { level: null, position: null, clamped: null } : heatmapLevel(value, domain, settings.thresholds)
    const cell = Object.freeze({ date, value, supplied: item !== undefined, inRange: coordinate >= start!, row: i % 7, column: Math.floor(i / 7), ...scale })
    const description: unknown = settings.describe ? settings.describe(cell) : ""
    if (description && typeof (description as PromiseLike<unknown>).then === "function") void Promise.resolve(description).catch(() => {})
    if (typeof description !== "string" || description.length > 512) throw new TypeError("describe must return literal text of at most 512 characters synchronously.")
    const valueText = value === null ? item ? "Missing (record has no numeric value)" : "Missing (no record)" : numberText(value)
    const band = scale.level === null ? "" : `; level ${scale.level}${scale.clamped ? `; clamped ${scale.clamped}` : ""}`
    return Object.freeze({ ...cell, label: `${full.format(carrier(parts))}: ${valueText}${band}`,
      detail: `${date}: ${valueText}${band}${coordinate < start! ? "; leading calendar day" : ""}${description ? `. ${description}` : ""}` })
  })
  const weekStarts: string[] = [], months: { label: string; columns: number }[] = []
  for (let column = 0; column < weeks; ++column) {
    const first = Math.max(0, gridStart + column * 7)
    weekStarts.push(dateString(fromOrdinal(first)))
    const labelDate = fromOrdinal(Math.min(end, Math.max(start, first)))
    const label = month.format(carrier(labelDate)), previous = months.at(-1)
    if (previous?.label === label) previous.columns++
    else months.push({ label, columns: 1 })
  }
  return Object.freeze({ cells: Object.freeze(cells), weeks, start: dateString(fromOrdinal(start)), end: dateString(fromOrdinal(end)),
    domain, thresholds: settings.thresholds, numericCount, missingCount, weekLabels: Object.freeze(weekLabels),
    weekStarts: Object.freeze(weekStarts), months: Object.freeze(months.map(value => Object.freeze(value))) })
}
