import { createDataTable } from "../../dist/markup-ui-data-table.js"

const root = document.querySelector("[data-data-table]")
const form = document.querySelector("#scores-form")
const feedback = document.querySelector("#feedback")
const score = row => row.querySelector('input[type="number"]').valueAsNumber
const project = row => row.cells[1].textContent
const total = rows => String(rows.reduce((sum, row) => sum + (Number.isFinite(score(row)) ? score(row) : 0), 0))
root.querySelector("[data-data-check-all]").disabled = false
const table = createDataTable(root, {
  columns: [
    { key: "project", compare: (a, b) => project(a).localeCompare(project(b)), filter: (row, value) => project(row).toLowerCase().includes(value.toLowerCase()) },
    { key: "category", filter: (row, value) => row.cells[2].textContent === value },
    { key: "score", compare: (a, b) => {
      const left = score(a), right = score(b)
      if (!Number.isFinite(left) || !Number.isFinite(right)) throw new TypeError("Finish numeric score edits before sorting.")
      return left - right
    } },
  ],
  summaries: [{ key: "page", scope: "page", value: total }, { key: "filtered", scope: "filtered", value: total }],
})
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
root.addEventListener("mui:data-table-change", event => { feedback.textContent = JSON.stringify({ source: event.detail.source, ...event.detail.state }, null, 2) })
root.addEventListener("mui:data-table-error", event => { feedback.textContent = event.detail.error.message })
const actions = {
  "select-filtered": () => table.select("filtered", true),
  "clear-all": () => table.select("all", false),
  reveal: () => table.reveal("charlie"),
  "reveal-all": () => table.revealAll(),
  refresh: () => table.refresh(),
  loading: () => table.set({ loading: !table.state.loading }),
  rtl: () => { root.dir = root.dir === "rtl" ? "ltr" : "rtl" },
  disconnect: () => {
    table.disconnect()
    document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = true })
    root.querySelector("[data-data-check-all]").disabled = true
    feedback.textContent = "Enhancement disconnected. Current native rows, edits and checkedness remain; filtering is released. Application submission gate has ended."
  },
}
for (const [name, action] of Object.entries(actions)) root.querySelector(`[data-${name}]`).addEventListener("click", () => {
  try { action() } catch (error) { feedback.textContent = error.message }
})
root.querySelector("[data-note-action]").addEventListener("click", () => {
  root.querySelector('[name="alpha-note"]').value = "Reviewed without replacing this row"
})
form.addEventListener("submit", event => {
  event.preventDefault()
  if (!table.connected) return
  try {
    table.revealAll()
    if (!form.reportValidity()) { feedback.textContent = "All rows revealed. Resolve native field errors before saving."; return }
    feedback.textContent = JSON.stringify({ checkedKeys: table.state.checkedKeys, nativeFormData: [...new FormData(form)] }, null, 2)
  } catch (error) { feedback.textContent = error.message }
})
globalThis.dataTableDemo = table
