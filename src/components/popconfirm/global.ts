import { createPopconfirm } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIPopconfirm?: { createPopconfirm: typeof createPopconfirm } }
if (target.MarkupUIPopconfirm !== undefined) throw new Error("MarkupUIPopconfirm is already defined; no API was replaced.")
target.MarkupUIPopconfirm = { createPopconfirm }
