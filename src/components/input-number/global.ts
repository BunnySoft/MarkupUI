import { InputNumber, registerInputNumber } from "./index.js"
const target = globalThis as typeof globalThis & { MarkupUIInputNumber?: typeof import("./index.js") }
if (target.MarkupUIInputNumber !== undefined) throw new Error("MarkupUIInputNumber is already defined; no API was replaced.")
target.MarkupUIInputNumber = { InputNumber, registerInputNumber }
