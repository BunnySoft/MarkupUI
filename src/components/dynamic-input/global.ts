import { createDynamicInput } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDynamicInput?: { createDynamicInput: typeof createDynamicInput } }
if (target.MarkupUIDynamicInput !== undefined) throw new Error("MarkupUIDynamicInput is already defined; no API was replaced.")
target.MarkupUIDynamicInput = { createDynamicInput }
