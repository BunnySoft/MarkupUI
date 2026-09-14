export const emptySizes = ["small", "medium", "large", "huge"] as const
export type EmptySize = (typeof emptySizes)[number]
