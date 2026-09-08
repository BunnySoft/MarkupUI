import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIModal?: typeof api }
if (target.MarkupUIModal !== undefined) throw new Error("MarkupUIModal namespace is already defined.")
target.MarkupUIModal = api
