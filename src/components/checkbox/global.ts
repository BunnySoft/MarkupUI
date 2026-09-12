import { Checkbox, CheckboxGroup, registerCheckbox } from "./index.js"
const target = globalThis as typeof globalThis & { MarkupUICheckbox?: typeof import("./index.js") }
if (target.MarkupUICheckbox !== undefined) throw new Error("MarkupUICheckbox is already defined.")
target.MarkupUICheckbox = { Checkbox, CheckboxGroup, registerCheckbox }
