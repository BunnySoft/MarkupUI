import { createDatePicker, isDatePickerTypeSupported } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDatePicker?: { createDatePicker: typeof createDatePicker; isDatePickerTypeSupported: typeof isDatePickerTypeSupported } }
if (target.MarkupUIDatePicker !== undefined) throw new Error("MarkupUIDatePicker is already defined; no API was replaced.")
target.MarkupUIDatePicker = { createDatePicker, isDatePickerTypeSupported }
