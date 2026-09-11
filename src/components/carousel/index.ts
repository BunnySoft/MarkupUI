export { createCarousel } from "./carousel.js"
export type { CarouselOptions, CarouselSettings, CarouselState, CarouselChange, CarouselController } from "./carousel.js"
export { MCarousel } from "./element.js"
export { MCarouselControls, MCarouselItem, MCarouselReadout, MCarouselViewport } from "./regions.js"
export {
  carouselControlsDefinition,
  carouselDefinition,
  carouselItemDefinition,
  carouselReadoutDefinition,
  carouselViewportDefinition,
} from "./model.js"

import { MCarousel } from "./element.js"
import { MCarouselControls, MCarouselItem, MCarouselReadout, MCarouselViewport } from "./regions.js"

const definitions: ReadonlyArray<readonly [string, CustomElementConstructor]> = [
  ["m-carousel", MCarousel],
  ["m-carousel-viewport", MCarouselViewport],
  ["m-carousel-item", MCarouselItem],
  ["m-carousel-controls", MCarouselControls],
  ["m-carousel-readout", MCarouselReadout],
]

export function registerCarousel(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  for (const [name, constructor] of definitions) {
    const existing = registry.get(name)
    if (existing && existing !== constructor) {
      throw new Error(`'${name}' is already defined. Load the Carousel component before the legacy MarkupUI bundle.`)
    }
  }
  for (const [name, constructor] of definitions) {
    if (!registry.get(name)) {
      registry.define(name, constructor)
    }
  }
}

if (typeof customElements !== "undefined") registerCarousel()
