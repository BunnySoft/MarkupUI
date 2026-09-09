const topics = MarkupUICheckbox.createCheckboxGroup(document.getElementById("topics"), { min: 1, max: 2 })
const delivery = MarkupUICheckbox.createCheckboxGroup(document.getElementById("delivery"))
const nested = MarkupUICheckbox.createCheckboxGroup(document.getElementById("nested"), { max: 1 })
window.checkboxDemo = { topics, delivery, nested }
document.getElementById("mixed").indeterminate = true
const form = document.getElementById("choices-form")
let changes = 0
function renderState() {
  document.getElementById("state").textContent = topics.connected
    ? JSON.stringify(topics.state) : "Group helpers disconnected; native controls still work."
}
renderState()
document.getElementById("topics").addEventListener("mui:checkbox-group-change", () => {
  document.getElementById("event-count").textContent = `Accepted group changes: ${++changes}`
  renderState()
})
form.addEventListener("submit", event => {
  event.preventDefault()
  document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(renderState, 0))
document.getElementById("toggle-fieldset").addEventListener("click", () => {
  const fieldset = document.getElementById("topics"); fieldset.disabled = !fieldset.disabled
})
document.getElementById("toggle-mixed").addEventListener("click", () => {
  const control = document.getElementById("mixed"); control.indeterminate = !control.indeterminate
})
document.getElementById("default").addEventListener("click", () => {
  const control = document.getElementById("alpha"); control.defaultChecked = !control.defaultChecked
})
document.getElementById("silent").addEventListener("click", () => { topics.setValues(["beta"]); renderState() })
document.getElementById("add").addEventListener("click", event => {
  document.getElementById("topic-items").append(document.getElementById("topic-template").content.cloneNode(true))
  topics.refresh(); event.currentTarget.disabled = true; renderState()
})
document.getElementById("limits").addEventListener("click", () => {
  topics.setLimits({ max: topics.state.max === 2 ? 3 : 2 }); renderState()
})
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("disconnect").addEventListener("click", () => {
  topics.disconnect(); delivery.disconnect(); nested.disconnect(); renderState()
  for (const id of ["silent", "add", "limits", "disconnect"]) document.getElementById(id).disabled = true
})
