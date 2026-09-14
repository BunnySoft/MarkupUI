import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITime?: typeof api }
if (target.MarkupUITime !== undefined) throw new Error("MarkupUITime is already defined.")
target.MarkupUITime = api

