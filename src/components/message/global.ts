import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIMessage?: typeof api }
if (target.MarkupUIMessage !== undefined) throw new Error("MarkupUIMessage namespace is already defined.")
target.MarkupUIMessage = api
