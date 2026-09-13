import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIAutoComplete?: typeof api }
if (target.MarkupUIAutoComplete !== undefined) throw new Error("MarkupUIAutoComplete is already defined; no API was replaced.")
target.MarkupUIAutoComplete = api

