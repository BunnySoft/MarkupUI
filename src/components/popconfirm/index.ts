export { Popconfirm } from "./popconfirm-element.js"
export { PopconfirmTrigger, PopconfirmPanel } from "./regions.js"
export { createPopconfirm } from "./popconfirm.js"
export type { PopconfirmController, PopconfirmOptions, PopconfirmCallback, PopconfirmAction, PopconfirmError } from "./popconfirm.js"
export type { PopoverPlacement as PopconfirmPlacement } from "../popover/position.js"
export type { PopconfirmClickDetail } from "./popconfirm-element.js"

import { Popconfirm } from "./popconfirm-element.js"
import { PopconfirmTrigger, PopconfirmPanel } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerPopconfirm(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Popconfirm, PopconfirmTrigger, PopconfirmPanel], registry)
}

if (typeof customElements !== "undefined") registerPopconfirm()

