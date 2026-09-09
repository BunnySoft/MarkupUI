import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITree?: typeof api }
if (target.MarkupUITree !== undefined) throw new Error("MarkupUITree is already defined; no API was replaced.")
target.MarkupUITree = api
