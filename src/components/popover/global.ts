import * as popover from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIPopover?: typeof popover }
if (target.MarkupUIPopover !== undefined) throw new Error("MarkupUIPopover is already defined.")
target.MarkupUIPopover = popover
