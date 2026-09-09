import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUILog?: typeof api }
if (target.MarkupUILog !== undefined) throw new Error("MarkupUILog is already defined; no API was replaced.")
target.MarkupUILog = api
