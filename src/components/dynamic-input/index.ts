export { DynamicInput, DynamicInputTemplate } from "./dynamic-input-element.js"
export type { DynamicInputContext, DynamicInputRow } from "./dynamic-input.js"

import { DynamicInput, DynamicInputTemplate } from "./dynamic-input-element.js"
import { ViewElement } from "../../core/index.js"

export function registerDynamicInput(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([DynamicInputTemplate, DynamicInput], registry)
}

if (typeof customElements !== "undefined") registerDynamicInput()

