/**
 * Typed layout and appearance descriptor for ViewElement cross-platform rendering.
 */
export interface ViewStyle {
  display?: "block" | "inline" | "flex" | "grid" | "none" | string | null
  direction?: "row" | "column" | "row-reverse" | "column-reverse" | string | null
  align?: "start" | "center" | "end" | "stretch" | "baseline" | string | null
  justify?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly" | string | null
  wrap?: boolean | "nowrap" | "wrap" | "wrap-reverse" | string | null
  gap?: number | string | null
  padding?: number | string | null
  margin?: number | string | null
  width?: number | string | null
  height?: number | string | null
  background?: string | null
  border?: string | null
  borderRadius?: number | string | null
}
