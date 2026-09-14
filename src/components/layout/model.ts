export const layoutPositions = ["static", "absolute"] as const
export type LayoutPosition = (typeof layoutPositions)[number]

export const siderSides = ["start", "end"] as const
export type LayoutSide = (typeof siderSides)[number]

export function nonnegativeNumber(value: number | null): number | null {
  if (value !== null && (!Number.isFinite(value) || value < 0)) {
    throw new RangeError("Layout dimensions must be nonnegative finite numbers or null.")
  }
  return value
}

/** Passive layout frames; callers must still validate every descendant. */
export function isLayoutElement(element: Element): boolean {
  return element.localName === "m-layout"
    || element.localName === "m-layout-header"
    || element.localName === "m-layout-content"
    || element.localName === "m-layout-footer"
    || element.localName === "m-layout-sider"
}
