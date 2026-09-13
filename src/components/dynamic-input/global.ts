import * as dynamicInput from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDynamicInput?: typeof dynamicInput }
if (target.MarkupUIDynamicInput !== undefined) throw new Error("MarkupUIDynamicInput is already defined; no API was replaced.")
target.MarkupUIDynamicInput = dynamicInput

