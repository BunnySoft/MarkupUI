import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITreeSelect?: typeof api }
if (target.MarkupUITreeSelect !== undefined) throw new Error("MarkupUITreeSelect is already defined; no API was replaced.")
target.MarkupUITreeSelect = api
