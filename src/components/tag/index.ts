export { Tag, MTag } from "./tag.js"
export type { TagCloseDetail, TagSize, TagType } from "./model.js"

import { Tag } from "./tag.js"
import { ViewElement } from "../../core/index.js"

export function registerTag(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Tag], registry)
}

if (typeof customElements !== "undefined") registerTag()
