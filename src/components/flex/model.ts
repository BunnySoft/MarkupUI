export { spaceSizes as flexSizes } from "../space/model.js"
export type { SpaceSize as FlexSize } from "../space/model.js"

export const flexAlignments = ["normal", "start", "end", "flex-start", "flex-end", "self-start", "self-end", "center", "baseline", "first baseline", "last baseline", "stretch"] as const
export type FlexAlign = typeof flexAlignments[number]
export const flexJustifications = ["normal", "start", "end", "flex-start", "flex-end", "center", "left", "right", "stretch", "space-between", "space-around", "space-evenly"] as const
export type FlexJustify = typeof flexJustifications[number]

/** A passive layout frame; callers still validate every descendant. */
export function isFlexElement(element: Element): boolean {
  return element.localName === "m-flex"
}
