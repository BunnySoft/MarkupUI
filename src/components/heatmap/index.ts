export { Heatmap, MHeatmap } from "./heatmap-element.js"
export { createHeatmap } from "./heatmap.js"
export { buildHeatmap, heatmapLevel } from "./model.js"
export type { HeatmapDataItem, HeatmapCell, HeatmapSettings, HeatmapOptions, HeatmapModel } from "./model.js"
export type { HeatmapController, HeatmapState } from "./heatmap.js"

import { Heatmap } from "./heatmap-element.js"
import { ViewElement } from "../../core/index.js"

export function registerHeatmap(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Heatmap], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Heatmap.tag)) registerHeatmap()

