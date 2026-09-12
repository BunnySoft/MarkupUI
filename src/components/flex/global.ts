import { Flex, registerFlex } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIFlex?: typeof import("./index.js") }
if (target.MarkupUIFlex !== undefined) throw new Error("MarkupUIFlex is already defined.")
target.MarkupUIFlex = { Flex, registerFlex }
