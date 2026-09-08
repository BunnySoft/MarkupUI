import { createAnchor } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIAnchor?: { createAnchor: typeof createAnchor } }
if (target.MarkupUIAnchor !== undefined) throw new Error("MarkupUIAnchor is already defined; no API was replaced.")
target.MarkupUIAnchor = { createAnchor }
