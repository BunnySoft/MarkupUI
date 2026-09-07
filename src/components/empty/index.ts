export { MuiEmpty } from "./empty.js"
import { MuiEmpty } from "./empty.js"

export function registerEmpty(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-empty")
  if (existing && existing !== MuiEmpty) {
    throw new Error("'mui-empty' is already defined. Load the Empty component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-empty", MuiEmpty)
}

if (typeof customElements !== "undefined") registerEmpty()
