export { MuiBadge } from "./badge.js"
import { MuiBadge } from "./badge.js"

export function registerBadge(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-badge")
  if (existing && existing !== MuiBadge) {
    throw new Error("'mui-badge' is already defined. Load the Badge component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-badge", MuiBadge)
}

if (typeof customElements !== "undefined") registerBadge()
