export { Box, Div } from "./box.js"
export {
  Span,
  Label,
  Footer,
  Article,
  Strong,
  Em,
  Small,
  Pre,
  Details,
  Summary,
} from "./primitives.js"
export {
  boxDisplays,
  boxDirections,
  boxAlignments,
  boxJustifications,
} from "./model.js"
export type {
  BoxDisplay,
  BoxDirection,
  BoxAlign,
  BoxJustify,
} from "./model.js"

import { Box, Div } from "./box.js"
import {
  Span,
  Label,
  Footer,
  Article,
  Strong,
  Em,
  Small,
  Pre,
  Details,
  Summary,
} from "./primitives.js"
import { ViewElement } from "../../core/index.js"

export function registerBox(
  registry: Pick<CustomElementRegistry, "get" | "define"> = customElements,
): void {
  ViewElement.register(
    [
      Box,
      Div,
      Span,
      Label,
      Footer,
      Article,
      Strong,
      Em,
      Small,
      Pre,
      Details,
      Summary,
    ],
    registry,
  )
}

if (typeof customElements !== "undefined" && !customElements.get(Box.tag)) {
  registerBox()
}
