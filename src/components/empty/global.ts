import * as empty from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIEmpty?: typeof empty }
if (target.MarkupUIEmpty !== undefined) throw new Error("MarkupUIEmpty is already defined.")
target.MarkupUIEmpty = empty
