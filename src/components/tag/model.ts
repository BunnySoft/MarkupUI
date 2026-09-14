export const tagSizes = ["tiny", "small", "medium", "large"] as const
export type TagSize = (typeof tagSizes)[number]

export const tagTypes = ["default", "primary", "info", "success", "warning", "error"] as const
export type TagType = (typeof tagTypes)[number]

export interface TagCloseDetail {
  originalEvent: MouseEvent
}
