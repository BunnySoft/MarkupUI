export { Notification, MNotification } from "./notification-element.js"
export { NotificationContainer, MNotificationContainer } from "./container.js"
export { notification, createNotification } from "./service.js"
export type { NotificationServiceOptions } from "./service.js"
export { notificationTypes, notificationPlacements } from "./model.js"
export type { NotificationCloseDetail, NotificationType, NotificationPlacement } from "./model.js"

export { createNotificationOwner } from "./notification.js"
export type { NotificationAnnouncement, NotificationError, NotificationHandle, NotificationOptions, NotificationOwner, NotificationOwnerOptions, NotificationRemoveReason } from "./notification.js"

import { ViewElement } from "../../core/index.js"
import { Notification } from "./notification-element.js"
import { NotificationContainer } from "./container.js"

export function registerNotification(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Notification, NotificationContainer], registry)
}

if (typeof customElements !== "undefined") registerNotification()
