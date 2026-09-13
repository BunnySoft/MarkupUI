import * as progress from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIProgress?: typeof progress }
if (target.MarkupUIProgress !== undefined) throw new Error("MarkupUIProgress is already defined.")
target.MarkupUIProgress = progress

