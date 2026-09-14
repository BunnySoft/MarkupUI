export { Code, MCode } from "./code.js"

import { Code } from "./code.js"
import { ViewElement } from "../../core/index.js"

export function registerCode(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Code], registry)
}

if (typeof customElements !== "undefined") registerCode()
