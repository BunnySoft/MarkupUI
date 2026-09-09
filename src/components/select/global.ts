import { createSelect } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISelect?: { createSelect: typeof createSelect } }
if (target.MarkupUISelect !== undefined) throw new Error("MarkupUISelect is already defined; no API was replaced.")
target.MarkupUISelect = { createSelect }
