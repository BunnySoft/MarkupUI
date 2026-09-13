import * as steps from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISteps?: typeof steps }
if (target.MarkupUISteps !== undefined) throw new Error("MarkupUISteps is already defined.")
target.MarkupUISteps = steps
