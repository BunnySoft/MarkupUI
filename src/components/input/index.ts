export { Input, Textarea, InputGroup, InputGroupLabel } from "./input.js"
export type { InputType, InputSize, InputStatus } from "./input.js"
export type { InputCount } from "../native-input.js"

import { ViewElement } from "../../core/index.js"
import { Input, Textarea, InputGroup, InputGroupLabel } from "./input.js"

export function registerInput(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Input, Textarea, InputGroup, InputGroupLabel], registry)
}
if (typeof customElements !== "undefined") registerInput()
