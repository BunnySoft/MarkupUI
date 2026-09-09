import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICarousel?: typeof api }
if (target.MarkupUICarousel !== undefined) throw new Error("MarkupUICarousel is already defined; no API was replaced.")
target.MarkupUICarousel = api
