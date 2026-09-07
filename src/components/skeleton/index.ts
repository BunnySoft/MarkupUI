export { MuiSkeleton } from "./skeleton.js"
export type { SkeletonValidationError } from "./skeleton.js"
import { MuiSkeleton } from "./skeleton.js"

export function registerSkeleton(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-skeleton")
  if (existing && existing !== MuiSkeleton) {
    throw new Error("'mui-skeleton' is already defined. Load the Skeleton component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-skeleton", MuiSkeleton)
}

if (typeof customElements !== "undefined") registerSkeleton()
