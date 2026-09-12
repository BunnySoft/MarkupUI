import { Collapse, CollapseItem, CollapseHeader, CollapseHeaderExtra, CollapseContent, registerCollapse } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICollapse?: typeof import("./index.js") }
if (target.MarkupUICollapse !== undefined) throw new Error("MarkupUICollapse is already defined.")
target.MarkupUICollapse = { Collapse, CollapseItem, CollapseHeader, CollapseHeaderExtra, CollapseContent, registerCollapse }
