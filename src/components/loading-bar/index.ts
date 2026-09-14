export { LoadingBar, MLoadingBar, loadingBarStatuses } from "./loading-bar-element.js"
export type { LoadingBarStatus, LoadingBarChangeDetail } from "./loading-bar-element.js"
export { loadingBar } from "./service.js"
export { createLoadingBar } from "./loading-bar.js"
export type { LoadingBarController, LoadingBarOptions, LoadingBarState } from "./loading-bar.js"

import { LoadingBar } from "./loading-bar-element.js"
import { ViewElement } from "../../core/index.js"

export function registerLoadingBar(
  registry: Pick<CustomElementRegistry, "get" | "define"> = customElements,
): void {
  ViewElement.register([LoadingBar], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(LoadingBar.tag)) registerLoadingBar()

