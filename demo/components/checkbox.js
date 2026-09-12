import "../../dist/markup-ui-checkbox.js"
import { loadComponentApi } from "../component-api.js"

await Promise.all(["m-checkbox", "m-checkbox-group"].map(tag => customElements.whenDefined(tag)))
const topics = document.getElementById("topics")
const delivery = document.getElementById("delivery")
const nested = document.getElementById("nested")
window.checkboxDemo = { topics, delivery, nested }
document.getElementById("mixed-root").indeterminate = true
const form = document.getElementById("choices-form")
let changes = 0
function renderState() {
  document.getElementById("state").textContent = JSON.stringify({ value: topics.value, min: topics.min, max: topics.max, withinLimits: topics.withinLimits })
}
renderState()
topics.addEventListener("m:checkbox-group-change", () => {
  document.getElementById("event-count").textContent = `Accepted group changes: ${++changes}`
  renderState()
})
form.addEventListener("submit", event => {
  event.preventDefault()
  document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(renderState, 0))
document.getElementById("toggle-fieldset").addEventListener("click", () => { topics.disabled = !topics.disabled })
document.getElementById("toggle-mixed").addEventListener("click", () => {
  const checkbox = document.getElementById("mixed-root"); checkbox.indeterminate = !checkbox.indeterminate
})
document.getElementById("default").addEventListener("click", () => {
  const checkbox = document.getElementById("alpha-root"); checkbox.defaultChecked = !checkbox.defaultChecked; renderState()
})
document.getElementById("silent").addEventListener("click", () => { topics.value = ["beta"]; renderState() })
document.getElementById("add").addEventListener("click", event => {
  document.getElementById("topic-items").append(document.getElementById("topic-template").content.cloneNode(true))
  topics.refresh(); event.currentTarget.disabled = true; renderState()
})
document.getElementById("limits").addEventListener("click", () => { topics.max = topics.max === 2 ? 3 : 2; renderState() })
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("reconnect").addEventListener("click", () => {
  const parent = topics.parentNode, next = topics.nextSibling
  topics.remove(); parent.insertBefore(topics, next)
  topics.refresh(); renderState()
})
await loadComponentApi(document.getElementById("checkbox-api"), new URL("../api/checkbox.json", import.meta.url))
