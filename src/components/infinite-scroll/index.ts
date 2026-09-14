export { InfiniteScroll, MInfiniteScroll } from "./infinite-scroll-element.js"
export type { InfiniteScrollLoadDetail } from "./infinite-scroll-element.js"
export { createInfiniteScroll } from "./infinite-scroll.js"
export type {
  InfiniteScrollSettings,
  InfiniteScrollOptions,
  InfiniteScrollContext,
  InfiniteScrollResult,
  InfiniteScrollOutcome,
  InfiniteScrollState,
  InfiniteScrollPhase,
  InfiniteScrollController,
} from "./infinite-scroll.js"

import { InfiniteScroll } from "./infinite-scroll-element.js"
import { ViewElement } from "../../core/index.js"

export function registerInfiniteScroll(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([InfiniteScroll], registry)
}

if (typeof customElements !== "undefined") registerInfiniteScroll()

