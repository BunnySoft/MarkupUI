export { DynamicTags, dynamicTagsSizes } from "./dynamic-tags-element.js"
export type { DynamicTagsSize } from "./dynamic-tags-element.js"
export type { DynamicTag, DynamicTagsCommitResult, DynamicTagsRejection } from "./dynamic-tags.js"

import { DynamicTags } from "./dynamic-tags-element.js"
import { ViewElement } from "../../core/index.js"

export function registerDynamicTags(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([DynamicTags], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(DynamicTags.tag)) registerDynamicTags()

