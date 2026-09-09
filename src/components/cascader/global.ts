import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICascader?: typeof api }
if (target.MarkupUICascader !== undefined) throw new Error("MarkupUICascader is already defined; no API was replaced.")
target.MarkupUICascader = api
