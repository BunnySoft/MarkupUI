import * as result from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIResult?: typeof result }
if (target.MarkupUIResult !== undefined) throw new Error("MarkupUIResult is already defined.")
target.MarkupUIResult = result
