export { Pagination } from "./pagination-element.js"
export { createPagination } from "./pagination.js"
export { paginationState, pageWindow } from "./model.js"
export type { PaginationOptions, PaginationController, PaginationChange, PaginationSource } from "./pagination.js"
export type { PaginationState, PaginationValues } from "./model.js"

import { Pagination } from "./pagination-element.js"
import { ViewElement } from "../../core/index.js"

export function registerPagination(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Pagination], registry)
}

if (typeof customElements !== "undefined") registerPagination()

