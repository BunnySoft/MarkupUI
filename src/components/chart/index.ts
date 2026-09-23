export { Chart } from "./chart.js"
export { ChartDataset } from "./dataset.js"
export { ChartTitle, ChartTooltip, ChartLegend, ChartXAxis, ChartYAxis, ChartSeries, ChartEncode, ChartLabel } from "./config.js"
export type { ChartOption } from "./options.js"
export type { ChartSource, ChartValue } from "./data.js"
export { configureChartEngine } from "./renderer.js"
export type { ChartEngine, ChartRenderer } from "./renderer.js"

import { ViewElement } from "../../core/index.js"
import { Chart } from "./chart.js"
import { ChartDataset } from "./dataset.js"
import { ChartTitle, ChartTooltip, ChartLegend, ChartXAxis, ChartYAxis, ChartSeries, ChartEncode, ChartLabel } from "./config.js"

export function registerChart(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([ChartDataset, ChartTitle, ChartTooltip, ChartLegend, ChartXAxis, ChartYAxis, ChartSeries, ChartEncode, ChartLabel, Chart], registry)
}
if (typeof customElements !== "undefined") registerChart()
