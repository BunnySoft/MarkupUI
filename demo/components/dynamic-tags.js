const root = document.querySelector("#topics"), form = document.querySelector("#tags-form")
const editor = document.querySelector("#draft"), events = document.querySelector("#events")
const tags = MarkupUIDynamicTags.createDynamicTags(root, {
  max: 4,
  create(value) {
    if (value === "fail") throw new Error("Simulated local creation failure")
    return value
  },
})
const validation = MarkupUIForm.createForm(form, { items: [{
  key: "tags", controls: [editor], feedback: document.querySelector("#tags-error"),
  validator: () => tags.values.length ? null : { message: "Add at least one tag before this local inspection." },
}] })
let changes = 0, intent = 0
root.addEventListener("mui:dynamic-tags-change", event => {
  validation.refresh()
  events.textContent = `Changes: ${++changes}; ${event.detail.type}; current stable keys: ${tags.tags.map(tag => tag.key).join(", ")}.`
})
root.addEventListener("mui:dynamic-tags-error", event => {
  events.textContent = `Creation/resource error: ${event.detail.error instanceof Error ? event.detail.error.message : String(event.detail.error)}`
})
async function inspect(event) {
  event.preventDefault()
  const current = ++intent, submitter = event.submitter
  try {
    const result = await validation.validate({ reason: "submit" })
    if (current !== intent || result.status !== "valid" || !result.current) return
    document.querySelector("#submission").textContent = JSON.stringify([...new FormData(form, submitter)], null, 2)
  } catch (error) { events.textContent = error instanceof Error ? error.message : String(error) }
}
form.addEventListener("submit", inspect)
document.querySelector("#validate").addEventListener("click", async () => {
  const result = await validation.validate()
  events.textContent = `Local validation: ${result.status}. Native readonly tag fields are not a group-minimum validation anchor.`
})
document.querySelector("#silent").addEventListener("click", () => {
  editor.value = "kept draft"; tags.refresh(); validation.refresh()
})
document.querySelector("#disabled").addEventListener("click", () => { root.disabled = !root.disabled; tags.refresh(); validation.refresh() })
document.querySelector("#readonly").addEventListener("click", () => { editor.readOnly = !editor.readOnly; tags.refresh(); validation.refresh() })
document.querySelector("#rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
const tools = ["validate", "silent", "disabled", "readonly", "disconnect"]
document.querySelector("#disconnect").addEventListener("click", () => {
  intent++; tags.disconnect(); validation.disconnect(); form.removeEventListener("submit", inspect)
  tools.forEach(id => { document.getElementById(id).hidden = true })
  events.textContent = "Current native tags remain. Draft values/defaults remain native; hidden dynamic actions no longer run."
})
tools.forEach(id => { document.getElementById(id).hidden = false })
