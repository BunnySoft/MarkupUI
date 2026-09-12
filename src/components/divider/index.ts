export { Divider } from "./divider.js"
export type { DividerOrientation, DividerTitlePlacement } from "./divider.js"

import { ViewElement } from "../../core/index.js"
import { Divider } from "./divider.js"

export function registerDivider(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Divider], registry)
}

if (typeof customElements !== "undefined") registerDivider()
