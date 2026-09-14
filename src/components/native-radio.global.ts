import { createRadioGroup, radioMembers, setRadioValue } from "./native-radio.js"
const key = Symbol.for("markup-ui.native-radio")
const target = globalThis as typeof globalThis & { [key]?: unknown }
if (target[key] !== undefined) throw new Error("Native Radio mechanics are already loaded.")
target[key] = { createRadioGroup, radioMembers, setRadioValue }
