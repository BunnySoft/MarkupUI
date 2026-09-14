import { ViewElement } from "../../core/index.js"
import { notificationPlacements } from "./model.js"
import type { NotificationPlacement } from "./model.js"
import type { Notification } from "./notification-element.js"

export { notificationPlacements } from "./model.js"
export type { NotificationPlacement } from "./model.js"

/**
 * A container for positioning and displaying notification notices.
 * @region {"name":"notifications","accepts":["content"],"min":0,"max":null}
 */
export class NotificationContainer extends ViewElement {
  public static readonly tag = "m-notification-container"
  public static get observedAttributes(): string[] {
    return ["placement"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "region")
      this.setAttribute("aria-label", "Notifications")
    }
  }

  public get placement(): NotificationPlacement {
    return this.choiceAttribute("placement", notificationPlacements, "top-right")
  }
  public set placement(value: NotificationPlacement) {
    this.setChoiceAttribute("placement", value, notificationPlacements)
  }

  public get notifications(): Notification[] {
    return [...this.querySelectorAll<Notification>(":scope > m-notification")]
  }

  public add(notification: Notification): void {
    this.append(notification)
  }

  public destroyAll(): void {
    for (const item of this.notifications) {
      item.close()
    }
  }
}

export const MNotificationContainer = NotificationContainer
