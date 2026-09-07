export { MuiTag } from "./tag.js"
export type { TagCloseDetail } from "./tag.js"
import { MuiTag } from "./tag.js"

export function registerTag(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-tag")
  if (existing && existing !== MuiTag) {
    throw new Error("'mui-tag' is already defined. Load the Tag component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-tag", MuiTag)
}

if (typeof customElements !== "undefined") registerTag()
