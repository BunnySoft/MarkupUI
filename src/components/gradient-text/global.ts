import * as gradientText from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIGradientText?: typeof gradientText }
if (target.MarkupUIGradientText !== undefined) throw new Error("MarkupUIGradientText is already defined.")
target.MarkupUIGradientText = gradientText
