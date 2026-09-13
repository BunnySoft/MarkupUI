export const messageTypes = ["info", "success", "warning", "error", "loading"] as const
export type MessageType = (typeof messageTypes)[number]

export const messagePlacements = [
  "top",
  "top-left",
  "top-right",
  "bottom",
  "bottom-left",
  "bottom-right",
] as const
export type MessagePlacement = (typeof messagePlacements)[number]

export interface MessageCloseDetail {
  value: string
}
