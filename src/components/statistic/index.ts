export { MuiStatistic } from "./statistic.js"
import { MuiStatistic } from "./statistic.js"

export function registerStatistic(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-statistic")
  if (existing && existing !== MuiStatistic) {
    throw new Error("'mui-statistic' is already defined. Load the Statistic component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-statistic", MuiStatistic)
}

if (typeof customElements !== "undefined") registerStatistic()
