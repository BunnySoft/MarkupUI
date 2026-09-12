import { createInput } from "./native-input.js"

const key = Symbol.for("markup-ui.native-input")
const target = globalThis as typeof globalThis & { [key: symbol]: unknown }
if (target[key] !== undefined) throw new Error("Native Input mechanics are already loaded.")
target[key] = { createInput }
