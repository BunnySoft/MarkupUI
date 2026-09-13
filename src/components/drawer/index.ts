export { Drawer } from "./drawer-element.js"
export { DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "./regions.js"
export { drawerPlacements } from "./model.js"
export type { DrawerCloseDetail, DrawerPlacement } from "./model.js"
export { createDrawer, createDrawerOwner } from "./drawer.js"
export type { DrawerController, DrawerOptions, DrawerOwner, DrawerTemplateOptions } from "./drawer.js"
export type { NativeDialogMode } from "../dialog/native.js"

import { Drawer } from "./drawer-element.js"
import { DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerDrawer(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter], registry)
}

if (typeof customElements !== "undefined") registerDrawer()

