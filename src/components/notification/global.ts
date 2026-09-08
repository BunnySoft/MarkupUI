import * as api from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUINotification?: typeof api }
if (target.MarkupUINotification !== undefined) throw new Error("MarkupUINotification namespace is already defined.")
target.MarkupUINotification = api
