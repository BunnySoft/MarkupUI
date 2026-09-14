export const listSizes = ["small", "medium", "large"] as const
export type ListSize = typeof listSizes[number]
