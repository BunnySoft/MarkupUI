import { init, use } from "echarts/core"
import { BarChart, LineChart, PieChart, ScatterChart } from "echarts/charts"
import { AriaComponent, DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
import { CanvasRenderer, SVGRenderer } from "echarts/renderers"
import type { ChartOption } from "./options.js"

use([BarChart, LineChart, PieChart, ScatterChart, AriaComponent, DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer, SVGRenderer])

export interface ChartRenderer {
  setOption(option: ChartOption, settings: { notMerge: boolean; lazyUpdate: boolean }): void
  resize(): void
  dispose(): void
  on(name: string, handler: (event: unknown) => void): void
}

export function createChartRenderer(element: HTMLElement, theme: "light" | "dark", renderer: "svg" | "canvas"): ChartRenderer {
  return init(element, theme, { renderer })
}
