export { Cascader, cascaderExpandTriggers } from "./cascader-element.js"
export type { CascaderExpandTrigger } from "./cascader-element.js"
export { createCascader } from "./cascader.js"
export type { CascaderOptions, CascaderController, CascaderState } from "./cascader.js"

import { Cascader } from "./cascader-element.js"
import { ViewElement } from "../../core/index.js"

export function registerCascader(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Cascader], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Cascader.tag)) registerCascader()

