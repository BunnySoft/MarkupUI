export { Calendar, calendarModes } from "./calendar-element.js"
export type { CalendarMode } from "./calendar-element.js"
export { createCalendar } from "./calendar.js"
export type { CalendarSettings, CalendarOptions, CalendarLabels, CalendarState, CalendarChange, CalendarPanelChange, CalendarController } from "./calendar.js"
export type { CalendarDate } from "./date.js"

import { Calendar } from "./calendar-element.js"
import { ViewElement } from "../../core/index.js"

export function registerCalendar(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Calendar], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Calendar.tag)) registerCalendar()

