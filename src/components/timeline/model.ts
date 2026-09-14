export const timelineItemTypes = ["default", "success", "error", "warning", "info"] as const
export type TimelineItemType = (typeof timelineItemTypes)[number]
