import { Timeline, MTimeline, TimelineItem, MTimelineItem, registerTimeline, timelineItemTypes } from "./index.js"

const target = globalThis as typeof globalThis & { MarkupUITimeline?: typeof import("./index.js") }
if (target.MarkupUITimeline !== undefined) throw new Error("MarkupUITimeline is already defined.")
target.MarkupUITimeline = { Timeline, MTimeline, TimelineItem, MTimelineItem, registerTimeline, timelineItemTypes }
