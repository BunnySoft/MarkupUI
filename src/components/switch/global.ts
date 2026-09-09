import { createSwitch } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISwitch?: { createSwitch: typeof createSwitch } }
if (target.MarkupUISwitch !== undefined) throw new Error("MarkupUISwitch is already defined; no API was replaced.")
target.MarkupUISwitch = { createSwitch }
