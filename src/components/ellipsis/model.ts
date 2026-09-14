export const expandTriggers = ["click"] as const
export type ExpandTrigger = (typeof expandTriggers)[number]
