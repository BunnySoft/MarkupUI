export { Breadcrumb } from "./breadcrumb.js"
export { BreadcrumbItem } from "./item.js"
export { DEFAULT_BREADCRUMB_SEPARATOR } from "./model.js"
export type { BreadcrumbItemOptions } from "./model.js"

import { Breadcrumb } from "./breadcrumb.js"
import { BreadcrumbItem } from "./item.js"
import { ViewElement } from "../../core/index.js"

export function registerBreadcrumb(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Breadcrumb, BreadcrumbItem], registry)
}

if (typeof customElements !== "undefined") registerBreadcrumb()
