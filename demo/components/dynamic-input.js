const root = document.querySelector("#properties"), form = document.querySelector("#settings")
const state = document.querySelector("#state"), outcome = document.querySelector("#outcome")
let rejectNext = false, resources = 0
const collection = MarkupUIDynamicInput.createDynamicInput(root, {
  min: 1, max: 4,
  initialize() {
    if (rejectNext) { rejectNext = false; throw new Error("Local initializer intentionally rejected this row.") }
  },
  connect(row, { onCleanup }) {
    for (const wrapper of row.querySelectorAll("[data-input]")) {
      const helper = MarkupUIInput.createInput(wrapper); resources++
      onCleanup(() => { helper.disconnect(); resources-- })
    }
  },
})
const coordinator = MarkupUIForm.createForm(form, { items: [] })
function summary() {
  state.textContent = `Rows: ${collection.rows.map(row => row.key).join(", ")}. Bounds: ${collection.min}–${collection.max}. Active Input resources: ${resources}.`
}
root.addEventListener("mui:dynamic-input-change", event => {
  coordinator.refresh()
  summary()
  outcome.textContent = `Committed ${event.detail.type}; native controls and literal names retained.`
})
root.addEventListener("mui:dynamic-input-error", event => {
  summary()
  outcome.textContent = `${event.detail.committed ? "Committed action with cleanup failure" : "Action failed"}: ${event.detail.error instanceof Error ? event.detail.error.message : String(event.detail.error)}`
})
function attempt(callback) {
  try { callback(); summary() } catch (error) { outcome.textContent = error instanceof Error ? error.message : String(error) }
}
document.querySelector("#program-add").addEventListener("click", () => attempt(() => collection.add()))
document.querySelector("#move-first").addEventListener("click", () => attempt(() => collection.move(collection.rows[0].key, collection.rows.length - 1)))
document.querySelector("#bounds").addEventListener("click", () => attempt(() => collection.setBounds(1, collection.max === 4 ? 2 : 4)))
document.querySelector("#disabled").addEventListener("click", () => {
  root.disabled = !root.disabled; collection.refresh(); coordinator.refresh()
})
document.querySelector("#validate").addEventListener("click", () => coordinator.reportValidity())
document.querySelector("#fail").addEventListener("click", () => { rejectNext = true; outcome.textContent = "Next new row will fail before insertion." })
document.querySelector("#rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
function inspect(event) {
  event.preventDefault()
  document.querySelector("#submission").textContent = JSON.stringify([...new FormData(form, event.submitter)], null, 2)
}
form.addEventListener("submit", inspect)
const tools = ["program-add", "move-first", "bounds", "disabled", "validate", "fail", "disconnect"]
document.querySelector("#disconnect").addEventListener("click", () => {
  collection.disconnect(); coordinator.disconnect(); form.removeEventListener("submit", inspect)
  tools.forEach(id => { document.getElementById(id).hidden = true })
  summary(); outcome.textContent = "Helpers disconnected; current edited rows remain. Native reset will not restore deleted rows."
})
tools.forEach(id => { document.getElementById(id).hidden = false })
summary()
