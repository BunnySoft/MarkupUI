export { Card } from "./card.js"
export { CardAction, CardContent, CardCover, CardFooter, CardHeader, CardHeaderExtra } from "./regions.js"
export type { CardSize, CardSegment, CardCloseDetail } from "./model.js"

import { Card } from "./card.js"
import { CardAction, CardContent, CardCover, CardFooter, CardHeader, CardHeaderExtra } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerCard(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Card, CardCover, CardHeader, CardHeaderExtra, CardContent, CardFooter, CardAction], registry)
}

if (typeof customElements !== "undefined") registerCard()
