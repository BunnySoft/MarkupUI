import { ViewElement } from "../../core/index.js"
import type { ModalCancelDetail, ModalCloseDetail } from "./model.js"

export type { ModalCancelDetail, ModalCloseDetail, ModalEventDetail } from "./model.js"

/**
 * A modal dialog surface with native top-layer modality, companion regions, and backdrop interaction.
 * @region {"name":"header","element":"m-modal-header","accepts":["heading","content"],"min":0,"max":1}
 * @region {"name":"body","element":"m-modal-body","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"footer","element":"m-modal-footer","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"action","element":"m-modal-action","accepts":["actions"],"min":0,"max":1}
 * @event {"name":"Close","web":"m:close","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Cancel","web":"m:cancel","bubbles":true,"cancelable":true,"composed":false,"detail":{"value":"string"}}
 */
export class Modal extends ViewElement {
  public static readonly tag = "m-modal"
  public static get observedAttributes(): string[] {
    return ["open", "title", "closable", "mask-closable", "width"]
  }

  private dialogElement: HTMLDialogElement | undefined
  private generatedHeader: HTMLElement | undefined
  private generatedTitle: HTMLElement | undefined
  private closeButton: HTMLButtonElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false
  private dialogListenersAttached = false
  private closeResult: string | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-modal")
    this.ensureDialog()
    this.synchronize()
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.observer.observe(this, { childList: true, subtree: true, characterData: true })
    if (this.open && !this.dialogElement?.open) {
      this.showModal()
    }
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (name === "open") {
      if (this.open) {
        if (this.dialogElement && !this.dialogElement.open) {
          if (typeof this.dialogElement.showModal === "function") {
            this.dialogElement.showModal()
          } else {
            this.dialogElement.open = true
          }
        }
      } else {
        if (this.dialogElement && this.dialogElement.open) {
          if (typeof this.dialogElement.close === "function") {
            this.dialogElement.close()
          } else {
            this.dialogElement.open = false
            this.dialogElement.dispatchEvent(new Event("close"))
          }
        }
      }
    } else if (name === "width") {
      this.updateWidth()
    }
    if (this.isConnected) {
      this.synchronize()
    }
  }

  public get open(): boolean {
    return this.hasAttribute("open")
  }
  public set open(value: boolean) {
    this.setBooleanAttribute("open", value)
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string) {
    this.setStringAttribute("title", value)
  }

  public get closable(): boolean {
    return this.hasAttribute("closable")
  }
  public set closable(value: boolean) {
    this.setBooleanAttribute("closable", value)
  }

  public get maskClosable(): boolean {
    return this.booleanAttribute("mask-closable", true)
  }
  public set maskClosable(value: boolean) {
    this.setBooleanAttribute("mask-closable", value, false)
  }

  public get width(): string | null {
    return this.getAttribute("width")
  }
  public set width(value: string | null) {
    this.setStringAttribute("width", value)
  }

  public showModal(): void {
    this.ensureDialog()
    this.open = true
    if (this.dialogElement && !this.dialogElement.open) {
      if (typeof this.dialogElement.showModal === "function") {
        this.dialogElement.showModal()
      } else {
        this.dialogElement.open = true
      }
    }
  }

  public close(result?: string): void {
    this.closeResult = result
    this.open = false
    if (this.dialogElement && this.dialogElement.open) {
      if (typeof this.dialogElement.close === "function") {
        this.dialogElement.close(result)
      } else {
        this.dialogElement.open = false
        if (result !== undefined) this.dialogElement.returnValue = result
        this.dialogElement.dispatchEvent(new Event("close"))
      }
    }
  }

  private ensureDialog(): void {
    if (this.dialogElement && this.contains(this.dialogElement)) {
      return
    }
    const existing = [...this.children].find((el): el is HTMLDialogElement => el instanceof HTMLDialogElement)
    if (existing) {
      this.dialogElement = existing
    } else {
      this.dialogElement = this.ownerDocument.createElement("dialog")
      this.dialogElement.className = "m-native-dialog m-modal"
      this.append(this.dialogElement)
    }
    if (!this.dialogElement.classList.contains("m-native-dialog")) {
      this.dialogElement.classList.add("m-native-dialog")
    }
    if (!this.dialogElement.classList.contains("m-modal")) {
      this.dialogElement.classList.add("m-modal")
    }
    if (!this.dialogElement.hasAttribute("role")) {
      this.dialogElement.setAttribute("role", "dialog")
    }
    this.attachDialogListeners(this.dialogElement)
    this.updateWidth()
  }

  private attachDialogListeners(dialog: HTMLDialogElement): void {
    if (this.dialogListenersAttached) return
    this.dialogListenersAttached = true

    dialog.addEventListener("cancel", (event: Event) => {
      const allowed = this.emit<ModalCancelDetail>(
        "m:cancel",
        { value: "cancel" },
        { bubbles: true, cancelable: true, composed: false },
      )
      if (!allowed) {
        event.preventDefault()
      }
    })

    dialog.addEventListener("close", () => {
      if (this.hasAttribute("open")) {
        this.removeAttribute("open")
      }
      const val = dialog.returnValue || this.closeResult || ""
      this.closeResult = undefined
      this.emit<ModalCloseDetail>(
        "m:close",
        { value: val },
        { bubbles: true, cancelable: false, composed: false },
      )
    })

    let pointerDownOutside = false
    let activePointerId = -1
    dialog.addEventListener("pointerdown", (event: Event) => {
      const pe = event as PointerEvent
      if ((pe.isPrimary ?? true) && pe.button === 0 && dialog.open) {
        activePointerId = pe.pointerId ?? 1
        pointerDownOutside = this.isPointerOutside(dialog, pe)
      } else {
        pointerDownOutside = false
      }
    })
    dialog.addEventListener("pointerup", (event: Event) => {
      const pe = event as PointerEvent
      const id = pe.pointerId ?? 1
      if (id !== activePointerId) return
      const upOutside = this.isPointerOutside(dialog, pe)
      const wasDownOutside = pointerDownOutside
      pointerDownOutside = false
      activePointerId = -1
      if (wasDownOutside && upOutside && this.maskClosable && dialog.open) {
        const allowed = this.emit<ModalCancelDetail>(
          "m:cancel",
          { value: "mask" },
          { bubbles: true, cancelable: true, composed: false },
        )
        if (allowed) {
          this.close("mask")
        }
      }
    })
  }

  private isPointerOutside(dialog: HTMLDialogElement, event: PointerEvent): boolean {
    const rect = dialog.getBoundingClientRect()
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
  }

  private readonly onCloseButtonClick = (): void => {
    const allowed = this.emit<ModalCancelDetail>(
      "m:cancel",
      { value: "close" },
      { bubbles: true, cancelable: true, composed: false },
    )
    if (allowed) {
      this.close("close")
    }
  }

  private updateWidth(): void {
    if (!this.dialogElement) return
    if (this.width) {
      this.dialogElement.style.setProperty("--m-modal-width", this.width)
      this.style.setProperty("--m-modal-width", this.width)
    } else {
      this.dialogElement.style.removeProperty("--m-modal-width")
      this.style.removeProperty("--m-modal-width")
    }
  }

  private synchronize(): void {
    this.observer?.disconnect()
    this.ensureDialog()
    if (!this.dialogElement) return

    const toMove = [...this.childNodes].filter(node => node !== this.dialogElement)
    if (toMove.length > 0) {
      this.dialogElement.append(...toMove)
    }

    let header = [...this.dialogElement.children].find((el): el is HTMLElement =>
      el instanceof HTMLElement && (el.localName === "m-modal-header" || el.hasAttribute("data-modal-header"))
    ) ?? this.generatedHeader

    if (this.title || this.closable) {
      if (!header) {
        header = this.ownerDocument.createElement("div")
        header.setAttribute("data-modal-header", "")
        this.generatedHeader = header
        this.dialogElement.prepend(header)
      }
    }

    if (header) {
      if (header === this.generatedHeader && !this.title && !this.closable) {
        this.generatedHeader.remove()
        this.generatedHeader = undefined
        this.generatedTitle = undefined
        this.closeButton = undefined
      } else {
        if (this.title) {
          let titleEl = header.querySelector<HTMLElement>("[data-modal-title]") ?? this.generatedTitle
          if (!titleEl) {
            titleEl = this.ownerDocument.createElement("h2")
            titleEl.setAttribute("data-modal-title", "")
            this.generatedTitle = titleEl
            header.prepend(titleEl)
          }
          if (titleEl.textContent !== this.title) {
            titleEl.textContent = this.title
          }
          if (!this.dialogElement.hasAttribute("aria-labelledby") && !this.dialogElement.hasAttribute("aria-label")) {
            this.dialogElement.setAttribute("aria-label", this.title)
          }
        } else if (this.generatedTitle) {
          this.generatedTitle.remove()
          this.generatedTitle = undefined
        }

        if (this.closable) {
          let closeBtn = header.querySelector<HTMLButtonElement>("button[data-modal-close], button.m-modal__close") ?? this.closeButton
          if (!closeBtn) {
            closeBtn = this.ownerDocument.createElement("button")
            closeBtn.type = "button"
            closeBtn.setAttribute("data-modal-close", "")
            closeBtn.className = "m-modal__close"
            closeBtn.setAttribute("aria-label", "Close")
            closeBtn.textContent = "×"
            closeBtn.addEventListener("click", this.onCloseButtonClick)
            this.closeButton = closeBtn
            header.append(closeBtn)
          }
        } else if (this.closeButton) {
          this.closeButton.removeEventListener("click", this.onCloseButtonClick)
          this.closeButton.remove()
          this.closeButton = undefined
        }
      }
    } else if (this.generatedHeader) {
      this.generatedHeader.remove()
      this.generatedHeader = undefined
      this.generatedTitle = undefined
      this.closeButton = undefined
    }

    this.updateWidth()
    if (this.isConnected) {
      this.observer?.observe(this, { childList: true, subtree: true, characterData: true })
    }
  }
}
