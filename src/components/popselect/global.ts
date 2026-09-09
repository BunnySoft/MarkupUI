import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIPopselect?: typeof api }
if (target.MarkupUIPopselect !== undefined) throw new Error("MarkupUIPopselect is already defined; no API was replaced.")
target.MarkupUIPopselect = api
