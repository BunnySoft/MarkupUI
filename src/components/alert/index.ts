export { MuiAlert } from "./alert.js"
export type { AlertCloseDetail } from "./alert.js"
import { MuiAlert } from "./alert.js"

export function registerAlert(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-alert")
  if (existing && existing !== MuiAlert) {
    throw new Error("'mui-alert' is already defined. Load the Alert component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-alert", MuiAlert)
}

if (typeof customElements !== "undefined") registerAlert()
