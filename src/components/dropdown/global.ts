import { createDropdown } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDropdown?: { createDropdown: typeof createDropdown } }
if (target.MarkupUIDropdown !== undefined) throw new Error("MarkupUIDropdown is already defined; no API was replaced.")
target.MarkupUIDropdown = { createDropdown }
