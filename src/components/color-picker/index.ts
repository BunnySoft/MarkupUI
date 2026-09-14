export { ColorPicker, ColorPicker as MColorPicker } from "./color-picker-element.js"
export { createColorPicker } from "./color-picker.js"
export type { ColorPickerController } from "./color-picker.js"

import { ColorPicker } from "./color-picker-element.js"
import { ViewElement } from "../../core/index.js"

export function registerColorPicker(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([ColorPicker], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(ColorPicker.tag)) registerColorPicker()

