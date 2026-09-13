export { Empty, MEmpty } from "./empty.js"
export { emptySizes } from "./model.js"
export type { EmptySize } from "./model.js"

import { Empty } from "./empty.js"
import { ViewElement } from "../../core/index.js"

export function registerEmpty(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Empty], registry)
}

if (typeof customElements !== "undefined") registerEmpty()
