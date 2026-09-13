export const progressTypes = ["line", "circle", "dashboard"] as const
export type ProgressType = (typeof progressTypes)[number]

export const progressStatuses = ["default", "success", "error", "warning", "info"] as const
export type ProgressStatus = (typeof progressStatuses)[number]

export const progressIndicatorPlacements = ["inside", "outside"] as const
export type ProgressIndicatorPlacement = (typeof progressIndicatorPlacements)[number]
