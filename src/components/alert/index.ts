export { Alert, MAlert } from "./alert.js"
export type { AlertCloseDetail, AlertType } from "./model.js"
export { alertTypes } from "./model.js"

import { Alert } from "./alert.js"
import { ViewElement } from "../../core/index.js"

export function registerAlert(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Alert], registry)
}

if (typeof customElements !== "undefined") registerAlert()
