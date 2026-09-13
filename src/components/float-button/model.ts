export const floatButtonTypes = ["default", "primary", "info", "success", "warning", "error"] as const
export type FloatButtonType = (typeof floatButtonTypes)[number]

export const floatButtonShapes = ["circle", "square"] as const
export type FloatButtonShape = (typeof floatButtonShapes)[number]

export interface FloatButtonClickDetail {
  originalEvent: MouseEvent
}
