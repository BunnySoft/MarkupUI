import { createDynamicTags } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDynamicTags?: { createDynamicTags: typeof createDynamicTags } }
if (target.MarkupUIDynamicTags !== undefined) throw new Error("MarkupUIDynamicTags is already defined; no API was replaced.")
target.MarkupUIDynamicTags = { createDynamicTags }
