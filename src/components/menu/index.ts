export { Menu } from "./menu-element.js"
export { MenuItem, MenuGroup, MenuDivider, Submenu } from "./item.js"
export { menuModes } from "./model.js"
export type { MenuMode, MenuSelectDetail, MenuChangeDetail } from "./model.js"
export { createMenu } from "./menu.js"
export type { MenuController, MenuOptions, MenuSelection } from "./menu.js"

import { Menu } from "./menu-element.js"
import { MenuItem, MenuGroup, MenuDivider, Submenu } from "./item.js"
import { ViewElement } from "../../core/index.js"

export function registerMenu(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Menu, MenuItem, MenuGroup, MenuDivider, Submenu], registry)
}

if (typeof customElements !== "undefined") registerMenu()

