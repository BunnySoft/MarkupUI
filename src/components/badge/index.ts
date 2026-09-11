export { MBadge } from "./badge.js"
import { MBadge } from "./badge.js"

export function registerBadge(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-badge")
  if (existing && existing !== MBadge) {
    throw new Error("'m-badge' is already defined. Load the Badge component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-badge", MBadge)
}

if (typeof customElements !== "undefined") registerBadge()
