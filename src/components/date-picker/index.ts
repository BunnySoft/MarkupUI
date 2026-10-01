export { DatePicker, datePickerTypes } from "./date-picker-element.js"
export type { DatePickerType, DatePickerElementConfiguration } from "./date-picker-element.js"
export { createDatePicker } from "./date-picker.js"
export { isDatePickerTypeSupported } from "./native.js"
export type { NativeDateType, DatePickerProfile, DatePickerValue } from "./native.js"
export type { DatePickerController, DatePickerState, DatePickerOptions, DatePickerConfiguration } from "./date-picker.js"

import { DatePicker } from "./date-picker-element.js"
import { ViewElement } from "../../core/index.js"

export function registerDatePicker(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([DatePicker], registry)
}

if (typeof customElements !== "undefined") registerDatePicker()
