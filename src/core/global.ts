import { ViewElement } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICore?: typeof import("./index.js") }
if (target.MarkupUICore !== undefined) throw new Error("MarkupUICore is already defined.")
target.MarkupUICore = { ViewElement }
