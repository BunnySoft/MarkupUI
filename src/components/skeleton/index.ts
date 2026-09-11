export { MSkeleton } from "./skeleton.js"
export type { SkeletonValidationError } from "./skeleton.js"
import { MSkeleton } from "./skeleton.js"

export function registerSkeleton(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-skeleton")
  if (existing && existing !== MSkeleton) {
    throw new Error("'m-skeleton' is already defined. Load the Skeleton component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-skeleton", MSkeleton)
}

if (typeof customElements !== "undefined") registerSkeleton()
