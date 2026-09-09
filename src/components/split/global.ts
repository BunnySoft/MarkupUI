import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISplit?: typeof api }
if (target.MarkupUISplit !== undefined) throw new Error("MarkupUISplit is already defined; no API was replaced.")
target.MarkupUISplit = api
