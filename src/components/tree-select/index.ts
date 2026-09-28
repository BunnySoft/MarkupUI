export { TreeSelect } from "./tree-select-element.js"
export type { TreeSelectItem, TreeSelectSettings, TreeSelectState, TreeSelectValue } from "./tree-select.js"

import { TreeSelect } from "./tree-select-element.js"
import { ViewElement } from "../../core/index.js"

export function registerTreeSelect(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([TreeSelect], registry)
}

if (typeof customElements !== "undefined") registerTreeSelect()

