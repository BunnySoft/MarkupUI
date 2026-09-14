export { Highlight, MHighlight, HIGHLIGHT_LIMITS, findHighlightRanges, highlightText } from "./highlight.js"
export type { HighlightMatchOptions, HighlightOptions, HighlightRange } from "./highlight.js"

import { Highlight } from "./highlight.js"
import { ViewElement } from "../../core/index.js"

export function registerHighlight(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Highlight], registry)
}

export function createHighlight(options: Partial<Highlight> = {}): Highlight {
  const element = document.createElement("m-highlight") as Highlight
  Object.assign(element, options)
  return element
}

if (typeof customElements !== "undefined") registerHighlight()

