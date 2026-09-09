import { createInputNumber } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIInputNumber?: { createInputNumber: typeof createInputNumber } }
if (target.MarkupUIInputNumber !== undefined) throw new Error("MarkupUIInputNumber is already defined; no API was replaced.")
target.MarkupUIInputNumber = { createInputNumber }
