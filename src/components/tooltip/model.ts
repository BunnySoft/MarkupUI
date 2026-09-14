import type { PopoverPlacement } from "../popover/position.js"

export const tooltipPlacements: readonly PopoverPlacement[] = [
  "top", "bottom", "left", "right",
  "top-start", "top-end", "bottom-start", "bottom-end",
  "left-start", "left-end", "right-start", "right-end",
] as const

export type TooltipPlacement = (typeof tooltipPlacements)[number]

export function isTooltipElement(element: Element): boolean {
  return element.localName === "m-tooltip" || element.localName === "m-tooltip-trigger" || element.localName === "m-tooltip-content"
}
