import { ViewElement } from "../../core/index.js"
import { Select } from "./select.js"
export { Select } from "./select.js"
export type { SelectValue, SelectSize, SelectStatus } from "./select.js"
export function registerSelect(): void { ViewElement.register([Select]) }
registerSelect()
