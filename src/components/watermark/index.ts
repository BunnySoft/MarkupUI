export { Watermark, MWatermark } from "./watermark-element.js"
export { createWatermark } from "./watermark.js"
export type { WatermarkSettings, WatermarkOptions, WatermarkImageContext, WatermarkImageLoader, WatermarkResult, WatermarkState, WatermarkController } from "./watermark.js"

import { Watermark } from "./watermark-element.js"
import { ViewElement } from "../../core/index.js"

export function registerWatermark(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Watermark], registry)
}

if (typeof customElements !== "undefined") registerWatermark()

