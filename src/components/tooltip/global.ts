import * as tooltip from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITooltip?: typeof tooltip }
if (target.MarkupUITooltip !== undefined) throw new Error("MarkupUITooltip is already defined; no API was replaced.")
target.MarkupUITooltip = tooltip
