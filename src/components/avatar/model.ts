export const avatarSizes = ["tiny", "small", "medium", "large", "huge"] as const
export const avatarShapes = ["rounded", "circle", "square"] as const
export const imageFits = ["fill", "contain", "cover", "none", "scale-down"] as const
export const avatarStates = ["empty", "loading", "loaded", "error"] as const
export const avatarLoadingModes = ["eager", "lazy"] as const

export type AvatarSize = typeof avatarSizes[number] | number
export type AvatarShape = typeof avatarShapes[number]
export type AvatarImageFit = typeof imageFits[number]
export type AvatarState = typeof avatarStates[number]
export type AvatarLoading = typeof avatarLoadingModes[number]
