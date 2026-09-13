import { MElement } from "../core/element.js"
import { positionFloating, type FloatingPlacement } from "../core/position.js"

export abstract class MModal extends MElement {
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

export class MTooltip extends MElement {
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
    this.tooltip.dataset.mTooltip = ""
    this.tooltip.id = `m-tooltip-${Math.random().toString(36).slice(2)}`
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

export class MDialog extends MModal {}
export class MDrawer extends MModal {}
