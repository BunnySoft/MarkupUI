import { createTooltip } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITooltip?: { createTooltip: typeof createTooltip } }
if (target.MarkupUITooltip !== undefined) throw new Error("MarkupUITooltip is already defined; no API was replaced.")
target.MarkupUITooltip = { createTooltip }
