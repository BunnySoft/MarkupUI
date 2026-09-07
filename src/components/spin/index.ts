export { MuiSpin } from "./spin.js"
export type { SpinValidationError } from "./spin.js"
import { MuiSpin } from "./spin.js"

export function registerSpin(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-spin")
  if (existing && existing !== MuiSpin) {
    throw new Error("'mui-spin' is already defined. Load the Spin component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-spin", MuiSpin)
}

if (typeof customElements !== "undefined") registerSpin()
