export { VirtualList } from "./virtual-list-element.js"
export { createVirtualList } from "./virtual-list.js"
export type { VirtualListContext, VirtualListController, VirtualListKey, VirtualListOptions, VirtualListScrollOptions, VirtualListState } from "./virtual-list.js"
export { MAX_VIRTUAL_PIXELS, MAX_VIRTUAL_ROWS, MAX_VIEWPORT_HEIGHT, virtualWindow } from "./window.js"

import { ViewElement } from "../../core/index.js"
import { VirtualList } from "./virtual-list-element.js"

export function registerVirtualList(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([VirtualList], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(VirtualList.tag)) registerVirtualList()

