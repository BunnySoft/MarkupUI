import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIHeatmap?: typeof api }
if (target.MarkupUIHeatmap !== undefined) throw new Error("MarkupUIHeatmap is already defined; no API was replaced.")
target.MarkupUIHeatmap = api
