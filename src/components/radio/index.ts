export { Radio, RadioButton } from "./radio.js"
export type { RadioSize } from "./radio.js"
export { RadioGroup } from "./group.js"
export type { RadioStatus, RadioGroupChange } from "./group.js"

import { ViewElement } from "../../core/index.js"
import { Radio, RadioButton } from "./radio.js"
import { RadioGroup } from "./group.js"
export function registerRadio(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Radio, RadioButton, RadioGroup], registry)
}
if (typeof customElements !== "undefined") registerRadio()
