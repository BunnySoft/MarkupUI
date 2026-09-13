import { MElement } from "../core/element.js"

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

export class MDialog extends MModal {}
export class MDrawer extends MModal {}
