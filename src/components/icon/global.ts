import { Icon, IconWrapper, registerIcon } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIIcon?: typeof import("./index.js") }
if (target.MarkupUIIcon !== undefined) throw new Error("MarkupUIIcon is already defined.")
target.MarkupUIIcon = { Icon, IconWrapper, registerIcon }
