import { createColorPicker } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIColorPicker?: { createColorPicker: typeof createColorPicker } }
if (target.MarkupUIColorPicker !== undefined) throw new Error("MarkupUIColorPicker is already defined; no API was replaced.")
target.MarkupUIColorPicker = { createColorPicker }
