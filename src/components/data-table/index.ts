export { DataTable, dataTableSizes } from "./data-table-element.js"
export type { DataTableSize, DataTableField, DataTableRecord, DataTableDefinition } from "./data-table-element.js"
export type { DataTableColumn, DataTableSummary, DataTableSort, DataTableValues, DataTableState, DataTableScope, DataTableChange } from "./data-table.js"

import { DataTable } from "./data-table-element.js"
import { ViewElement } from "../../core/index.js"

export function registerDataTable(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([DataTable], registry)
}

if (typeof customElements !== "undefined") registerDataTable()
