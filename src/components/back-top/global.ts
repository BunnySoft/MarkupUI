import { createBackTop } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIBackTop?: { createBackTop: typeof createBackTop } }
if (target.MarkupUIBackTop !== undefined) throw new Error("MarkupUIBackTop is already defined; no API was replaced.")
target.MarkupUIBackTop = { createBackTop }
