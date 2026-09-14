export { Statistic, MStatistic } from "./statistic.js"

import { Statistic } from "./statistic.js"
import { ViewElement } from "../../core/index.js"

export function registerStatistic(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Statistic], registry)
}

if (typeof customElements !== "undefined") registerStatistic()

