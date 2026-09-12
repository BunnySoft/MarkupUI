import * as typography from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITypography?: typeof typography }
if (target.MarkupUITypography !== undefined) throw new Error("MarkupUITypography is already defined.")
target.MarkupUITypography = typography
