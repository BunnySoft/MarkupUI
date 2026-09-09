import { createInput } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIInput?: { createInput: typeof createInput } }
if (target.MarkupUIInput !== undefined) throw new Error("MarkupUIInput is already defined; no API was replaced.")
target.MarkupUIInput = { createInput }
