import * as native from "./native-select.js"
const key = Symbol.for("markup-ui.native-select")
const target = globalThis as typeof globalThis & { [key]?: typeof native }
if (target[key]) throw new Error("Native Select mechanics are already loaded.")
target[key] = native
