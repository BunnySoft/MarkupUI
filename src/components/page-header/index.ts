export { PageHeader, MPageHeader } from "./page-header.js"
export type { PageHeaderBackDetail, PageHeaderRegion } from "./model.js"
export { pageHeaderRegions, isPageHeaderElement } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { PageHeader } from "./page-header.js"

export function registerPageHeader(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([PageHeader], registry)
}

if (typeof customElements !== "undefined") registerPageHeader()
