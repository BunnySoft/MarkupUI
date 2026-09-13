export { Spin, MSpin, spinSizes } from "./spin.js"
export type { SpinPresetSize, SpinSize, SpinValidationError } from "./model.js"

import { Spin } from "./spin.js"
import { ViewElement } from "../../core/index.js"

export function registerSpin(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Spin], registry)
}

if (typeof customElements !== "undefined") registerSpin()
