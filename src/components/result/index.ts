export { Result, MResult } from "./result.js"
export { ResultHeader, ResultContent, ResultFooter } from "./regions.js"
export { resultStatuses } from "./model.js"
export type { ResultStatus } from "./model.js"

import { Result } from "./result.js"
import { ResultHeader, ResultContent, ResultFooter } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerResult(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Result, ResultHeader, ResultContent, ResultFooter], registry)
}

if (typeof customElements !== "undefined") registerResult()
