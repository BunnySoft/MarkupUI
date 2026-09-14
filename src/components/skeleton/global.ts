import * as skeleton from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISkeleton?: typeof skeleton }
if (target.MarkupUISkeleton !== undefined) throw new Error("MarkupUISkeleton is already defined.")
target.MarkupUISkeleton = skeleton
