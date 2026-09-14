export const gridAlignments = ["normal", "start", "end", "self-start", "self-end", "center", "baseline", "first baseline", "last baseline", "stretch"] as const
export type GridAlign = typeof gridAlignments[number]
export const gridJustifications = ["normal", "start", "end", "self-start", "self-end", "center", "left", "right", "baseline", "first baseline", "last baseline", "stretch"] as const
export type GridJustify = typeof gridJustifications[number]

export function positiveInteger(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError("Grid counts and lines must be positive safe integers.")
  return value
}

/** Passive layout frames; callers must still validate every descendant. */
export function isGridElement(element: Element): boolean {
  return element.localName === "m-grid" || element.localName === "m-grid-item"
}
