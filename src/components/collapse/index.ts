export { Collapse, CollapseItem } from "./collapse.js"
export { CollapseHeader, CollapseHeaderExtra, CollapseContent } from "./regions.js"
export type { CollapseHeaderActivatedDetail, CollapseExpandedChangedDetail, CollapseErrorDetail } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Collapse, CollapseItem } from "./collapse.js"
import { CollapseHeader, CollapseHeaderExtra, CollapseContent } from "./regions.js"

export function registerCollapse(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([CollapseHeader, CollapseHeaderExtra, CollapseContent, CollapseItem, Collapse], registry)
}

if (typeof customElements !== "undefined") registerCollapse()
