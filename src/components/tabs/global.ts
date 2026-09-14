import * as tabs from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITabs?: typeof tabs }
if (target.MarkupUITabs !== undefined) throw new Error("MarkupUITabs is already defined; no API was replaced.")
target.MarkupUITabs = tabs
