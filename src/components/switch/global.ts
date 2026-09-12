import { Switch, registerSwitch } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISwitch?: typeof import("./index.js") }
if (target.MarkupUISwitch !== undefined) throw new Error("MarkupUISwitch is already defined; no API was replaced.")
target.MarkupUISwitch = { Switch, registerSwitch }
