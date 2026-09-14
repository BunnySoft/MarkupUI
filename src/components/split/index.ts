export { Split } from "./split-element.js"
export { SplitPane } from "./split-pane.js"
export { splitDirections } from "./model.js"
export type { SplitDirection, SplitChangeDetail, SplitSize } from "./model.js"
export { createSplit } from "./split.js"
export type { SplitOptions, SplitValues, SplitState, SplitController, SplitChange, SplitDrag } from "./split.js"

import { Split } from "./split-element.js"
import { SplitPane } from "./split-pane.js"
import { ViewElement } from "../../core/index.js"

export function registerSplit(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Split, SplitPane], registry)
}

if (typeof customElements !== "undefined") registerSplit()

