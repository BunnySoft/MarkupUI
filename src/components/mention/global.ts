import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIMention?: typeof api }
if (target.MarkupUIMention !== undefined) throw new Error("MarkupUIMention is already defined; no API was replaced.")
target.MarkupUIMention = api

