import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITransfer?: typeof api }
if (target.MarkupUITransfer !== undefined) throw new Error("MarkupUITransfer is already defined; no API was replaced.")
target.MarkupUITransfer = api
