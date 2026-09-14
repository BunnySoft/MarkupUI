import * as timePicker from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITimePicker?: typeof timePicker }
if (target.MarkupUITimePicker !== undefined) throw new Error("MarkupUITimePicker is already defined; no API was replaced.")
target.MarkupUITimePicker = timePicker

