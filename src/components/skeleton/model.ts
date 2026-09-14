export const skeletonSizes = ["small", "medium", "large"] as const
export type SkeletonPresetSize = (typeof skeletonSizes)[number]
export type SkeletonSize = SkeletonPresetSize
export type SkeletonValidationError = "width" | "height" | "repeat" | "size"
