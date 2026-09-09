import { createRate } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIRate?: { createRate: typeof createRate } }
if (target.MarkupUIRate !== undefined) throw new Error("MarkupUIRate is already defined; no API was replaced.")
target.MarkupUIRate = { createRate }
