export const descriptionsSizes = ["small", "medium", "large"] as const
export type DescriptionsSize = typeof descriptionsSizes[number]

export const descriptionsLabelPlacements = ["top", "left"] as const
export type DescriptionsLabelPlacement = typeof descriptionsLabelPlacements[number]

export function positiveInteger(value: number, name = "Descriptions column and span"): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive safe integer.`)
  }
  return value
}
