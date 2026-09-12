export { Flex } from "./flex.js"
export type { FlexAlign, FlexJustify, FlexSize } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Flex } from "./flex.js"

export function registerFlex(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Flex], registry)
}

if (typeof customElements !== "undefined") registerFlex()
