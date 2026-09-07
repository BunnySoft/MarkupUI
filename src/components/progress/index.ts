export { MuiProgress } from "./progress.js"
export type { ProgressColor, ProgressGradient, ProgressPaint } from "./values.js"
import { MuiProgress } from "./progress.js"

export function registerProgress(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  const existing = registry.get("mui-progress")
  if (existing && existing !== MuiProgress) {
    throw new Error("'mui-progress' is already defined. Load the Progress component before the legacy MarkupUI bundle.")
  }
  if (!existing) registry.define("mui-progress", MuiProgress)
}

if (typeof customElements !== "undefined") registerProgress()
