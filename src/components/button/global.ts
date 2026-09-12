import { Button, ButtonGroup, registerButton } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIButton?: typeof import("./index.js") }
if (target.MarkupUIButton !== undefined) throw new Error("MarkupUIButton is already defined.")
target.MarkupUIButton = { Button, ButtonGroup, registerButton }
