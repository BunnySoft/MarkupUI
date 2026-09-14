export const tabsPlacements = ["top", "bottom", "left", "right", "start", "end"] as const
export type TabsPlacement = (typeof tabsPlacements)[number]

export const tabsTypes = ["line", "card", "segment"] as const
export type TabsType = (typeof tabsTypes)[number]

export const tabsSizes = ["small", "medium", "large"] as const
export type TabsSize = (typeof tabsSizes)[number]

export const tabsActivations = ["automatic", "manual"] as const
export type TabsActivation = (typeof tabsActivations)[number]

export interface TabsChangeDetail {
  value: string
  previous: string | null
}

export interface TabCloseDetail {
  name: string
}
