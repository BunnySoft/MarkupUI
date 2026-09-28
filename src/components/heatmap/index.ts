export { Heatmap } from "./heatmap-element.js"
export { buildHeatmap, heatmapLevel } from "./model.js"
export type { HeatmapDataItem, HeatmapCell, HeatmapConfig, HeatmapSettings, HeatmapOptions, HeatmapModel } from "./model.js"
export type { HeatmapState } from "./heatmap.js"

import { Heatmap } from "./heatmap-element.js"
import { ViewElement } from "../../core/index.js"

export function registerHeatmap(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Heatmap], registry)
}

if (typeof customElements !== "undefined") registerHeatmap()
