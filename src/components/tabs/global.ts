import { createTabs } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITabs?: { createTabs: typeof createTabs } }
if (target.MarkupUITabs !== undefined) throw new Error("MarkupUITabs is already defined; no API was replaced.")
target.MarkupUITabs = { createTabs }
