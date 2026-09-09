import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIWatermark?: typeof api }
if (target.MarkupUIWatermark !== undefined) throw new Error("MarkupUIWatermark is already defined; no API was replaced.")
target.MarkupUIWatermark = api
