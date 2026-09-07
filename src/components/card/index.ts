export { MuiCard } from "./card.js"
export type { CardCloseDetail } from "./card.js"

import { MuiCard } from "./card.js"

export function registerCard(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-card")
  if (existing && existing !== MuiCard) {
    throw new Error("'mui-card' is already defined. Load the Card component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-card", MuiCard)
}

if (typeof customElements !== "undefined") registerCard()
