import { List, ListItem, listSizes, registerList } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIList?: typeof import("./index.js") }
if (target.MarkupUIList !== undefined) throw new Error("MarkupUIList is already defined.")
target.MarkupUIList = { List, ListItem, listSizes, registerList }
