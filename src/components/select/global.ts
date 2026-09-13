import * as api from "./index.js"
const target = globalThis as typeof globalThis & { MarkupUISelect?: typeof api }
if (target.MarkupUISelect) throw new Error("MarkupUISelect is already loaded.")
target.MarkupUISelect = api
