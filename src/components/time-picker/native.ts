import { createTemporalProbe } from "../temporal/native.js"

export function isTimePickerSupported(document: Document): boolean {
  const probe = createTemporalProbe(document, "time", "12:34")
  if (!probe) return false
  probe.value = "12:34:56.789"
  return probe.value !== "" && probe.valueAsNumber === 45_296_789
}

export function nativeTimeValue(document: Document, value: unknown): string {
  if (typeof value !== "string") throw new TypeError("Time Picker needs a time-only string; use empty string, not null, Date objects or epoch numbers.")
  const probe = createTemporalProbe(document, "time", "12:34")
  if (!probe) throw new TypeError("Native time parsing is unavailable; keep an explicit fallback outside the helper.")
  if (value === "") return ""
  const parts = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value)
  if (!parts || value.trim() !== value) throw new TypeError("Use HH:mm with optional :ss and 1-3 fractional digits, without dates, offsets or format tokens.")
  const hour = Number(parts[1]), minute = Number(parts[2]), second = Number(parts[3] ?? 0), millisecond = Number((parts[4] ?? "").padEnd(3, "0"))
  const coordinate = hour * 3_600_000 + minute * 60_000 + second * 1000 + millisecond
  probe.value = value
  if (hour > 23 || minute > 59 || second > 59 || !probe.value || probe.valueAsNumber !== coordinate) throw new TypeError("Invalid or unsupported-precision native time; the real field was not changed.")
  return probe.value
}
