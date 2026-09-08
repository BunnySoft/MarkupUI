import { createLoadingBar } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUILoadingBar?: { createLoadingBar: typeof createLoadingBar } }
if (target.MarkupUILoadingBar !== undefined) throw new Error("MarkupUILoadingBar is already defined; no API was replaced.")
target.MarkupUILoadingBar = { createLoadingBar }
