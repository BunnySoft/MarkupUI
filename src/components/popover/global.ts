import { createPopover } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIPopover?: { createPopover: typeof createPopover } }
if (target.MarkupUIPopover !== undefined) throw new Error("MarkupUIPopover is already defined; no API was replaced.")
target.MarkupUIPopover = { createPopover }
