import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { dropdownSizes } from "./model.js"
import type { DropdownSize } from "./model.js"

const itemWrites = new WeakMap<DropdownItem, ReturnType<typeof ownedWrites>>()
const groupLabels = new WeakMap<DropdownGroup, HTMLSpanElement>()

export function prepareMenuSurface(menu: DropdownMenu): void {
  menu.dataset.part = "menu"
  menu.classList.add("m-popover")
  menu.classList.toggle("m-popover--arrow", menu.arrow)
  menu.classList.toggle("m-popover--animated", menu.animated)
}

export function prepareItem(item: DropdownItem): HTMLElement | undefined {
  let writes = itemWrites.get(item)
  if (!writes) { writes = ownedWrites(); itemWrites.set(item, writes) }
  writes.restore()
  const actions = [...item.children].filter((node): node is HTMLButtonElement | HTMLAnchorElement => node instanceof HTMLButtonElement || node instanceof HTMLAnchorElement)
  if (actions.length !== 1) return undefined
  const action = actions[0]!
  writes.attr(action, "data-part", "action")
  if (item.label !== null) writes.attr(action, "aria-label", item.label)
  if (item.disabled) {
    if (action instanceof HTMLButtonElement) writes.attr(action, "disabled", "")
    else {
      writes.attr(action, "href", null)
      writes.attr(action, "aria-disabled", "true")
      writes.attr(action, "tabindex", "-1")
    }
  }
  return action
}

export function prepareGroup(group: DropdownGroup): HTMLElement | undefined {
  let label = groupLabels.get(group)
  if (group.label === null) { label?.remove(); return undefined }
  if (!label) {
    label = group.ownerDocument.createElement("span")
    label.dataset.part = "group-label"
    label.setAttribute("aria-hidden", "true")
    groupLabels.set(group, label)
  }
  if (label.textContent !== group.label) label.textContent = group.label
  if (label.parentElement !== group) group.prepend(label)
  return label
}

export class DropdownTrigger extends ViewElement {
  public static readonly tag = "m-dropdown-trigger"
  public static readonly observedAttributes: string[] = []
}

/** @region {"name":"items","accepts":["DropdownItem","DropdownGroup","DropdownDivider","inert template"],"min":0,"max":null} */
export class DropdownMenu extends ViewElement {
  public static readonly tag = "m-dropdown-menu"
  public static readonly observedAttributes = ["arrow", "animated"]
  public connectedCallback(): void {
    this.upgradeProperties()
    prepareMenuSurface(this)
  }
  public attributeChangedCallback(): void { prepareMenuSurface(this) }
  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) {
    if (value !== null && (typeof value !== "string" || !value.trim())) throw new RangeError("Dropdown label must be nonempty or null.")
    this.setStringAttribute("label", value)
  }
  public get size(): DropdownSize | null { return this.choiceAttribute("size", dropdownSizes, null) }
  public set size(value: DropdownSize | null) { this.setNullableChoiceAttribute("size", value, dropdownSizes) }
  public get inverted(): boolean { return this.hasAttribute("inverted") }
  public set inverted(value: boolean) { this.setBooleanAttribute("inverted", value) }
  public get arrow(): boolean { return this.hasAttribute("arrow") }
  public set arrow(value: boolean) { this.setBooleanAttribute("arrow", value) }
  public get animated(): boolean { return this.hasAttribute("animated") }
  public set animated(value: boolean) { this.setBooleanAttribute("animated", value) }
}

/**
 * A passive wrapper around one native button or destination anchor.
 * @region {"name":"action","accepts":["native button","native anchor"],"min":1,"max":1}
 * @region {"name":"submenu","element":"m-dropdown-menu","accepts":["DropdownMenu"],"min":0,"max":1}
 * @states selected disabled
 */
export class DropdownItem extends ViewElement {
  public static readonly tag = "m-dropdown-item"
  public static readonly observedAttributes = ["disabled", "label"]
  public connectedCallback(): void {
    this.upgradeProperties()
    this.dataset.part = "item"
    this.addEventListener("click", this.blockDisabled, true)
  }
  public disconnectedCallback(): void {
    this.removeEventListener("click", this.blockDisabled, true)
    itemWrites.get(this)?.restore()
  }
  public attributeChangedCallback(): void { if (this.isConnected) prepareItem(this) }
  public get key(): string { return this.getAttribute("key") ?? "" }
  public set key(value: string) {
    if (typeof value !== "string" || !value.trim()) throw new RangeError("DropdownItem key must be nonempty.")
    const root = this.closest("m-dropdown")
    if (root && [...root.querySelectorAll("m-dropdown-item")].some(item => item !== this && item.closest("m-dropdown") === root && item.getAttribute("key") === value)) throw new RangeError("Dropdown item keys must be unique.")
    this.setStringAttribute("key", value)
  }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) {
    if (value !== null && (typeof value !== "string" || !value.trim())) throw new RangeError("Dropdown label must be nonempty or null.")
    this.setStringAttribute("label", value)
  }
  public get selected(): boolean { return this.matches('[data-state~="selected"]') }
  private readonly blockDisabled = (event: MouseEvent): void => {
    if (this.disabled && event.target instanceof Element && event.target.closest("button,a")?.parentElement === this) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
}

/** @region {"name":"items","accepts":["DropdownItem","DropdownGroup","DropdownDivider","inert template"],"min":0,"max":null} */
export class DropdownGroup extends ViewElement {
  public static readonly tag = "m-dropdown-group"
  public static readonly observedAttributes = ["label"]
  public connectedCallback(): void { this.upgradeProperties(); this.dataset.part = "group"; prepareGroup(this) }
  public attributeChangedCallback(): void { if (this.isConnected) prepareGroup(this) }
  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) {
    if (value !== null && (typeof value !== "string" || !value.trim())) throw new RangeError("Dropdown label must be nonempty or null.")
    this.setStringAttribute("label", value)
  }
}

export class DropdownDivider extends ViewElement {
  public static readonly tag = "m-dropdown-divider"
  public static readonly observedAttributes: string[] = []
  public connectedCallback(): void { this.dataset.part = "divider" }
}
