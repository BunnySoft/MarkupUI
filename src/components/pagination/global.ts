import { createPagination } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIPagination?: { createPagination: typeof createPagination } }
if (target.MarkupUIPagination !== undefined) throw new Error("MarkupUIPagination is already defined; no API was replaced.")
target.MarkupUIPagination = { createPagination }
