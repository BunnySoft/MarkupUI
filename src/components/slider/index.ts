export { Slider } from "./slider-element.js"
export { createSlider, createSliderPair } from "./slider.js"
export type { SliderOptions, SliderController, SliderPairController, SliderPairChange } from "./slider.js"

import { Slider } from "./slider-element.js"
import { ViewElement } from "../../core/index.js"

export function registerSlider(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Slider], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Slider.tag)) registerSlider()

