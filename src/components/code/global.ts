import * as code from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICode?: typeof code }
if (target.MarkupUICode !== undefined) throw new Error("MarkupUICode is already defined.")
target.MarkupUICode = code
