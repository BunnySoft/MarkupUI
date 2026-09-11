export { MTag } from "./tag.js"
export type { TagCloseDetail } from "./tag.js"
import { MTag } from "./tag.js"

export function registerTag(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-tag")
  if (existing && existing !== MTag) {
    throw new Error("'m-tag' is already defined. Load the Tag component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-tag", MTag)
}

if (typeof customElements !== "undefined") registerTag()
