import * as breadcrumb from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIBreadcrumb?: typeof breadcrumb }
if (target.MarkupUIBreadcrumb !== undefined) throw new Error("MarkupUIBreadcrumb is already defined.")
target.MarkupUIBreadcrumb = breadcrumb
