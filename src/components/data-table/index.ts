export { DataTable, MDataTable, dataTableSizes } from "./data-table-element.js"
export type { DataTableSize } from "./data-table-element.js"
export { createDataTable } from "./data-table.js"
export type { DataTableColumn, DataTableSummary, DataTableSort, DataTableValues, DataTableOptions, DataTableState, DataTableScope, DataTableController, DataTableChange } from "./data-table.js"

import { DataTable } from "./data-table-element.js"
import { ViewElement } from "../../core/index.js"

export function registerDataTable(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([DataTable], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(DataTable.tag)) registerDataTable()

