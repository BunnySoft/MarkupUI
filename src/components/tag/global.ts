import * as tag from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITag?: typeof tag }
if (target.MarkupUITag !== undefined) throw new Error("MarkupUITag is already defined.")
target.MarkupUITag = tag
