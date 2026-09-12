export const buttonTypes = ["default", "primary", "info", "success", "warning", "error", "tertiary"] as const
export const buttonSizes = ["tiny", "small", "medium", "large"] as const
export const buttonAppearances = ["default", "secondary", "tertiary", "quaternary", "ghost", "dashed", "text"] as const
export const buttonShapes = ["rectangular", "round", "circle"] as const
export const buttonAttrTypes = ["button", "submit", "reset"] as const
export const iconPlacements = ["left", "right"] as const
export const formMethods = ["get", "post", "dialog"] as const
export const formEncTypes = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"] as const

export type ButtonType = typeof buttonTypes[number]
export type ButtonSize = typeof buttonSizes[number]
export type ButtonAppearance = typeof buttonAppearances[number]
export type ButtonShape = typeof buttonShapes[number]
export type ButtonAttrType = typeof buttonAttrTypes[number]
export type ButtonIconPlacement = typeof iconPlacements[number]
export type ButtonFormMethod = typeof formMethods[number]
export type ButtonFormEncType = typeof formEncTypes[number]
