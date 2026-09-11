import type { PlatformComponentDefinition } from "../../platform/component.js"

export const carouselDefinition = {
  type: "Carousel",
  web: {
    primary: "m-carousel",
  },
  capabilities: [
    "carousel.current-index",
    "carousel.direction",
    "carousel.navigation",
    "carousel.autoplay",
    "carousel.native-scroll",
  ],
} as const satisfies PlatformComponentDefinition

export const carouselViewportDefinition = {
  type: "CarouselViewport",
  web: {
    primary: "m-carousel-viewport",
  },
  capabilities: ["carousel-region.viewport"],
} as const satisfies PlatformComponentDefinition

export const carouselItemDefinition = {
  type: "CarouselItem",
  web: {
    primary: "m-carousel-item",
  },
  capabilities: ["carousel-region.item", "carousel-item.identity"],
} as const satisfies PlatformComponentDefinition

export const carouselControlsDefinition = {
  type: "CarouselControls",
  web: {
    primary: "m-carousel-controls",
  },
  capabilities: ["carousel-region.controls"],
} as const satisfies PlatformComponentDefinition

export const carouselReadoutDefinition = {
  type: "CarouselReadout",
  web: {
    primary: "m-carousel-readout",
  },
  capabilities: ["carousel-region.readout"],
} as const satisfies PlatformComponentDefinition
