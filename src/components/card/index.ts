export { MCard } from "./card.js"
export type { CardCloseDetail } from "./card.js"
export {
  MCardAction,
  MCardContent,
  MCardCover,
  MCardFooter,
  MCardHeader,
  MCardHeaderExtra,
} from "./regions.js"
export {
  cardActionDefinition,
  cardContentDefinition,
  cardCoverDefinition,
  cardDefinition,
  cardFooterDefinition,
  cardHeaderDefinition,
  cardHeaderExtraDefinition,
} from "./model.js"

import { MCard } from "./card.js"
import {
  MCardAction,
  MCardContent,
  MCardCover,
  MCardFooter,
  MCardHeader,
  MCardHeaderExtra,
} from "./regions.js"

const definitions: ReadonlyArray<readonly [string, CustomElementConstructor]> = [
  ["m-card", MCard],
  ["m-card-cover", MCardCover],
  ["m-card-header", MCardHeader],
  ["m-card-header-extra", MCardHeaderExtra],
  ["m-card-content", MCardContent],
  ["m-card-footer", MCardFooter],
  ["m-card-action", MCardAction],
]

export function registerCard(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  for (const [name, constructor] of definitions) {
    const existing = registry.get(name)
    if (existing && existing !== constructor) {
      throw new Error(`'${name}' is already defined. Load the Card component before the legacy MarkupUI bundle.`)
    }
  }
  for (const [name, constructor] of definitions) {
    if (!registry.get(name)) {
      registry.define(name, constructor)
    }
  }
}

if (typeof customElements !== "undefined") registerCard()
