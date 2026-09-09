import { createMention } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIMention?: { createMention: typeof createMention } }
if (target.MarkupUIMention !== undefined) throw new Error("MarkupUIMention is already defined; no API was replaced.")
target.MarkupUIMention = { createMention }
