import { nativeDateValue } from "../date-picker/native.js"

export interface CalendarDate { readonly year: number; readonly month: number; readonly date: number }
export const lastOrdinal = 3652058
export function monthDays(year: number, month: number) {
  return month === 2 ? year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28
    : [4, 6, 9, 11].includes(month) ? 30 : 31
}
function beforeYear(year: number) {
  const y = year - 1
  return 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)
}
export function ordinal(parts: CalendarDate) {
  let result = beforeYear(parts.year) + parts.date - 1
  for (let month = 1; month < parts.month; ++month) result += monthDays(parts.year, month)
  return result
}
export function fromOrdinal(value: number): CalendarDate {
  if (!Number.isInteger(value) || value < 0 || value > lastOrdinal) throw new RangeError("Date is outside Gregorian years 0001–9999.")
  let lo = 1, hi = 9999
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (beforeYear(mid) <= value) lo = mid
    else hi = mid - 1
  }
  let remaining = value - beforeYear(lo), month = 1
  while (remaining >= monthDays(lo, month)) remaining -= monthDays(lo, month++)
  return Object.freeze({ year: lo, month, date: remaining + 1 })
}
export function dateString(parts: CalendarDate) {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.date).padStart(2, "0")}`
}
export function parseDate(document: Document, value: unknown): CalendarDate {
  const parsed = nativeDateValue(document, "date", value).value
  if (!parsed) throw new TypeError("Use a nonempty canonical YYYY-MM-DD date, not an instant.")
  return Object.freeze({ year: Number(parsed.slice(0, 4)), month: Number(parsed.slice(5, 7)), date: Number(parsed.slice(8, 10)) })
}
export function parseMonth(document: Document, value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) throw new TypeError("panel must be canonical YYYY-MM.")
  return parseDate(document, `${value}-01`)
}
export function monthIndex(parts: CalendarDate) { return (parts.year - 1) * 12 + parts.month - 1 }
export function inMonth(index: number, day: number): CalendarDate {
  const key = Math.max(0, Math.min(119987, index)), year = Math.floor(key / 12) + 1, month = key % 12 + 1
  return Object.freeze({ year, month, date: Math.min(day, monthDays(year, month)) })
}
export function weekday(parts: CalendarDate) { return (ordinal(parts) + 1) % 7 }

/** A UTC Gregorian formatting carrier only, never the Calendar's value/instant model. */
export function carrier(parts: CalendarDate) {
  const value = new Date(0)
  value.setUTCFullYear(parts.year, parts.month - 1, parts.date)
  value.setUTCHours(12, 0, 0, 0)
  return value
}
