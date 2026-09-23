import * as chart from "./index.js"
const target = globalThis as typeof globalThis & { MarkupUIChart?: typeof chart }
if (target.MarkupUIChart !== undefined) throw new Error("MarkupUIChart is already defined.")
target.MarkupUIChart = chart
