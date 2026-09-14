import type { CollapseItem } from "./collapse.js"

export interface CollapseHeaderActivatedDetail {
  readonly key: string
  readonly expanded: boolean
  readonly item: CollapseItem
  readonly originalEvent: MouseEvent
}

export interface CollapseExpandedChangedDetail {
  readonly expandedKeys: readonly string[]
  readonly key: string
  readonly expanded: boolean
  readonly item: CollapseItem
  readonly originalEvent: Event
}

export interface CollapseErrorDetail {
  readonly error: unknown
}
