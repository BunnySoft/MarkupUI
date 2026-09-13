export { Tabs } from "./tabs-element.js"
export { Tab, TabPane } from "./pane.js"
export { tabsPlacements, tabsTypes, tabsSizes, tabsActivations } from "./model.js"
export type { TabsPlacement, TabsType, TabsSize, TabsActivation, TabsChangeDetail, TabCloseDetail } from "./model.js"
export { createTabs } from "./tabs.js"
export type { TabsController, TabsOptions, TabsGuard, TabsChange } from "./tabs.js"

import { Tabs } from "./tabs-element.js"
import { Tab, TabPane } from "./pane.js"
import { ViewElement } from "../../core/index.js"

export function registerTabs(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Tabs, Tab, TabPane], registry)
}

if (typeof customElements !== "undefined") registerTabs()

