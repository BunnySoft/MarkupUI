export { Popover } from "./popover-element.js"
export { PopoverTrigger, PopoverContent } from "./regions.js"
export { createPopover, createPopoverController } from "./popover.js"
export { createPopoverPositioner } from "./position.js"
export { popoverPlacements, popoverTriggers } from "./model.js"
export type { PopoverController, PopoverOptions } from "./popover.js"
export type { PopoverPlacement } from "./position.js"
export type { PopoverTriggerMode } from "./model.js"

import { Popover } from "./popover-element.js"
import { PopoverTrigger, PopoverContent } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerPopover(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Popover, PopoverTrigger, PopoverContent], registry)
}

if (typeof customElements !== "undefined") registerPopover()
