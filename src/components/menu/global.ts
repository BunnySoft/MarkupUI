import { createMenu } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIMenu?: { createMenu: typeof createMenu } }
if (target.MarkupUIMenu !== undefined) throw new Error("MarkupUIMenu is already defined; no API was replaced.")
target.MarkupUIMenu = { createMenu }
