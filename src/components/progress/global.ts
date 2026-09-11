import { MProgress, registerProgress } from "./index.js"

Object.assign(globalThis, { MarkupUIProgress: { MProgress, registerProgress } })
