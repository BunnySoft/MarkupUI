import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIDataTable
  if (!api) throw new Error("DataTable runtime did not load.")
  void loadComponentApi(document.getElementById("data-table-api"), new URL("../api/data-table.json", import.meta.url))

  const root = document.querySelector("#demo-data-table")
  if (!root) return
  const feedback = document.querySelector("#feedback")
  const score = row => {
    const val = Number(row.cells[2]?.textContent)
    return Number.isFinite(val) ? val : 0
  }
  const name = row => row.cells[1]?.textContent ?? ""
  const total = rows => String(rows.reduce((sum, row) => sum + score(row), 0))

  const checkAll = root.querySelector("[data-data-check-all]")
  if (checkAll) checkAll.disabled = false

  try {
    const table = api.createDataTable(root, {
      columns: [
        { key: "name", filter: (row, value) => name(row).toLowerCase().includes(value.toLowerCase()) },
        { key: "score", compare: (a, b) => score(a) - score(b) },
      ],
      summaries: [{ key: "total", scope: "page", value: total }],
    })

    root.addEventListener("m:data-table-change", event => {
      if (feedback) feedback.textContent = JSON.stringify({ source: event.detail.source, ...event.detail.state }, null, 2)
    })
    root.addEventListener("m:data-table-error", event => {
      if (feedback) feedback.textContent = event.detail.error.message
    })

    globalThis.dataTableDemo = table
  } catch (error) {
    if (feedback) feedback.textContent = error.message
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

