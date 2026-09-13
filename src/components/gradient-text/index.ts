export { GradientText, MGradientText } from "./gradient-text.js"
export { gradientTextTypes } from "./model.js"
export type { GradientTextType } from "./model.js"

import { GradientText } from "./gradient-text.js"
import { ViewElement } from "../../core/index.js"

export function registerGradientText(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([GradientText], registry)
}

if (typeof customElements !== "undefined") registerGradientText()
