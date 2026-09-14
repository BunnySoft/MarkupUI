export const cardSizes = ["small", "medium", "large", "huge"] as const
export type CardSize = typeof cardSizes[number]

export const cardSegments = ["", "true", "false", "soft"] as const
export type CardSegment = typeof cardSegments[number]

export interface CardCloseDetail {
  originalEvent: MouseEvent
}
