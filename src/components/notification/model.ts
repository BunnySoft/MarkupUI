export const notificationTypes = ["default", "info", "success", "warning", "error"] as const
export type NotificationType = (typeof notificationTypes)[number]

export const notificationPlacements = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
  "top",
  "bottom",
] as const
export type NotificationPlacement = (typeof notificationPlacements)[number]

export interface NotificationCloseDetail {
  value: string
}
