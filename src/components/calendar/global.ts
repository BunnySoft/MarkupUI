import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICalendar?: typeof api }
if (target.MarkupUICalendar !== undefined) throw new Error("MarkupUICalendar is already defined; no API was replaced.")
target.MarkupUICalendar = api
