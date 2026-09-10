export type TimeInput = number | Date
export type TimeType = "date" | "time" | "datetime" | "relative"
export type TimeUnit = "milliseconds" | "seconds"
export type RelativeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year"
export type TimeDateOptions = Pick<Intl.DateTimeFormatOptions,
  "dateStyle" | "timeStyle" | "weekday" | "era" | "year" | "month" | "day" | "hour" | "minute" | "second"
  | "fractionalSecondDigits" | "hourCycle" | "hour12" | "timeZoneName">
export interface TimeFormatOptions {
  type?: TimeType
  unit?: TimeUnit
  locale?: string
  timeZone?: string
  to?: TimeInput
  relativeUnit?: RelativeUnit | "auto"
  numeric?: "always" | "auto"
  relativeStyle?: "long" | "short" | "narrow"
  dateTime?: TimeDateOptions
}
export interface FormattedTime {
  readonly text: string
  readonly datetime: string
  readonly time: number
  readonly to: number | null
  readonly type: TimeType
  readonly locale: string
  readonly timeZone: string
  readonly relative: { readonly unit: RelativeUnit; readonly amount: number; readonly nextChangeMs: number } | null
}
export const minTime = -62135596800000
export const maxTime = 253402300799999
const widths: Record<RelativeUnit, number> = { second: 1000, minute: 60000, hour: 3600000, day: 86400000, week: 604800000, month: 2592000000, year: 31536000000 }
const units = Object.keys(widths) as RelativeUnit[]
const dateKeys = ["dateStyle", "timeStyle", "weekday", "era", "year", "month", "day", "hour", "minute", "second", "fractionalSecondDigits", "hourCycle", "hour12", "timeZoneName"]
export const formatKeys = ["type", "unit", "locale", "timeZone", "to", "relativeUnit", "numeric", "relativeStyle", "dateTime"]
export function object(value: unknown, allowed: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new TypeError("Unsupported Time options.")
}
export function milliseconds(value: unknown, unit: TimeUnit = "milliseconds"): number {
  let result: number
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) throw new RangeError("Epoch values must be finite safe integers; use integer seconds or integer milliseconds.")
    result = unit === "seconds" ? value * 1000 : value
  } else {
    try { result = Date.prototype.getTime.call(value) as number }
    catch { throw new TypeError("Time values are explicit Date objects or epoch numbers, never floating date/local-clock strings.") }
  }
  if (!Number.isSafeInteger(result) || result < minTime || result > maxTime) throw new RangeError("Instant must be within UTC Gregorian years 0001–9999.")
  return result
}
export function normalize(options: TimeFormatOptions) {
  object(options, formatKeys)
  if (Object.values(options).some(value => value === null)) throw new TypeError("Use undefined for omitted Time options, not null.")
  const type = options.type ?? "datetime", unit = options.unit ?? "milliseconds", locale = options.locale ?? "en-US",
    timeZone = options.timeZone ?? "UTC", relativeUnit = options.relativeUnit ?? "auto",
    numeric = options.numeric ?? "always", relativeStyle = options.relativeStyle ?? "long"
  if (!["date", "time", "datetime", "relative"].includes(type) || !["milliseconds", "seconds"].includes(unit)
    || !["auto", ...units].includes(relativeUnit) || !["always", "auto"].includes(numeric)
    || !["long", "short", "narrow"].includes(relativeStyle)
    || typeof locale !== "string" || !locale || locale.length > 128 || locale.trim() !== locale
    || typeof timeZone !== "string" || !timeZone || timeZone.length > 128 || timeZone.trim() !== timeZone) throw new TypeError("Use explicit supported Time types, units, locale/timezone and relative options.")
  if (!Intl.DateTimeFormat.supportedLocalesOf(locale, { localeMatcher: "lookup" }).length) throw new RangeError("The native locale is unavailable.")
  const zone = new Intl.DateTimeFormat("en-US", { timeZone, calendar: "gregory", numberingSystem: "latn", year: "numeric", era: "short" })
  if (zone.resolvedOptions().calendar !== "gregory") throw new Error("Native explicit Gregorian formatting is unavailable.")
  if (options.to !== undefined) milliseconds(options.to, unit)
  if (options.dateTime !== undefined) object(options.dateTime, dateKeys)
  const dateTime = Object.fromEntries(Object.entries(options.dateTime ?? {}).filter(([, value]) => value !== undefined)) as TimeDateOptions
  const choices: Record<string, readonly unknown[]> = {
    dateStyle: ["full", "long", "medium", "short"], timeStyle: ["full", "long", "medium", "short"],
    weekday: ["long", "short", "narrow"], era: ["long", "short", "narrow"], year: ["numeric", "2-digit"],
    month: ["numeric", "2-digit", "long", "short", "narrow"], day: ["numeric", "2-digit"],
    hour: ["numeric", "2-digit"], minute: ["numeric", "2-digit"], second: ["numeric", "2-digit"],
    fractionalSecondDigits: [1, 2, 3], hourCycle: ["h11", "h12", "h23", "h24"], hour12: [true, false],
    timeZoneName: ["short", "long", "shortOffset", "longOffset", "shortGeneric", "longGeneric"],
  }
  for (const [key, value] of Object.entries(dateTime)) if (value !== undefined && !choices[key]?.includes(value)) throw new TypeError(`Invalid native dateTime.${key}.`)
  if (type === "relative" && Object.keys(dateTime).length) throw new TypeError("Relative mode does not use absolute dateTime options.")
  if (type === "date" && ["timeStyle", "hour", "minute", "second", "fractionalSecondDigits"].some(key => dateTime[key as keyof TimeDateOptions] !== undefined)) throw new TypeError("Date mode does not display clock fields.")
  if (type === "time" && ["dateStyle", "weekday", "era", "year", "month", "day"].some(key => dateTime[key as keyof TimeDateOptions] !== undefined)) throw new TypeError("Time mode does not display calendar fields.")
  return { type, unit, locale, timeZone: zone.resolvedOptions().timeZone, relativeUnit, numeric, relativeStyle, dateTime, zone }
}
function relative(delta: number, requested: RelativeUnit | "auto") {
  const magnitude = Math.abs(delta)
  let index = requested === "auto" ? 0 : units.indexOf(requested)
  if (requested === "auto") for (let i = 1; i < units.length && magnitude >= widths[units[i]!]!; ++i) index = i
  const unit = units[index]!, width = widths[unit], count = Math.floor(magnitude / width + .5)
  const amount = delta < 0 ? -count : count
  let next = delta > 0 ? count ? Math.floor(delta - (count - .5) * width) + 1 : delta + 1
    : delta === 0 ? 1 : Math.ceil((count + .5) * width + delta)
  if (requested === "auto") {
    const switchAt = delta > 0 ? index ? delta - widths[unit] + 1 : Infinity
      : index < units.length - 1 ? widths[units[index + 1]!] + delta : Infinity
    next = Math.min(next, switchAt)
  }
  return Object.freeze({ unit, amount, nextChangeMs: Math.max(1, next) })
}

