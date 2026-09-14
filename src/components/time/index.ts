export { Time, MTime, timeTypes } from "./time-element.js"
export type { TimeDisplayType } from "./time-element.js"
export { formatTime } from "./format.js"
export { createTime } from "./time.js"
export type { TimeInput, TimeType, TimeUnit, RelativeUnit, TimeDateOptions, TimeFormatOptions, FormattedTime } from "./format.js"
export type { TimeBindingOptions, TimeState, TimeController } from "./time.js"

import { Time } from "./time-element.js"
import { ViewElement } from "../../core/index.js"

export function registerTime(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Time], registry)
}

if (typeof customElements !== "undefined") registerTime()
