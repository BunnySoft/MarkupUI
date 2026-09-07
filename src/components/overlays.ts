import { MuiElement } from "../core/element.js"
import { positionFloating, type FloatingPlacement } from "../core/position.js"

export abstract class MuiModal extends MuiElement {
  protected dialog?: HTMLDialogElement
  private readonly onNativeClose = (): void => this.emit("close")
  public connectedCallback(): void {
    if (this.dialog !== undefined) return
    this.dialog = this.ownerDocument.createElement("dialog")
    this.dialog.addEventListener("close", this.onNativeClose)
    while (this.firstChild !== null) this.dialog.append(this.firstChild)
    this.append(this.dialog)
    if (this.hasAttribute("open")) this.open()
  }
  public disconnectedCallback(): void {
    this.dialog?.removeEventListener("close", this.onNativeClose)
  }
  public open(): void {
    if (this.dialog === undefined) return
    if (typeof this.dialog.showModal === "function") this.dialog.showModal()
    else this.dialog.open = true
    this.emit("open")
  }
  public close(): void {
    if (this.dialog === undefined) return
    if (typeof this.dialog.close === "function") this.dialog.close()
    else this.dialog.open = false
    if (typeof this.dialog.close !== "function") this.emit("close")
  }
}

export class MuiTooltip extends MuiElement {
  private trigger: Element | undefined
  private tooltip: HTMLElement | undefined
  private readonly show = (): void => {
    if (this.trigger === undefined || this.tooltip === undefined) return
    this.tooltip.hidden = false
    positionFloating(
      this.trigger,
      this.tooltip,
      (this.getAttribute("placement") as FloatingPlacement | null) ?? "top",
    )
  }
  private readonly hide = (): void => {
    if (this.tooltip !== undefined) this.tooltip.hidden = true
  }
  public connectedCallback(): void {
    if (this.tooltip !== undefined) return
    this.trigger = this.firstElementChild ?? undefined
    const text = this.getAttribute("text")
    if (this.trigger === undefined || !text) return
    this.tooltip = this.ownerDocument.createElement("span")
    this.tooltip.dataset.muiTooltip = ""
    this.tooltip.id = `mui-tooltip-${Math.random().toString(36).slice(2)}`
    this.tooltip.setAttribute("role", "tooltip")
    this.tooltip.textContent = text
    this.tooltip.hidden = true
    this.trigger.setAttribute("aria-describedby", this.tooltip.id)
    this.addEventListener("mouseenter", this.show)
    this.addEventListener("mouseleave", this.hide)
    this.addEventListener("focusin", this.show)
    this.addEventListener("focusout", this.hide)
    this.append(this.tooltip)
  }
  public disconnectedCallback(): void {
    this.removeEventListener("mouseenter", this.show)
    this.removeEventListener("mouseleave", this.hide)
    this.removeEventListener("focusin", this.show)
    this.removeEventListener("focusout", this.hide)
  }
}

export class MuiPopover extends MuiElement {
  private trigger: HTMLElement | undefined
  private content: HTMLElement | undefined
  private readonly onClick = (): void => {
    if (this.content?.hidden === false) this.close()
    else this.open()
  }
  private readonly onPointerDown = (event: Event): void => {
    if (!this.contains(event.target as Node)) this.close()
  }
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") this.close()
  }
  public connectedCallback(): void {
    this.trigger = this.querySelector<HTMLElement>(":scope > mui-popover-trigger") ?? undefined
    this.content = this.querySelector<HTMLElement>(":scope > mui-popover-content") ?? undefined
    if (this.trigger === undefined || this.content === undefined) return
    this.content.hidden = true
    this.trigger.setAttribute("aria-expanded", "false")
    this.trigger.addEventListener("click", this.onClick)
    this.ownerDocument.addEventListener("pointerdown", this.onPointerDown)
    this.ownerDocument.addEventListener("keydown", this.onKeyDown)
  }
  public disconnectedCallback(): void {
    this.trigger?.removeEventListener("click", this.onClick)
    this.ownerDocument.removeEventListener("pointerdown", this.onPointerDown)
    this.ownerDocument.removeEventListener("keydown", this.onKeyDown)
  }
  public open(): void {
    if (this.trigger === undefined || this.content === undefined) return
    this.content.hidden = false
    this.trigger.setAttribute("aria-expanded", "true")
    positionFloating(
      this.trigger,
      this.content,
      (this.getAttribute("placement") as FloatingPlacement | null) ?? "bottom",
    )
    this.emit("open")
  }
  public close(): void {
    if (this.content === undefined) return
    this.content.hidden = true
    this.trigger?.setAttribute("aria-expanded", "false")
    this.emit("close")
  }
}

export class MuiDialog extends MuiModal {}
export class MuiDrawer extends MuiModal {}
