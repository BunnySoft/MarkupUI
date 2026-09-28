export { Calendar } from "./calendar-element.js"
export { calendarModes } from "./calendar.js"
export type { CalendarMode, CalendarSettings, CalendarLabels, CalendarState, CalendarChange, CalendarPanelChange } from "./calendar.js"
export type { CalendarDate } from "./date.js"

import { Calendar } from "./calendar-element.js"
import { ViewElement } from "../../core/index.js"

export function registerCalendar(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Calendar], registry)
}

if (typeof customElements !== "undefined") registerCalendar()

