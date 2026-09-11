export { MEmpty } from "./empty.js"
import { MEmpty } from "./empty.js"

export function registerEmpty(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-empty")
  if (existing && existing !== MEmpty) {
    throw new Error("'m-empty' is already defined. Load the Empty component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-empty", MEmpty)
}

if (typeof customElements !== "undefined") registerEmpty()
