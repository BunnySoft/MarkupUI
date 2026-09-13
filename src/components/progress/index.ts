export { Progress, MProgress } from "./progress.js"
export { progressIndicatorPlacements, progressStatuses, progressTypes } from "./model.js"
export type { ProgressIndicatorPlacement, ProgressStatus, ProgressType } from "./model.js"
export type { ProgressColor, ProgressGradient, ProgressPaint } from "./values.js"

import { Progress } from "./progress.js"
import { ViewElement } from "../../core/index.js"

export function registerProgress(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Progress], registry)
}

export function createProgress(options: Partial<Progress> = {}): Progress {
  const element = document.createElement("m-progress") as Progress
  Object.assign(element, options)
  return element
}

if (typeof customElements !== "undefined") registerProgress()

