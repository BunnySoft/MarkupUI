export { Table, MTable } from "./table.js"
export { tableSizes } from "./model.js"
export type { TableSize } from "./model.js"

import { Table } from "./table.js"
import { ViewElement } from "../../core/index.js"

export function registerTable(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Table], registry)
}

if (typeof customElements !== "undefined") registerTable()
