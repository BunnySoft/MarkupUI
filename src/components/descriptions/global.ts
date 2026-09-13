import { DescriptionItem, Descriptions, MDescriptionItem, MDescriptions, registerDescriptions } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDescriptions?: typeof import("./index.js") }
if (target.MarkupUIDescriptions !== undefined) throw new Error("MarkupUIDescriptions is already defined.")
target.MarkupUIDescriptions = { Descriptions, MDescriptions, DescriptionItem, MDescriptionItem, registerDescriptions }
