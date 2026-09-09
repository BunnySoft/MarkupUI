import { createRadioGroup } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIRadio?: { createRadioGroup: typeof createRadioGroup } }
if (target.MarkupUIRadio !== undefined) throw new Error("MarkupUIRadio is already defined; no API was replaced.")
target.MarkupUIRadio = { createRadioGroup }
