import type { PopoverPlacement } from "./position.js"

export const popoverPlacements: readonly PopoverPlacement[] = [
  "top", "bottom", "left", "right",
  "top-start", "top-end", "bottom-start", "bottom-end",
  "left-start", "left-end", "right-start", "right-end",
] as const

export const popoverTriggers = ["click", "hover", "focus", "manual"] as const
export type PopoverTriggerMode = (typeof popoverTriggers)[number]
