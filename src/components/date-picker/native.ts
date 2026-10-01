import { createTemporalProbe } from "../temporal/native.js"

export type NativeDateType = "date" | "month" | "week" | "datetime-local"
export type DatePickerProfile = NativeDateType | "year" | "quarter"
export type DatePickerType = "date" | "datetime" | "daterange" | "datetimerange" | "month" | "year" | "quarter"
export const datePickerTypes: readonly DatePickerType[] = [
  "date", "datetime", "daterange", "datetimerange", "month", "year", "quarter",
] as const
export type DatePickerValue = string | number | readonly [string, string]
export const quarterPattern = "(?!0000)[0-9]{4}-Q[1-4]"
export interface ParsedDateValue {
  readonly value: string | number
  readonly text: string
  readonly coordinate: number | null
}
export interface DatePickerConstraints {
  readonly min: string | null
  readonly max: string | null
  readonly step: string | null
  readonly pattern: string | null
}

export function validateDatePickerConstraints(profile: DatePickerProfile, constraints: DatePickerConstraints): void {
  if (profile === "quarter" && constraints.pattern !== null && constraints.pattern !== quarterPattern)
    throw new TypeError("Quarter uses the bounded YYYY-Q1 through YYYY-Q4 native pattern.")
  if (profile !== "year") return
  for (const [text, fallback] of [[constraints.min, 1], [constraints.max, 9999]] as const) {
    const value = text === null ? fallback : Number(text)
    if (text !== null && !/^\d{1,4}$/.test(text) || !Number.isInteger(value) || value < 1 || value > 9999)
      throw new TypeError("Year native bounds must be integers within 1-9999.")
  }
  if (Number(constraints.min ?? 1) > Number(constraints.max ?? 9999)) throw new TypeError("Year min must not exceed max.")
  if (constraints.step !== null && (!/^\d+$/.test(constraints.step) || !Number.isInteger(Number(constraints.step)) || Number(constraints.step) < 1))
    throw new TypeError("Year native step must be a positive integer.")
}
const samples: Record<NativeDateType, string> = {
  date: "2000-02-29", month: "2000-02", week: "2000-W01", "datetime-local": "2000-02-29T12:34",
}
const syntax: Record<NativeDateType, RegExp> = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  month: /^\d{4}-\d{2}$/,
  week: /^\d{4}-W\d{2}$/,
  "datetime-local": /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/,
}
export function isDatePickerTypeSupported(document: Document, type: NativeDateType): boolean {
  return Object.hasOwn(samples, type) && createTemporalProbe(document, type, samples[type]) !== null
}
export function nativeDateValue(document: Document, type: NativeDateType, value: unknown): { value: string; coordinate: number | null } {
  if (typeof value !== "string") throw new TypeError("Date Picker values are native strings; use empty string, not null, Date objects or epoch numbers.")
  const probe = createTemporalProbe(document, type, samples[type])
  if (!probe) throw new TypeError(`Native ${type} parsing/ordering is unavailable; keep an explicit fallback outside this helper.`)
  if (value === "") return { value: "", coordinate: null }
  if (!syntax[type].test(value) || value.trim() !== value) throw new TypeError("Use native date/month/week/local datetime strings with years 0001-9999, T separator and at most millisecond precision.")
  probe.value = value
  if (!probe.value || !Number.isFinite(probe.valueAsNumber)) throw new TypeError(`Invalid nonempty ${type} value; the real field was not changed.`)
  if (type === "datetime-local" && localPrecision(probe.value) !== localPrecision(value))
    throw new TypeError("Native local datetime serialization has unsupported-precision; the real field was not changed.")
  return { value: probe.value, coordinate: probe.valueAsNumber }
}

function localPrecision(value: string): string {
  const match = /^(.+T\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value)!
  const fraction = (match[3] ?? "").padEnd(3, "0").replace(/0+$/, "")
  return `${match[1]}${Number(match[2] ?? 0) || fraction ? `:${match[2] ?? "00"}` : ""}${fraction ? `.${fraction}` : ""}`
}

export function datePickerMode(type: DatePickerType): { profile: DatePickerProfile; range: boolean } {
  if (!datePickerTypes.includes(type)) throw new RangeError("Use a supported Date Picker type.")
  return { profile: type === "datetime" || type === "datetimerange" ? "datetime-local"
    : type === "daterange" ? "date" : type, range: type === "daterange" || type === "datetimerange" }
}

export function datePickerInputType(profile: DatePickerProfile): string {
  return profile === "year" ? "number" : profile === "quarter" ? "text" : profile
}

/** Validate application values before touching a real field. */
export function datePickerValue(document: Document, profile: DatePickerProfile, value: unknown): ParsedDateValue {
  if (profile === "year") {
    if (value === "") return { value: "", text: "", coordinate: null }
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 9999)
      throw new TypeError("Year values are integers from 1 to 9999, or empty string.")
    return { value, text: String(value), coordinate: value }
  }
  if (profile === "quarter") {
    if (typeof value !== "string" || value !== "" && (!/^\d{4}-Q[1-4]$/.test(value) || value.startsWith("0000")))
      throw new TypeError("Quarter values use YYYY-Q1 through YYYY-Q4, with years 0001-9999, or empty string.")
    return { value, text: value, coordinate: value === "" ? null : Number(value.slice(0, 4)) * 4 + Number(value.slice(-1)) }
  }
  const parsed = nativeDateValue(document, profile, value)
  return { ...parsed, text: parsed.value }
}

/** Number markup is a serialization boundary, not a second application value model. */
export function datePickerDefault(document: Document, profile: DatePickerProfile, text: string): ParsedDateValue {
  if (profile === "year" && text !== "") {
    if (!/^\d{1,4}$/.test(text)) throw new TypeError("Year defaults use integer text from 1 to 9999.")
    return datePickerValue(document, profile, Number(text))
  }
  return datePickerValue(document, profile, text)
}

/** Null describes an actual user draft; it must never become a cached valid selection. */
export function datePickerEntry(document: Document, profile: DatePickerProfile, input: HTMLInputElement): ParsedDateValue | null {
  if (input.validity.badInput) return null
  const text = input.value
  if (profile === "year") {
    if (text === "") return { value: "", text: "", coordinate: null }
    const value = input.valueAsNumber
    return Number.isInteger(value) && value >= 1 && value <= 9999 ? { value, text, coordinate: value } : null
  }
  if (profile === "quarter") {
    if (text !== "" && (!/^\d{4}-Q[1-4]$/.test(text) || text.startsWith("0000"))) return null
  }
  return datePickerValue(document, profile, text)
}

export function datePickerValues(document: Document, profile: DatePickerProfile, range: boolean, value: unknown): readonly ParsedDateValue[] {
  if (!range) {
    if (Array.isArray(value)) throw new TypeError("Use one scalar value for a single field.")
    return [datePickerValue(document, profile, value)]
  }
  if (profile === "year" || profile === "quarter") throw new TypeError("Year and quarter profiles use one field.")
  if (!Array.isArray(value) || value.length !== 2 || !(0 in value) || !(1 in value))
    throw new TypeError("Use an explicit two-string tuple for a range; empty string is native empty.")
  return Array.from(value, item => datePickerValue(document, profile, item))
}

export function datePickerProjection(values: readonly ParsedDateValue[]): DatePickerValue {
  return values.length === 1 ? values[0]!.value : Object.freeze([values[0]!.text, values[1]!.text] as const)
}
