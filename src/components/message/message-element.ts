import { ViewElement } from "../../core/index.js"
import { messageTypes } from "./model.js"
import type { MessageCloseDetail, MessageType } from "./model.js"

export { messageTypes } from "./model.js"
export type { MessageCloseDetail, MessageType } from "./model.js"

const icons: Record<MessageType, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  error: "×",
  loading: "…",
}

/**
 * A message notice for brief feedback.
 * @event {"name":"Close","web":"m:close","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 */
export class Message extends ViewElement {
  public static readonly tag = "m-message"
  public static get observedAttributes(): string[] {
    return ["type", "content", "duration", "closable"]
  }

  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private closeButton: HTMLButtonElement | null = null
  private iconSpan: HTMLSpanElement | null = null
  private contentSpan: HTMLSpanElement | null = null
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", this.type === "error" ? "alert" : "status")
    }
    this.render()
    this.scheduleDismiss()
    this.addEventListener("mouseenter", this.onMouseEnter)
    this.addEventListener("mouseleave", this.onMouseLeave)
  }

  public disconnectedCallback(): void {
    this.removeEventListener("mouseenter", this.onMouseEnter)
    this.removeEventListener("mouseleave", this.onMouseLeave)
    this.clearDismiss()
    this.closeButton?.removeEventListener("click", this.handleCloseClick)
  }

  public attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (!this.isConnected) return
    if (name === "duration") {
      this.scheduleDismiss()
    } else if (name === "closable") {
      this.render()
    } else if (name === "content") {
      this.render()
    } else if (name === "type") {
      if (this.iconSpan) {
        this.iconSpan.textContent = icons[this.type] ?? "i"
      }
      if (!this.hasAttribute("role")) {
        this.setAttribute("role", this.type === "error" ? "alert" : "status")
      }
    }
  }

  public get type(): MessageType {
    return this.choiceAttribute("type", messageTypes, "info")
  }
  public set type(value: MessageType) {
    this.setChoiceAttribute("type", value, messageTypes)
  }

  public get content(): string {
    return this.getAttribute("content") ?? ""
  }
  public set content(value: string | null) {
    this.setStringAttribute("content", value)
  }

  public get duration(): number {
    return this.numberAttribute("duration", 3000)
  }
  public set duration(value: number) {
    this.setAttribute("duration", String(value))
  }

  public get closable(): boolean {
    return this.hasAttribute("closable")
  }
  public set closable(value: boolean) {
    this.setBooleanAttribute("closable", value)
  }

  public close(): void {
    this.emit<MessageCloseDetail>(
      "m:close",
      { value: this.content },
      { bubbles: true, cancelable: false, composed: false },
    )
    this.remove()
  }

  private scheduleDismiss(): void {
    this.clearDismiss()
    if (this.duration > 0) {
      const view = this.ownerDocument.defaultView ?? globalThis
      this.timeoutId = view.setTimeout(() => {
        this.close()
      }, this.duration) as ReturnType<typeof setTimeout>
    }
  }

  private clearDismiss(): void {
    if (this.timeoutId !== null) {
      const view = this.ownerDocument.defaultView ?? globalThis
      view.clearTimeout(this.timeoutId as unknown as number)
      this.timeoutId = null
    }
  }

  private readonly onMouseEnter = (): void => {
    this.clearDismiss()
  }

  private readonly onMouseLeave = (): void => {
    this.scheduleDismiss()
  }

  private render(): void {
    if (this.hasAttribute("content") || this.hasAttribute("closable") || this.closest("m-message-container")) {
      this.classList.add("m-message")
    }

    if (this.hasAttribute("content")) {
      if (!this.iconSpan) {
        this.iconSpan = this.querySelector<HTMLSpanElement>(":scope > [data-message-icon]")
      }
      if (!this.iconSpan) {
        this.iconSpan = this.ownerDocument.createElement("span")
        this.iconSpan.dataset.messageIcon = ""
        this.iconSpan.setAttribute("aria-hidden", "true")
        this.prepend(this.iconSpan)
      }
      this.iconSpan.textContent = icons[this.type] ?? "i"

      if (!this.contentSpan) {
        this.contentSpan = this.querySelector<HTMLSpanElement>(":scope > [data-message-content]")
      }
      if (!this.contentSpan) {
        this.contentSpan = this.ownerDocument.createElement("span")
        this.contentSpan.dataset.messageContent = ""
        this.append(this.contentSpan)
      }
      this.contentSpan.textContent = this.content
    }

    if (this.closable) {
      if (!this.closeButton) {
        this.closeButton = this.querySelector<HTMLButtonElement>(":scope > [data-message-close]")
      }
      if (!this.closeButton) {
        this.closeButton = this.ownerDocument.createElement("button")
        this.closeButton.type = "button"
        this.closeButton.dataset.messageClose = ""
        this.closeButton.setAttribute("aria-label", "Dismiss message")
        this.closeButton.textContent = "×"
        this.append(this.closeButton)
      }
      this.closeButton.addEventListener("click", this.handleCloseClick)
    } else if (this.closeButton) {
      this.closeButton.removeEventListener("click", this.handleCloseClick)
      this.closeButton.remove()
      this.closeButton = null
    }
  }

  private readonly handleCloseClick = (event: MouseEvent): void => {
    event.stopPropagation()
    this.close()
  }
}

export const MMessage = Message
