export { Carousel } from "./carousel.js"
export { CarouselControls, CarouselItem, CarouselReadout, CarouselViewport } from "./regions.js"
export type { CarouselCurrentChangedDetail, CarouselDirection, CarouselState } from "./model.js"

import { Carousel } from "./carousel.js"
import { CarouselControls, CarouselItem, CarouselReadout, CarouselViewport } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerCarousel(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Carousel, CarouselViewport, CarouselItem, CarouselControls, CarouselReadout], registry)
}

if (typeof customElements !== "undefined") registerCarousel()