/** Pure deterministic instant formatting. Relative mode requires an explicit reference. */
export function formatTime(time: TimeInput, options: TimeFormatOptions = {}): FormattedTime {
  const settings = normalize(options), value = milliseconds(time, settings.unit), date = new Date(value)
  let text: string, to: number | null = null, rel: FormattedTime["relative"] = null
  let locale = settings.locale
  if (settings.type === "relative") {
    if (options.to === undefined) throw new TypeError("Pure relative formatting requires an explicit to reference.")
    if (typeof Intl.RelativeTimeFormat !== "function" || !Intl.RelativeTimeFormat.supportedLocalesOf(settings.locale, { localeMatcher: "lookup" }).length) throw new Error("Native RelativeTimeFormat/locale is unavailable.")
    to = milliseconds(options.to, settings.unit); rel = relative(value - to, settings.relativeUnit)
    const formatter = new Intl.RelativeTimeFormat(settings.locale, { numeric: settings.numeric, style: settings.relativeStyle })
    locale = formatter.resolvedOptions().locale; text = formatter.format(rel.amount, rel.unit)
  } else {
    const parts = settings.zone.formatToParts(date), year = Number(parts.find(part => part.type === "year")?.value)
    if (parts.find(part => part.type === "era")?.value !== "AD" || year < 1 || year > 9999) throw new RangeError("The selected timeZone displays this instant outside Gregorian years 0001–9999.")
    const dateFields: TimeDateOptions = { year: "numeric", month: "short", day: "numeric" }
    const clockFields: TimeDateOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZoneName: "short" }
    const fields = Object.keys(settings.dateTime).length ? settings.dateTime : settings.type === "date" ? dateFields
      : settings.type === "time" ? clockFields : { ...dateFields, ...clockFields }
    const formatter = new Intl.DateTimeFormat(settings.locale, { ...fields, calendar: "gregory", timeZone: settings.timeZone })
    locale = formatter.resolvedOptions().locale; text = formatter.format(date)
  }
  return Object.freeze({ text, datetime: date.toISOString(), time: value, to, type: settings.type, locale, timeZone: settings.timeZone, relative: rel })
}
