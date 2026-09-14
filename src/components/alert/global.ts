import * as alert from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIAlert?: typeof alert }
if (target.MarkupUIAlert !== undefined) throw new Error("MarkupUIAlert is already defined.")
target.MarkupUIAlert = alert
