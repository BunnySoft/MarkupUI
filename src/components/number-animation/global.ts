import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUINumberAnimation?: typeof api }
if (target.MarkupUINumberAnimation !== undefined) throw new Error("MarkupUINumberAnimation is already defined; no API was replaced.")
target.MarkupUINumberAnimation = api
