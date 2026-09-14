export { Affix, MAffix } from "./affix.js"
export type { AffixChangeDetail } from "./model.js"

import { Affix } from "./affix.js"
import { ViewElement } from "../../core/index.js"

export function registerAffix(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Affix as unknown as CustomElementConstructor & { readonly tag: string }], registry)
}

if (typeof customElements !== "undefined") registerAffix()
