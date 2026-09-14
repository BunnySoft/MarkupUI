import * as highlight from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIHighlight?: typeof highlight }
if (target.MarkupUIHighlight !== undefined) throw new Error("MarkupUIHighlight is already defined.")
target.MarkupUIHighlight = highlight
