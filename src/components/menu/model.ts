export const menuModes = ["vertical", "horizontal"] as const
export type MenuMode = (typeof menuModes)[number]

export interface MenuSelectDetail {
  value: string
  item: HTMLElement
}

export interface MenuChangeDetail {
  value: string
  previous: string | null
}
