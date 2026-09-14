import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIForm?: typeof api }
if (target.MarkupUIForm !== undefined) throw new Error("MarkupUIForm is already defined; no API was replaced.")
target.MarkupUIForm = api
