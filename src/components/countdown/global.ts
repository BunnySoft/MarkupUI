import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICountdown?: typeof api }
if (target.MarkupUICountdown !== undefined) throw new Error("MarkupUICountdown is already defined; no API was replaced.")
target.MarkupUICountdown = api
