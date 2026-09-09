import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIUpload?: typeof api }
if (target.MarkupUIUpload !== undefined) throw new Error("MarkupUIUpload is already defined; no API was replaced.")
target.MarkupUIUpload = api
