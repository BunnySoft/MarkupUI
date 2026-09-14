import * as badge from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIBadge?: typeof badge }
if (target.MarkupUIBadge !== undefined) throw new Error("MarkupUIBadge is already defined.")
target.MarkupUIBadge = badge
