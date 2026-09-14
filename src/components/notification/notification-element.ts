import { ViewElement } from "../../core/index.js"
import { notificationTypes } from "./model.js"
import type { NotificationCloseDetail, NotificationType } from "./model.js"

export { notificationTypes } from "./model.js"
export type { NotificationCloseDetail, NotificationType } from "./model.js"

const labels: Record<NotificationType, string> = {
  default: "Notification",
  info: "Information",
  success: "Success",
  warning: "Warning",
  error: "Error",
}

const glyphs: Record<NotificationType, string> = {
  default: "•",
  info: "i",
  success: "✓",
  warning: "!",
  error: "×",
}

/**
 * A notification notice for system feedback, alerts, and timed messages.
 * @region {"name":"header","accepts":["text","heading"],"min":0,"max":1}
 * @region {"name":"content","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"description","accepts":["text"],"min":0,"max":1}
 * @region {"name":"icon","accepts":["icon"],"min":0,"max":1}
 * @region {"name":"avatar","accepts":["avatar","image"],"min":0,"max":1}
 * @region {"name":"actions","accepts":["controls"],"min":0,"max":1}
 * @region {"name":"close","accepts":["controls"],"min":0,"max":1}
 * @event {"name":"Close","web":"m:close","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 */
export class Notification extends ViewElement {
  public static readonly tag = "m-notification"
  public static get observedAttributes(): string[] {
    return ["title", "description", "content", "type", "duration", "closable"]
  }

  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private timerStartTime = 0
  private remainingTime = 0
  private closeButton: HTMLButtonElement | null = null
  private iconSpan: HTMLSpanElement | null = null
  private headerEl: HTMLElement | null = null
  private titleEl: HTMLElement | null = null
  private kindEl: HTMLElement | null = null
  private descEl: HTMLElement | null = null
  private contentEl: HTMLElement | null = null
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
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
    } else if (name === "title" || name === "description" || name === "content") {
      this.render()
    } else if (name === "type") {
      this.render()
    }
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string) {
    this.setStringAttribute("title", value)
  }

  public get description(): string {
    return this.getAttribute("description") ?? ""
  }
  public set description(value: string) {
    this.setStringAttribute("description", value)
  }

  public get content(): string {
    return this.getAttribute("content") ?? ""
  }
  public set content(value: string) {
    this.setStringAttribute("content", value)
  }

  public get type(): NotificationType {
    return this.choiceAttribute("type", notificationTypes, "default")
  }
  public set type(value: NotificationType) {
    this.setChoiceAttribute("type", value, notificationTypes)
  }

  public get duration(): number {
    return this.numberAttribute("duration", 4500)
  }
  public set duration(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid number duration.")
    this.setAttribute("duration", String(value))
  }

  public get closable(): boolean {
    return this.hasAttribute("closable")
  }
  public set closable(value: boolean) {
    this.setBooleanAttribute("closable", value)
  }

  public close(): void {
    this.clearDismiss()
    const value = this.title || this.description || this.content
    this.emit<NotificationCloseDetail>(
      "m:close",
      { value },
      { bubbles: true, cancelable: false, composed: false },
    )
    this.remove()
  }

  private scheduleDismiss(): void {
    this.clearDismiss()
    const shouldDismiss = this.hasAttribute("duration")
      ? this.duration > 0
      : Boolean(this.closest("m-notification-container")) && this.duration > 0

    if (shouldDismiss) {
      const view = this.ownerDocument.defaultView ?? globalThis
      this.timerStartTime = performance.now()
      this.remainingTime = this.duration
      this.timeoutId = view.setTimeout(() => {
        this.close()
      }, this.duration)
    }
  }

  private clearDismiss(): void {
    if (this.timeoutId !== null) {
      const view = this.ownerDocument.defaultView ?? globalThis
      view.clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  private readonly onMouseEnter = (): void => {
    if (this.timeoutId !== null) {
      const view = this.ownerDocument.defaultView ?? globalThis
      view.clearTimeout(this.timeoutId)
      this.timeoutId = null
      const elapsed = performance.now() - this.timerStartTime
      this.remainingTime = Math.max(0, this.remainingTime - elapsed)
    }
  }

  private readonly onMouseLeave = (): void => {
    if (this.remainingTime > 0 && this.timeoutId === null) {
      const view = this.ownerDocument.defaultView ?? globalThis
      this.timerStartTime = performance.now()
      this.timeoutId = view.setTimeout(() => {
        this.close()
      }, this.remainingTime)
    }
  }

  private render(): void {
    if (this.type && this.type !== "default") {
      this.dataset.notificationType = this.type
    } else {
      delete this.dataset.notificationType
    }

    if (this.title) {
      if (!this.headerEl) {
        this.headerEl = this.querySelector<HTMLElement>(":scope > [data-notification-header]")
      }
      if (!this.headerEl) {
        this.headerEl = this.ownerDocument.createElement("header")
        this.headerEl.dataset.notificationHeader = ""
        this.prepend(this.headerEl)
      }
      if (this.type && this.type !== "default") {
        if (!this.kindEl) {
          this.kindEl = this.headerEl.querySelector<HTMLElement>(":scope > [data-notification-kind]")
        }
        if (!this.kindEl) {
          this.kindEl = this.ownerDocument.createElement("strong")
          this.kindEl.dataset.notificationKind = ""
          this.headerEl.prepend(this.kindEl)
        }
        this.kindEl.textContent = labels[this.type] ?? ""
      }
      if (!this.titleEl) {
        this.titleEl = this.headerEl.querySelector<HTMLElement>(":scope > [data-notification-title]")
      }
      if (!this.titleEl) {
        this.titleEl = this.ownerDocument.createElement("div")
        this.titleEl.dataset.notificationTitle = ""
        this.headerEl.append(this.titleEl)
      }
      this.titleEl.textContent = this.title
    }

    if (this.type && this.type !== "default") {
      if (!this.iconSpan) {
        this.iconSpan = this.querySelector<HTMLSpanElement>(":scope > [data-notification-icon]")
      }
      if (!this.iconSpan && !this.querySelector(":scope > [data-notification-avatar]")) {
        this.iconSpan = this.ownerDocument.createElement("span")
        this.iconSpan.dataset.notificationIcon = ""
        this.iconSpan.setAttribute("aria-hidden", "true")
        this.prepend(this.iconSpan)
      }
      if (this.iconSpan) {
        this.iconSpan.textContent = glyphs[this.type] ?? ""
      }
    }

    if (this.description) {
      if (!this.descEl) {
        this.descEl = this.querySelector<HTMLElement>(":scope > [data-notification-description]")
      }
      if (!this.descEl) {
        this.descEl = this.ownerDocument.createElement("p")
        this.descEl.dataset.notificationDescription = ""
        this.append(this.descEl)
      }
      this.descEl.textContent = this.description
    }

    if (this.content) {
      if (!this.contentEl) {
        this.contentEl = this.querySelector<HTMLElement>(":scope > [data-notification-content]")
      }
      if (!this.contentEl) {
        this.contentEl = this.ownerDocument.createElement("p")
        this.contentEl.dataset.notificationContent = ""
        this.append(this.contentEl)
      }
      this.contentEl.textContent = this.content
    }

    if (this.closable) {
      if (!this.closeButton) {
        this.closeButton = this.querySelector<HTMLButtonElement>(":scope > [data-notification-close]")
      }
      if (!this.closeButton) {
        this.closeButton = this.ownerDocument.createElement("button")
        this.closeButton.type = "button"
        this.closeButton.dataset.notificationClose = ""
        this.closeButton.setAttribute("aria-label", "Dismiss notification")
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

export const MNotification = Notification
