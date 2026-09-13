export { Badge, MBadge } from "./badge.js"
export type { BadgePlacement, BadgeType } from "./model.js"

import { Badge } from "./badge.js"
import { ViewElement } from "../../core/index.js"

export function registerBadge(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Badge], registry)
}

if (typeof customElements !== "undefined") registerBadge()
