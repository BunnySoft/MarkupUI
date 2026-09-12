export { Dropdown } from "./dropdown.js"
export { DropdownTrigger, DropdownMenu, DropdownItem, DropdownGroup, DropdownDivider } from "./regions.js"
export type { DropdownPlacement, DropdownSize, DropdownSelectionDetail, DropdownOpenChangedDetail, DropdownOpenReason, DropdownErrorDetail } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Dropdown } from "./dropdown.js"
import { DropdownTrigger, DropdownMenu, DropdownItem, DropdownGroup, DropdownDivider } from "./regions.js"

export function registerDropdown(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([DropdownTrigger, DropdownMenu, DropdownItem, DropdownGroup, DropdownDivider, Dropdown], registry)
}

if (typeof customElements !== "undefined") registerDropdown()
