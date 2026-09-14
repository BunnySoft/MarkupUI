export const textTypes = ["default", "success", "info", "warning", "error"] as const
export type TextType = typeof textTypes[number]
export const textDepths = ["1", "2", "3"] as const
export const headingPrefixes = ["bar"] as const
export type HeadingPrefix = typeof headingPrefixes[number]
export const orderedListTypes = ["1", "a", "A", "i", "I"] as const
export type OrderedListType = typeof orderedListTypes[number]

/** A passive inline frame only; callers still validate every descendant. */
export function isTypographyInline(element: Element): boolean {
  return element.localName === "m-text"
}
