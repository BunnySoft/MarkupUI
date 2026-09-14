import * as affix from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIAffix?: typeof affix }
if (target.MarkupUIAffix !== undefined) throw new Error("MarkupUIAffix is already defined.")
target.MarkupUIAffix = affix
