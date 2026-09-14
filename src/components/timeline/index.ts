export { Timeline, MTimeline } from "./timeline.js"
export { TimelineItem, MTimelineItem } from "./item.js"
export { timelineItemTypes } from "./model.js"
export type { TimelineItemType } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Timeline } from "./timeline.js"
import { TimelineItem } from "./item.js"

export function registerTimeline(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Timeline, TimelineItem], registry)
}

if (typeof customElements !== "undefined") registerTimeline()
