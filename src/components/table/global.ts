import * as table from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITable?: typeof table }
if (target.MarkupUITable !== undefined) throw new Error("MarkupUITable is already defined.")
target.MarkupUITable = table
