export { Popselect } from "./popselect-element.js"
export { PopselectTrigger, PopselectPanel } from "./regions.js"
export { createPopselect } from "./popselect.js"
export type { PopselectOptions, PopselectController } from "./popselect.js"
export type { SelectValue } from "../select/index.js"
export type { PopoverPlacement as PopselectPlacement } from "../popover/position.js"

import { Popselect } from "./popselect-element.js"
import { PopselectTrigger, PopselectPanel } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerPopselect(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Popselect, PopselectTrigger, PopselectPanel], registry)
}

if (typeof customElements !== "undefined") registerPopselect()

