export { TimePicker, timePickerSizes } from "./time-picker-element.js"
export type { TimePickerSize } from "./time-picker-element.js"
export { createTimePicker } from "./time-picker.js"
export { isTimePickerSupported } from "./native.js"
export type { TimePickerController, TimePickerState } from "./time-picker.js"

import { TimePicker } from "./time-picker-element.js"
import { ViewElement } from "../../core/index.js"

export function registerTimePicker(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([TimePicker], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(TimePicker.tag)) registerTimePicker()

