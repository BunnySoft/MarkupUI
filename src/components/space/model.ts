export const spaceSizes = ["small", "medium", "large"] as const
export type SpaceSize = typeof spaceSizes[number]
export const spaceAlignments = ["normal", "start", "end", "center", "baseline", "stretch"] as const
export type SpaceAlign = typeof spaceAlignments[number]
export const spaceJustifications = ["start", "end", "center", "space-between", "space-around", "space-evenly"] as const
export type SpaceJustify = typeof spaceJustifications[number]

/** A passive layout frame; callers still validate every descendant. */
export function isSpaceElement(element: Element): boolean {
  return element.localName === "m-space"
}
