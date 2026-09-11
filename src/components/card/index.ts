export { MCard } from "./card.js"
export type { CardCloseDetail } from "./card.js"

import { MCard } from "./card.js"

export function registerCard(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-card")
  if (existing && existing !== MCard) {
    throw new Error("'m-card' is already defined. Load the Card component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-card", MCard)
}

if (typeof customElements !== "undefined") registerCard()
