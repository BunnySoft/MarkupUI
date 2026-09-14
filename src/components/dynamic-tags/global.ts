import * as dynamicTags from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDynamicTags?: typeof dynamicTags }
if (target.MarkupUIDynamicTags !== undefined) throw new Error("MarkupUIDynamicTags is already defined; no API was replaced.")
target.MarkupUIDynamicTags = dynamicTags

