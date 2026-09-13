export { Descriptions, MDescriptions } from "./descriptions.js"
export { DescriptionItem, MDescriptionItem } from "./item.js"
export type { DescriptionsLabelPlacement, DescriptionsSize } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Descriptions } from "./descriptions.js"
import { DescriptionItem } from "./item.js"

export function registerDescriptions(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Descriptions, DescriptionItem], registry)
}

if (typeof customElements !== "undefined") registerDescriptions()
