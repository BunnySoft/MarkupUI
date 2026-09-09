import { createTemporalProbe } from "../temporal/native.js"

export type NativeDateType = "date" | "month" | "week" | "datetime-local"
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
  return { value: probe.value, coordinate: probe.valueAsNumber }
}
