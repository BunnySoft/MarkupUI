import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIVirtualList?: typeof api }
if (target.MarkupUIVirtualList !== undefined) throw new Error("MarkupUIVirtualList is already defined; no API was replaced.")
target.MarkupUIVirtualList = api
