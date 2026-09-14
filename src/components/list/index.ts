export { List } from "./list.js"
export { ListItem } from "./item.js"
export { listSizes } from "./model.js"
export type { ListSize } from "./model.js"

import { ViewElement } from "../../core/index.js"
import { List } from "./list.js"
import { ListItem } from "./item.js"

export function registerList(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([List, ListItem], registry)
}

if (typeof customElements !== "undefined") registerList()
