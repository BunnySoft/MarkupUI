export { Skeleton, MSkeleton, skeletonSizes } from "./skeleton.js"
export type { SkeletonPresetSize, SkeletonSize, SkeletonValidationError } from "./model.js"

import { Skeleton } from "./skeleton.js"
import { ViewElement } from "../../core/index.js"

export function registerSkeleton(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Skeleton], registry)
}

if (typeof customElements !== "undefined") registerSkeleton()
