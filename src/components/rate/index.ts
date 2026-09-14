export { Rate, Rate as MRate, rateSizes } from "./rate-element.js"
export type { RateSize } from "./rate-element.js"
export { createRate } from "./rate.js"
export type { RateController, RateOptions } from "./rate.js"

import { Rate } from "./rate-element.js"
import { ViewElement } from "../../core/index.js"

export function registerRate(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Rate], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Rate.tag)) registerRate()

