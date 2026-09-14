export { NumberAnimation, NumberAnimation as MNumberAnimation } from "./number-animation-element.js"
export { createNumberAnimation } from "./number-animation.js"
export { formatAnimatedNumber, interpolateNumber } from "./number.js"
export type { NumberFormatSettings } from "./number.js"
export type { NumberAnimationSettings, NumberAnimationOptions, NumberAnimationInfo, NumberAnimationFinish, NumberAnimationState, NumberAnimationController } from "./number-animation.js"

import { NumberAnimation } from "./number-animation-element.js"
import { ViewElement } from "../../core/index.js"

export function registerNumberAnimation(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([NumberAnimation], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(NumberAnimation.tag)) registerNumberAnimation()

