export { Switch } from "./switch.js"
export type { SwitchSize, SwitchStatus } from "./switch.js"

import { ViewElement } from "../../core/index.js"
import { Switch } from "./switch.js"
export function registerSwitch(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Switch], registry)
}
if (typeof customElements !== "undefined") registerSwitch()
