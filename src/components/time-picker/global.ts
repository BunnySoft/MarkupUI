import { createTimePicker, isTimePickerSupported } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITimePicker?: { createTimePicker: typeof createTimePicker; isTimePickerSupported: typeof isTimePickerSupported } }
if (target.MarkupUITimePicker !== undefined) throw new Error("MarkupUITimePicker is already defined; no API was replaced.")
target.MarkupUITimePicker = { createTimePicker, isTimePickerSupported }
