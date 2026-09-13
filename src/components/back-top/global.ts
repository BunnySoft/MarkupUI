import * as backTop from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIBackTop?: typeof backTop }
if (target.MarkupUIBackTop !== undefined) throw new Error("MarkupUIBackTop is already defined; no API was replaced.")
target.MarkupUIBackTop = backTop

