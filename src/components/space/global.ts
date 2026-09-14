import { Space, registerSpace } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISpace?: typeof import("./index.js") }
if (target.MarkupUISpace) throw new Error("MarkupUISpace is already defined.")
target.MarkupUISpace = { Space, registerSpace }
