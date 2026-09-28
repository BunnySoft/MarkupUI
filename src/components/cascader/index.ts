export { Cascader } from "./cascader-element.js"
export type { CascaderItem, CascaderLoadResult, CascaderLoader } from "./cascader-element.js"
export type { CascaderState } from "./cascader.js"

import { Cascader } from "./cascader-element.js"
import { ViewElement } from "../../core/index.js"

export function registerCascader(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Cascader], registry)
}

if (typeof customElements !== "undefined") registerCascader()

