import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUIDataTable) throw new Error("Data Table runtime did not load.")
  void loadComponentApi(document.getElementById("data-table-api"), new URL("../api/data-table.json", import.meta.url))
  const table = document.getElementById("demo-data-table")
  table.options = {
    columns: [{ key: "name", label: "Name", filterable: true }, { key: "score", label: "Score", sort: "number" }],
    selection: { name: "keys", scope: "page" }, pageSizes: [2, 4], pageSize: 2,
    summaries: [{ key: "Page total", scope: "page", value: rows => String(rows.reduce((sum, row) => sum + row.values[1], 0)) }],
  }
  table.data = [
    { key: "alpha", values: ["Alpha", 10] }, { key: "bravo", values: ["Bravo", 2] },
    { key: "charlie", values: ["Charlie", 8], checked: true },
    { key: "delta", values: ["Delta", 30], checked: true, disabled: true },
  ]
  table.addEventListener("m:data-table-change", event => {
    document.getElementById("feedback").textContent = `${event.detail.source}: ${event.detail.state.visibleKeys.join(", ")}`
  })
  table.addEventListener("m:data-table-error", event => {
    document.getElementById("feedback").textContent = event.detail.error.message
  })
  document.getElementById("scores-form").addEventListener("submit", event => {
    event.preventDefault()
    document.getElementById("submission").textContent = JSON.stringify([...new FormData(event.target)])
  })
  document.getElementById("update-data").addEventListener("click", () => {
    table.data = table.data.map(row => row.key === "alpha" ? { ...row, values: ["Alpha", 12] } : row)
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
