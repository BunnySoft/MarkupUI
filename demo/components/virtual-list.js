const { createVirtualList } = MarkupUIVirtualList
const large = document.querySelector("#large"), editors = document.querySelector("#editors")
const template = document.querySelector("#text-row"), editorTemplate = document.querySelector("#editor-row")
const items = Array.from({ length: 100000 }, (_, id) => ({ id, text: `Item ${id + 1}` }))
let editorItems = Array.from({ length: 200 }, (_, id) => ({ id, value: `Draft ${id + 1}`, mode: "One", note: "" }))
large.hidden = false; editors.hidden = false
const list = createVirtualList(large, {
  items, rowSize: 32, overscan: 3, key: item => item.id,
  render(item) { const row = document.importNode(template.content.firstElementChild, true); row.firstElementChild.textContent = item.text; return row },
  update(row, item) { row.firstElementChild.textContent = item.text },
})
const cleanup = new WeakMap()
function bindEditor(row, item) {
  const input = row.querySelector("input"), select = row.querySelector("select"), note = row.querySelector("textarea")
  row.querySelector("span").textContent = `#${item.id + 1}`
  // Updating caller data on input/change makes remounting honest. Do not reset an active editor.
  for (const [control, field] of [[input, "value"], [select, "mode"], [note, "note"]]) {
    control.name = `${field}[${item.id}]`
    if (document.activeElement !== control) control.value = item[field]
  }
}
const editable = createVirtualList(editors, {
  items: editorItems, rowSize: 48, overscan: 2, key: item => item.id,
  render(item) {
    const row = document.importNode(editorTemplate.content.firstElementChild, true); bindEditor(row, item)
    const save = () => { item.value = row.querySelector("input").value; item.mode = row.querySelector("select").value; item.note = row.querySelector("textarea").value }
    row.addEventListener("input", save); row.addEventListener("change", save)
    cleanup.set(row, () => { row.removeEventListener("input", save); row.removeEventListener("change", save) })
    return row
  },
  update: bindEditor,
  dispose(row) { cleanup.get(row)?.(); cleanup.delete(row) },
})
const metrics = () => { document.querySelector("#metrics").textContent = JSON.stringify({ ...list.state, scrollTop: large.scrollTop, clientHeight: large.clientHeight, scrollHeight: large.scrollHeight }) }
large.addEventListener("scroll", () => requestAnimationFrame(metrics), { passive: true })
function action(id, callback) { document.getElementById(id).addEventListener("click", () => { callback(); metrics() }) }
action("start", () => list.scrollTo({ position: "top" }))
action("middle", () => list.scrollTo({ index: 50000 }))
action("end", () => list.scrollTo({ key: 99999, align: "end" }))
action("resize", () => { large.classList.toggle("short"); list.refresh() })
action("hide", () => { large.hidden = !large.hidden; list.refresh() })
action("update", () => { for (const item of items) item.text = `Updated item ${item.id + 1}`; list.setItems(items) })
action("rtl", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
action("edit-end", () => editable.scrollTo({ position: "bottom" }))
action("reverse", () => { editorItems = [...editorItems].reverse(); editable.setItems(editorItems) })
action("remove-first", () => { editorItems = editorItems.filter(item => item.id !== 0); editable.setItems(editorItems) })
action("disconnect", () => {
  list.disconnect(); editable.disconnect()
  document.querySelector("#tools").hidden = true; document.querySelector("#editor-tools").hidden = true
  large.hidden = true; editors.hidden = true
  document.querySelector("#events").textContent = "Disconnected; rows/observers/listeners and owned geometry released. Static sample remains."
})
document.querySelector("#editor-form").addEventListener("submit", event => {
  event.preventDefault(); document.querySelector("#submission").textContent = JSON.stringify([...new FormData(event.currentTarget)], null, 2)
})
for (const root of [large, editors]) root.addEventListener("mui:virtual-list-error", event => { document.querySelector("#events").textContent = `Virtual List stopped: ${event.detail.error.message}` })
document.querySelector("#tools").hidden = false; document.querySelector("#editor-tools").hidden = false
metrics()
window.virtualListDemo = { list, editable, items, get editorItems() { return editorItems }, metrics }
