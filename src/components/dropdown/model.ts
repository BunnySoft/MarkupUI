import type { DropdownItem } from "./regions.js"

export const dropdownPlacements = ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "left-start", "left-end", "right", "right-start", "right-end"] as const
export type DropdownPlacement = typeof dropdownPlacements[number]
export const dropdownSizes = ["small", "medium", "large", "huge"] as const
export type DropdownSize = typeof dropdownSizes[number]
export type DropdownOpenReason = "native" | "api" | "refresh" | "disabled"

export interface DropdownSelectionDetail {
  readonly key: string
  readonly item: DropdownItem
  readonly path: readonly string[]
  readonly source: "native"
  readonly originalEvent: MouseEvent
}
export interface DropdownOpenChangedDetail {
  readonly show: boolean
  readonly reason: DropdownOpenReason
}
export interface DropdownErrorDetail {
  readonly error: unknown
}
