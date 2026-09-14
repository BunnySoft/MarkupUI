export const gradientTextTypes = ["primary", "info", "success", "warning", "error", "danger"] as const
export type GradientTextType = (typeof gradientTextTypes)[number]
