export { Tooltip } from "./tooltip-element.js"
export { TooltipTrigger, TooltipContent } from "./regions.js"
export { createTooltip } from "./tooltip.js"
export { tooltipPlacements, isTooltipElement } from "./model.js"
export type { TooltipController, TooltipOptions } from "./tooltip.js"
export type { TooltipPlacement } from "./model.js"

import { Tooltip } from "./tooltip-element.js"
import { TooltipTrigger, TooltipContent } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerTooltip(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Tooltip, TooltipTrigger, TooltipContent], registry)
}

if (typeof customElements !== "undefined") registerTooltip()
