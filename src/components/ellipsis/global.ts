import * as ellipsis from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIEllipsis?: typeof ellipsis }
if (target.MarkupUIEllipsis !== undefined) throw new Error("MarkupUIEllipsis is already defined.")
target.MarkupUIEllipsis = ellipsis
