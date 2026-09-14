import * as spin from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUISpin?: typeof spin }
if (target.MarkupUISpin !== undefined) throw new Error("MarkupUISpin is already defined.")
target.MarkupUISpin = spin
