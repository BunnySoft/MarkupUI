export { createAnchor } from "./anchor.js"
export type { AnchorController, AnchorOptions, AnchorIssue, AnchorLocation } from "./anchor.js"
export type { NativeScrollRoot, NativeScrollBehavior } from "./scroll.js"
export { Anchor } from "./anchor-element.js"
export { AnchorLink } from "./link.js"

import { Anchor } from "./anchor-element.js"
import { AnchorLink } from "./link.js"
import { ViewElement } from "../../core/index.js"

export function registerAnchor(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Anchor, AnchorLink], registry)
}

if (typeof customElements !== "undefined") registerAnchor()

