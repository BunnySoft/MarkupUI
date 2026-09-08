import { createSteps } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISteps?: { createSteps: typeof createSteps } }
if (target.MarkupUISteps !== undefined) throw new Error("MarkupUISteps is already defined; no API was replaced.")
target.MarkupUISteps = { createSteps }
