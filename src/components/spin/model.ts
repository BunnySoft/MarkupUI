export const spinSizes = ["small", "medium", "large"] as const
export type SpinPresetSize = (typeof spinSizes)[number]
export type SpinSize = SpinPresetSize | number
export type SpinValidationError = "size" | "delay" | "stroke-width" | "radius" | "scale" | "stroke"
