export {
  Thing,
  MThing,
  ThingAvatar,
  MThingAvatar,
  ThingHeader,
  MThingHeader,
  ThingContent,
  MThingContent,
  ThingFooter,
  MThingFooter,
  ThingAction,
  MThingAction,
} from "./thing.js"

import { ViewElement } from "../../core/index.js"
import { Thing, ThingAvatar, ThingHeader, ThingContent, ThingFooter, ThingAction } from "./thing.js"

export function registerThing(
  registry: Pick<CustomElementRegistry, "get" | "define"> = customElements,
): void {
  ViewElement.register([Thing, ThingAvatar, ThingHeader, ThingContent, ThingFooter, ThingAction], registry)
}

if (typeof customElements !== "undefined") registerThing()
