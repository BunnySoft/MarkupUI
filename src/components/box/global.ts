import * as box from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIBox?: typeof box }
if (target.MarkupUIBox !== undefined) throw new Error("MarkupUIBox is already defined.")
target.MarkupUIBox = box
