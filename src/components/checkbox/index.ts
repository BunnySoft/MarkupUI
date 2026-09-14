export { Checkbox } from "./checkbox.js"
export type { CheckboxSize } from "./checkbox.js"
export { CheckboxGroup } from "./group.js"
export type { CheckboxGroupOptions, CheckboxGroupChange, CheckboxStatus } from "./group.js"

import { ViewElement } from "../../core/index.js"
import { Checkbox } from "./checkbox.js"
import { CheckboxGroup } from "./group.js"
export function registerCheckbox(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Checkbox, CheckboxGroup], registry)
}
if (typeof customElements !== "undefined") registerCheckbox()
