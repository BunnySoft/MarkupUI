import * as colorPicker from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIColorPicker?: typeof colorPicker }
if (target.MarkupUIColorPicker !== undefined) throw new Error("MarkupUIColorPicker is already defined; no API was replaced.")
target.MarkupUIColorPicker = colorPicker

