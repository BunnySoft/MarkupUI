import { createForm } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIForm?: { createForm: typeof createForm } }
if (target.MarkupUIForm !== undefined) throw new Error("MarkupUIForm is already defined; no API was replaced.")
target.MarkupUIForm = { createForm }
