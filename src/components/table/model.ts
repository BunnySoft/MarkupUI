export const tableSizes = ["small", "medium", "large"] as const
export type TableSize = (typeof tableSizes)[number]
