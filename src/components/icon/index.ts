export { Icon, IconWrapper } from "./icon.js"

import { ViewElement } from "../../core/index.js"
import { Icon, IconWrapper } from "./icon.js"

export function registerIcon(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Icon, IconWrapper], registry)
}

if (typeof customElements !== "undefined") registerIcon()
