import * as anchor from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIAnchor?: typeof anchor }
if (target.MarkupUIAnchor !== undefined) throw new Error("MarkupUIAnchor is already defined; no API was replaced.")
target.MarkupUIAnchor = anchor

