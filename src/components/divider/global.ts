import { Divider, registerDivider } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDivider?: typeof import("./index.js") }
if (target.MarkupUIDivider !== undefined) throw new Error("MarkupUIDivider is already defined.")
target.MarkupUIDivider = { Divider, registerDivider }
