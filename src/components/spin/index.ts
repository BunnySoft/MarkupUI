export { MSpin } from "./spin.js"
export type { SpinValidationError } from "./spin.js"
import { MSpin } from "./spin.js"

export function registerSpin(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-spin")
  if (existing && existing !== MSpin) {
    throw new Error("'m-spin' is already defined. Load the Spin component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-spin", MSpin)
}

if (typeof customElements !== "undefined") registerSpin()
