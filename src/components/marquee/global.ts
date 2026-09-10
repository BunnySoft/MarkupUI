import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIMarquee?: typeof api }
if (target.MarkupUIMarquee !== undefined) throw new Error("MarkupUIMarquee is already defined; no API was replaced.")
target.MarkupUIMarquee = api
