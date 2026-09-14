export { FloatButton } from "./float-button.js"
export { FloatButton as MFloatButton } from "./float-button.js"
export { FloatButtonGroup } from "./group.js"
export { FloatButtonGroup as MFloatButtonGroup } from "./group.js"
export type { FloatButtonType, FloatButtonShape, FloatButtonClickDetail } from "./model.js"

import { FloatButton } from "./float-button.js"
import { FloatButtonGroup } from "./group.js"
import { ViewElement } from "../../core/index.js"

export function registerFloatButton(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([FloatButton, FloatButtonGroup], registry)
}

if (typeof customElements !== "undefined") registerFloatButton()
