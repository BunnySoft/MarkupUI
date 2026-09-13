import * as rate from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIRate?: typeof rate }
if (target.MarkupUIRate !== undefined) throw new Error("MarkupUIRate is already defined; no API was replaced.")
target.MarkupUIRate = rate

