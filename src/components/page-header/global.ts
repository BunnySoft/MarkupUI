import * as pageHeader from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIPageHeader?: typeof pageHeader }
if (target.MarkupUIPageHeader !== undefined) throw new Error("MarkupUIPageHeader is already defined.")
target.MarkupUIPageHeader = pageHeader
