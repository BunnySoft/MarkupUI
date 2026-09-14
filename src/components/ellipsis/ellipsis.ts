import { ViewElement } from "../../core/index.js"
import { expandTriggers } from "./model.js"
import type { ExpandTrigger } from "./model.js"

export { expandTriggers } from "./model.js"
export type { ExpandTrigger } from "./model.js"

/**
 * Text container with native CSS ellipsis truncation and line-clamping.
 * @region {"name":"content","accepts":["phrasing content"],"min":0,"max":null}
 */
export class Ellipsis extends ViewElement {
  public static readonly tag = "m-ellipsis"
  public static get observedAttributes(): string[] {
    return ["line-clamp", "expand-trigger", "tooltip", "expanded"]
  }

  private observer: MutationObserver | undefined
  private upgraded = false
  private managedTitle: string | null = null
  private managedTabindex = false
  private managedRole = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mEllipsis = ""
    this.addEventListener("click", this.handleClick)
    this.addEventListener("keydown", this.handleKeyDown)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
    this.removeEventListener("keydown", this.handleKeyDown)
    this.observer?.disconnect()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  /**
   * @min 1
   * @integer
   */
  public get lineClamp(): number | null {
    const value = this.numberAttribute("line-clamp", null)
    if (value !== null && (!Number.isSafeInteger(value) || value < 1)) throw new RangeError("Invalid line-clamp.")
    return value
  }
  public set lineClamp(value: number | null) {
    if (value !== null && (!Number.isSafeInteger(value) || value < 1)) throw new RangeError("Invalid line-clamp.")
    if (value === null) this.removeAttribute("line-clamp")
    else this.setAttribute("line-clamp", String(value))
  }

  public get expandTrigger(): ExpandTrigger | null {
    return this.choiceAttribute("expand-trigger", expandTriggers, null)
  }
  public set expandTrigger(value: ExpandTrigger | null) {
    this.setNullableChoiceAttribute("expand-trigger", value, expandTriggers)
  }

  public get tooltip(): boolean {
    return this.hasAttribute("tooltip")
  }
  public set tooltip(value: boolean) {
    this.setBooleanAttribute("tooltip", value)
  }

  public get expanded(): boolean {
    return this.hasAttribute("expanded")
  }
  public set expanded(value: boolean) {
    this.setBooleanAttribute("expanded", value)
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.expandTrigger !== "click") return
    const target = event.target as HTMLElement | null
    if (target && target !== this && target.closest("a, button, input, select, textarea, [contenteditable]")) return
    this.expanded = !this.expanded
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (this.expandTrigger !== "click") return
    if (event.key === "Enter" || event.key === " ") {
      const target = event.target as HTMLElement | null
      if (target && target !== this && target.closest("a, button, input, select, textarea, [contenteditable]")) return
      event.preventDefault()
      this.expanded = !this.expanded
    }
  }

  private synchronize(): void {
    this.observer?.disconnect()

    const lineClamp = this.lineClamp
    if (lineClamp !== null && !this.expanded) {
      this.style.setProperty("--m-ellipsis-lines", String(lineClamp))
    } else {
      this.style.removeProperty("--m-ellipsis-lines")
    }

    if (this.tooltip) {
      if (!this.hasAttribute("title") || this.getAttribute("title") === this.managedTitle) {
        const text = this.textContent?.trim() ?? ""
        if (text) {
          this.setAttribute("title", text)
          this.managedTitle = text
        }
      }
    } else if (this.managedTitle !== null) {
      if (this.getAttribute("title") === this.managedTitle) {
        this.removeAttribute("title")
      }
      this.managedTitle = null
    }

    if (this.expandTrigger === "click") {
      if (!this.closest("summary, button, a")) {
        if (!this.hasAttribute("tabindex")) {
          this.setAttribute("tabindex", "0")
          this.managedTabindex = true
        }
        if (!this.hasAttribute("role")) {
          this.setAttribute("role", "button")
          this.managedRole = true
        }
      }
      this.setAttribute("aria-expanded", String(this.expanded))
    } else {
      if (this.managedTabindex) {
        this.removeAttribute("tabindex")
        this.managedTabindex = false
      }
      if (this.managedRole) {
        this.removeAttribute("role")
        this.managedRole = false
      }
      this.removeAttribute("aria-expanded")
    }

    if (this.isConnected) {
      this.observer?.observe(this, { childList: true, subtree: true, characterData: true })
    }
  }
}

export { Ellipsis as MEllipsis }
