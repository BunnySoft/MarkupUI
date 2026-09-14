import * as pagination from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIPagination?: typeof pagination }
if (target.MarkupUIPagination !== undefined) throw new Error("MarkupUIPagination is already defined; no API was replaced.")
target.MarkupUIPagination = pagination
