import { Grid, GridItem, registerGrid } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIGrid?: typeof import("./index.js") }
if (target.MarkupUIGrid !== undefined) throw new Error("MarkupUIGrid is already defined.")
target.MarkupUIGrid = { Grid, GridItem, registerGrid }
