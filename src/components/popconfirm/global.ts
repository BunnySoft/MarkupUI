import * as popconfirm from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIPopconfirm?: typeof popconfirm }
if (target.MarkupUIPopconfirm !== undefined) throw new Error("MarkupUIPopconfirm is already defined; no API was replaced.")
target.MarkupUIPopconfirm = popconfirm

