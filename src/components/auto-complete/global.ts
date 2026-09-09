import { createAutoComplete } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIAutoComplete?: { createAutoComplete: typeof createAutoComplete } }
if (target.MarkupUIAutoComplete !== undefined) throw new Error("MarkupUIAutoComplete is already defined; no API was replaced.")
target.MarkupUIAutoComplete = { createAutoComplete }
