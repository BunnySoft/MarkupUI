export { Space } from "./space.js"
export type { SpaceAlign, SpaceJustify, SpaceSize } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Space } from "./space.js"

export function registerSpace(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Space], registry)
}

if (typeof customElements !== "undefined") registerSpace()
