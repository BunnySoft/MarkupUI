import * as image from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIImage?: typeof image }
if (target.MarkupUIImage !== undefined) throw new Error("MarkupUIImage is already defined.")
target.MarkupUIImage = image
