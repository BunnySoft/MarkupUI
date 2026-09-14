export { Ellipsis, MEllipsis } from "./ellipsis.js"
export { expandTriggers } from "./model.js"
export type { ExpandTrigger } from "./model.js"

import { Ellipsis } from "./ellipsis.js"
import { ViewElement } from "../../core/index.js"

export function registerEllipsis(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Ellipsis], registry)
}

if (typeof customElements !== "undefined") registerEllipsis()
