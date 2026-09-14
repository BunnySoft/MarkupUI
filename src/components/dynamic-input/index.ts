export { DynamicInput } from "./dynamic-input-element.js"
export type { DynamicInputChangeDetail } from "./dynamic-input-element.js"
export { createDynamicInput } from "./dynamic-input.js"
export type { DynamicInputContext, DynamicInputController, DynamicInputOptions, DynamicInputRow } from "./dynamic-input.js"

import { DynamicInput } from "./dynamic-input-element.js"
import { ViewElement } from "../../core/index.js"

export function registerDynamicInput(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([DynamicInput], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(DynamicInput.tag)) registerDynamicInput()

