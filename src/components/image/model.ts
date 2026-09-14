export const imageFits = ["fill", "contain", "cover", "none", "scale-down"] as const

export type ImageObjectFit = typeof imageFits[number]

export interface ImageLoadDetail {
  readonly src: string
}

export interface ImageErrorDetail {
  readonly src: string
}
