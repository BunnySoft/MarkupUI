export { Layout } from "./layout.js"
export { LayoutHeader, LayoutContent, LayoutFooter, LayoutSider } from "./regions.js"
export { isLayoutElement, layoutPositions, siderSides } from "./model.js"
export type { LayoutPosition, LayoutSide } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Layout } from "./layout.js"
import { LayoutHeader, LayoutContent, LayoutFooter, LayoutSider } from "./regions.js"

export function registerLayout(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Layout, LayoutHeader, LayoutContent, LayoutFooter, LayoutSider], registry)
}

if (typeof customElements !== "undefined") registerLayout()
