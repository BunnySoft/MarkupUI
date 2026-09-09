import { createCheckboxGroup } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICheckbox?: { createCheckboxGroup: typeof createCheckboxGroup } }
if (target.MarkupUICheckbox !== undefined) throw new Error("MarkupUICheckbox is already defined; no API was replaced.")
target.MarkupUICheckbox = { createCheckboxGroup }
