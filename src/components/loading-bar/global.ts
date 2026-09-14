import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUILoadingBar?: typeof api }
if (target.MarkupUILoadingBar !== undefined) throw new Error("MarkupUILoadingBar is already defined; no API was replaced.")
target.MarkupUILoadingBar = api

