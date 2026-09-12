import { Carousel, CarouselControls, CarouselItem, CarouselReadout, CarouselViewport, registerCarousel } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUICarousel?: typeof import("./index.js") }
if (target.MarkupUICarousel !== undefined) throw new Error("MarkupUICarousel is already defined.")
target.MarkupUICarousel = { Carousel, CarouselControls, CarouselItem, CarouselReadout, CarouselViewport, registerCarousel }
