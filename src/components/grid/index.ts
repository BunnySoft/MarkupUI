export { Grid } from "./grid.js"
export { GridItem } from "./item.js"
export type { GridAlign, GridJustify } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { Grid } from "./grid.js"
import { GridItem } from "./item.js"

export function registerGrid(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Grid, GridItem], registry)
}

if (typeof customElements !== "undefined") registerGrid()
