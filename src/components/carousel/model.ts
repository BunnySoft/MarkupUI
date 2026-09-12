export const carouselDirections = ["horizontal", "vertical"] as const
export type CarouselDirection = typeof carouselDirections[number]

export function validateCarouselGap(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError("gap must be finite and nonnegative.")
  }
  return value
}

export interface CarouselCurrentChangedDetail {
  readonly index: number
  readonly previousIndex: number
  readonly item: HTMLElement | null
  readonly previousItem: HTMLElement | null
  readonly reason: "api" | "control" | "autoplay" | "scroll" | "refresh"
}

export interface CarouselState {
  readonly currentIndex: number
  readonly targetIndex: number | null
  readonly defaultIndex: number
  readonly total: number
  readonly direction: CarouselDirection
  readonly playing: boolean
  readonly paused: boolean
  readonly pauseReasons: readonly string[]
  readonly disabled: boolean
  readonly ready: boolean
}
