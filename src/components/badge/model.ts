export const badgeTypes = ["default", "error", "primary", "info", "success", "warning"] as const
export type BadgeType = (typeof badgeTypes)[number]

export const badgePlacements = ["top-start", "top-end", "bottom-start", "bottom-end"] as const
export type BadgePlacement = (typeof badgePlacements)[number]
