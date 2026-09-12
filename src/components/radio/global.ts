import { Radio, RadioGroup, RadioButton, registerRadio } from "./index.js"
const target = globalThis as typeof globalThis & { MarkupUIRadio?: typeof import("./index.js") }
if (target.MarkupUIRadio !== undefined) throw new Error("MarkupUIRadio is already defined.")
target.MarkupUIRadio = { Radio, RadioGroup, RadioButton, registerRadio }
