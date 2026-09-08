import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICollapseTransition?: typeof api }
if (target.MarkupUICollapseTransition !== undefined) throw new Error("MarkupUICollapseTransition namespace is already defined.")
target.MarkupUICollapseTransition = api
