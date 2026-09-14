export { CollapseTransition, MCollapseTransition } from "./collapse-transition-element.js"
export { createCollapseTransition } from "./collapse-transition.js"
export type { CollapseTransitionController, CollapseTransitionError, CollapseTransitionHook, CollapseTransitionHookEvent, CollapseTransitionOptions, CollapseTransitionState } from "./collapse-transition.js"

import { CollapseTransition } from "./collapse-transition-element.js"
import { ViewElement } from "../../core/index.js"

export function registerCollapseTransition(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([CollapseTransition], registry)
}

if (typeof customElements !== "undefined") registerCollapseTransition()

