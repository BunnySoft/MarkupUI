export { InputNumber } from "./input-number.js"
export type { InputNumberState, InputNumberSize, InputNumberStatus } from "./input-number.js"

import { ViewElement } from "../../core/index.js"
import { InputNumber } from "./input-number.js"

export function registerInputNumber(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([InputNumber], registry)
}
if (typeof customElements !== "undefined") registerInputNumber()
