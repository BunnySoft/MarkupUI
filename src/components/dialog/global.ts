import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDialog?: typeof api }
if (target.MarkupUIDialog !== undefined) throw new Error("MarkupUIDialog namespace is already defined.")
target.MarkupUIDialog = api
