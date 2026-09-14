import * as layout from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUILayout?: typeof layout }
if (target.MarkupUILayout !== undefined) throw new Error("MarkupUILayout is already defined.")
target.MarkupUILayout = layout
