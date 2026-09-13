import { ViewElement } from "../../core/index.js"

/**
 * An individual interactive option within a Menu.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 * @event {"name":"Select","web":"m:select","bubbles":true,"cancelable":true,"composed":false,"detail":{"value":"string"}}
 */
export class MenuItem extends ViewElement {
  public static readonly tag = "m-menu-item"
  public static get observedAttributes(): string[] {
    return ["value", "disabled", "selected", "href"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "menu-item"
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "menuitem")
    }
    this.tabIndex = this.disabled ? -1 : 0
    this.addEventListener("click", this.handleClick)
    this.addEventListener("keydown", this.handleKeyDown)
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
    this.removeEventListener("keydown", this.handleKeyDown)
  }

  public attributeChangedCallback(name: string): void {
    if (name === "disabled") {
      this.tabIndex = this.disabled ? -1 : 0
    }
  }

  public get value(): string {
    return this.getAttribute("value") ?? this.textContent?.trim() ?? ""
  }
  public set value(val: string) {
    this.setAttribute("value", val)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(val: boolean) {
    this.setBooleanAttribute("disabled", val)
  }

  public get selected(): boolean {
    return this.hasAttribute("selected")
  }
  public set selected(val: boolean) {
    this.setBooleanAttribute("selected", val)
  }

  public get href(): string | null {
    return this.getAttribute("href")
  }
  public set href(val: string | null) {
    this.setStringAttribute("href", val)
  }

  public select(): void {
    if (this.disabled) return
    const val = this.value
    this.dispatchEvent(
      new CustomEvent("m:select", {
        bubbles: true,
        cancelable: true,
        composed: false,
        detail: val,
      })
    )
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault()
      return
    }
    this.select()
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      this.select()
    }
  }
}

/**
 * A group header organizing related menu items.
 * @region {"name":"content","accepts":["MenuItem","MenuDivider"],"min":0,"max":null}
 */
export class MenuGroup extends ViewElement {
  public static readonly tag = "m-menu-group"
  public static get observedAttributes(): string[] {
    return ["title"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "menu-group"
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group")
    }
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(val: string) {
    this.setAttribute("title", val)
  }
}

/**
 * A visual separator between menu sections or items.
 */
export class MenuDivider extends ViewElement {
  public static readonly tag = "m-menu-divider"

  public connectedCallback(): void {
    this.dataset.part = "menu-divider"
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "separator")
    }
  }
}

/**
 * A collapsible branch containing child menu items.
 * @region {"name":"content","accepts":["MenuItem","MenuGroup","MenuDivider","Submenu"],"min":0,"max":null}
 */
export class Submenu extends ViewElement {
  public static readonly tag = "m-submenu"
  public static get observedAttributes(): string[] {
    return ["title", "name", "disabled"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "submenu"
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(val: string) {
    this.setAttribute("title", val)
  }

  public get name(): string {
    return this.getAttribute("name") ?? ""
  }
  public set name(val: string) {
    this.setAttribute("name", val)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(val: boolean) {
    this.setBooleanAttribute("disabled", val)
  }
}
