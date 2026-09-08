import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDrawer?: typeof api }
if (target.MarkupUIDrawer !== undefined) throw new Error("MarkupUIDrawer namespace is already defined.")
target.MarkupUIDrawer = api
