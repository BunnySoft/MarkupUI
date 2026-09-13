import * as menu from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIMenu?: typeof menu }
if (target.MarkupUIMenu !== undefined) throw new Error("MarkupUIMenu is already defined; no API was replaced.")
target.MarkupUIMenu = menu
