import * as datePicker from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDatePicker?: typeof datePicker }
if (target.MarkupUIDatePicker !== undefined) throw new Error("MarkupUIDatePicker is already defined; no API was replaced.")
target.MarkupUIDatePicker = datePicker

