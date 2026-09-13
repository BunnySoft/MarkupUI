import * as floatButton from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIFloatButton?: typeof floatButton }
if (target.MarkupUIFloatButton !== undefined) throw new Error("MarkupUIFloatButton is already defined.")
target.MarkupUIFloatButton = floatButton
