import { ViewElement } from "../../core/index.js"
import { menuModes } from "./model.js"
import type { MenuMode } from "./model.js"
import { MenuItem } from "./item.js"

/**
 * A navigation or action menu supporting vertical and horizontal layouts, keyboard navigation, and selection.
 * @region {"name":"items","accepts":["MenuItem","Submenu","MenuGroup","MenuDivider"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string","previous":"string"}}
 */
export class Menu extends ViewElement {
  public static readonly tag = "m-menu"
  public static get observedAttributes(): string[] {
    return ["value", "mode", "collapsed", "accordion"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mMenu = ""
    this.classList.add("m-menu")
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "menu")
    }
    this.addEventListener("m:select", this.handleSelect)
    this.addEventListener("keydown", this.handleKeyDown)
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.removeEventListener("m:select", this.handleSelect)
    this.removeEventListener("keydown", this.handleKeyDown)
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.isConnected) {
      this.synchronize()
    }
  }

  public get value(): string | null {
    return this.getAttribute("value")
  }
  public set value(val: string | null) {
    this.setStringAttribute("value", val)
    this.updateSelected(val)
  }

  public get mode(): MenuMode {
    return this.choiceAttribute("mode", menuModes, "vertical")
  }
  public set mode(val: MenuMode) {
    this.setChoiceAttribute("mode", val, menuModes)
  }

  public get collapsed(): boolean {
    return this.hasAttribute("collapsed")
  }
  public set collapsed(val: boolean) {
    this.setBooleanAttribute("collapsed", val)
  }

  public get accordion(): boolean {
    return this.hasAttribute("accordion")
  }
  public set accordion(val: boolean) {
    this.setBooleanAttribute("accordion", val)
  }

  public get items(): readonly MenuItem[] {
    return Object.freeze(
      [...this.querySelectorAll<MenuItem>(":scope > m-menu-item, :scope > [data-part='menu-item'], :scope > [role='menuitem']")]
    )
  }

  private updateSelected(val: string | null): void {
    const items = this.querySelectorAll<MenuItem>(":scope > m-menu-item, :scope [role=menuitem]")
    items.forEach((item) => {
      const match = val !== null && (item.value === val || item.getAttribute("value") === val)
      item.toggleAttribute("selected", match)
    })
  }

  private readonly handleSelect = (event: Event): void => {
    const detail = (event as CustomEvent).detail
    const targetValue = typeof detail === "string" ? detail : (detail as { value?: string })?.value ?? ""
    const previous = this.value
    this.value = targetValue
    this.dispatchEvent(
      new CustomEvent("m:change", {
        bubbles: true,
        cancelable: false,
        detail: { value: targetValue, previous },
      })
    )
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        cancelable: false,
        detail: targetValue,
      })
    )
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const items = [...this.querySelectorAll<HTMLElement>(":scope > m-menu-item:not([disabled]), :scope > [role=menuitem]:not([disabled])")]
    if (items.length === 0) return

    const activeIndex = items.findIndex(item => item === document.activeElement || item.contains(document.activeElement))
    let targetIndex = activeIndex

    const isHorizontal = this.mode === "horizontal"
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown"
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp"

    if (event.key === nextKey || event.key === "ArrowDown") {
      targetIndex = (activeIndex + 1) % items.length
    } else if (event.key === prevKey || event.key === "ArrowUp") {
      targetIndex = (activeIndex - 1 + items.length) % items.length
    } else if (event.key === "Home") {
      targetIndex = 0
    } else if (event.key === "End") {
      targetIndex = items.length - 1
    } else {
      return
    }

    event.preventDefault()
    items[targetIndex]?.focus()
  }

  private synchronize(): void {
    this.dataset.menuMode = this.mode
    this.classList.toggle("m-menu--collapsed", this.collapsed)
    const val = this.getAttribute("value")
    if (val !== null) {
      this.updateSelected(val)
    }
  }
}
