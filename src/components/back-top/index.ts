export { BackTop, MBackTop } from "./back-top-element.js"
export { createBackTop } from "./back-top.js"
export type { BackTopController, BackTopOptions } from "./back-top.js"
export type { NativeScrollRoot, NativeScrollBehavior } from "../anchor/scroll.js"

import { BackTop } from "./back-top-element.js"
import { ViewElement } from "../../core/index.js"

export function registerBackTop(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([BackTop], registry)
}

if (typeof customElements !== "undefined") registerBackTop()

