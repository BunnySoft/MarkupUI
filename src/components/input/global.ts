import { Input, Textarea, InputGroup, InputGroupLabel, registerInput } from "./index.js"
const target = globalThis as typeof globalThis & { MarkupUIInput?: typeof import("./index.js") }
if (target.MarkupUIInput !== undefined) throw new Error("MarkupUIInput is already defined.")
target.MarkupUIInput = { Input, Textarea, InputGroup, InputGroupLabel, registerInput }
