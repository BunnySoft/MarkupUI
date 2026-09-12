import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownGroup, DropdownDivider, registerDropdown } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUIDropdown?: typeof import("./index.js") }
if (target.MarkupUIDropdown !== undefined) throw new Error("MarkupUIDropdown is already defined.")
target.MarkupUIDropdown = { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownGroup, DropdownDivider, registerDropdown }
