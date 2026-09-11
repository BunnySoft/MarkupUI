export { MAlert } from "./alert.js"
export type { AlertCloseDetail } from "./alert.js"
import { MAlert } from "./alert.js"

export function registerAlert(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-alert")
  if (existing && existing !== MAlert) {
    throw new Error("'m-alert' is already defined. Load the Alert component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-alert", MAlert)
}

if (typeof customElements !== "undefined") registerAlert()
