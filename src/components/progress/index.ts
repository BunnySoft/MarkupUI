export { MProgress } from "./progress.js"
export type { ProgressColor, ProgressGradient, ProgressPaint } from "./values.js"
import { MProgress } from "./progress.js"

export function registerProgress(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("m-progress")
  if (existing && existing !== MProgress) {
    throw new Error("'m-progress' is already defined. Load the Progress component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("m-progress", MProgress)
}

if (typeof customElements !== "undefined") registerProgress()
