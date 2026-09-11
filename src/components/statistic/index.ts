export { MStatistic } from "./statistic.js"
import { MStatistic } from "./statistic.js"

export function registerStatistic(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-statistic")
  if (existing && existing !== MStatistic) {
    throw new Error("'m-statistic' is already defined. Load the Statistic component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-statistic", MStatistic)
}

if (typeof customElements !== "undefined") registerStatistic()
