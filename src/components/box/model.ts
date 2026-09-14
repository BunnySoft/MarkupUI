export const boxDisplays = ["block", "inline-block", "flex", "inline-flex", "grid", "none"] as const
export type BoxDisplay = (typeof boxDisplays)[number]

export const boxDirections = ["row", "column", "row-reverse", "column-reverse"] as const
export type BoxDirection = (typeof boxDirections)[number]

export const boxAlignments = ["start", "center", "end", "stretch", "baseline"] as const
export type BoxAlign = (typeof boxAlignments)[number]

export const boxJustifications = ["start", "center", "end", "space-between", "space-around", "space-evenly"] as const
export type BoxJustify = (typeof boxJustifications)[number]
