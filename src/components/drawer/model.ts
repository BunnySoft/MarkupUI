export const drawerPlacements = ["top", "right", "bottom", "left"] as const
export type DrawerPlacement = (typeof drawerPlacements)[number]

export interface DrawerCloseDetail {
  value: string
}
