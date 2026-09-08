import { createCollapse } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICollapse?: { createCollapse: typeof createCollapse } }
if (target.MarkupUICollapse !== undefined) throw new Error("MarkupUICollapse is already defined; no API was replaced.")
target.MarkupUICollapse = { createCollapse }
