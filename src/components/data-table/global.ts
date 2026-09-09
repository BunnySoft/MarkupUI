import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDataTable?: typeof api }
if (target.MarkupUIDataTable !== undefined) throw new Error("MarkupUIDataTable is already defined; no API was replaced.")
target.MarkupUIDataTable = api
