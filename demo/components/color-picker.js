const root = document.querySelector("#accent-picker"), form = document.querySelector("#appearance")
const helper = MarkupUIColorPicker.createColorPicker(root)
const validation = MarkupUIForm.createForm(form, { items: [] })
const events = document.querySelector("#events"), output = document.querySelector("#submission")
let inputs = 0, changes = 0
helper.control.addEventListener("input", () => { inputs++; events.textContent = `Color input events: ${inputs}; change events: ${changes}. Not framework confirm/complete callbacks.` })
helper.control.addEventListener("change", () => { changes++; events.textContent = `Color input events: ${inputs}; change events: ${changes}. Not framework confirm/complete callbacks.` })
root.addEventListener("mui:color-picker-error", () => { events.textContent = "Unsupported native anatomy/value; enhancement withdrawn without flattening data." })
document.querySelector("#capability").textContent = `Native showPicker method present: ${typeof helper.control.showPicker === "function"}. No automatic invocation, open-state inference, screen picker or clipboard access.`
function inspect(event) {
  event.preventDefault()
  output.textContent = JSON.stringify([...new FormData(form, event.submitter)], null, 2)
}
form.addEventListener("submit", inspect)
document.querySelector("#set-green").addEventListener("click", () => { helper.setValue("#008844"); validation.refresh() })
document.querySelector("#invalid").addEventListener("click", () => {
  try { helper.setValue("rgba(10, 20, 30, 0.5)") }
  catch { events.textContent = "Unsupported color rejected before mutation; no alpha flattened and no conversion to black." }
})
document.querySelector("#disabled").addEventListener("click", () => { root.disabled = !root.disabled; helper.refresh(); validation.refresh() })
document.querySelector("#cancel").addEventListener("click", () => { form.addEventListener("reset", event => event.preventDefault(), { once: true }) })
document.querySelector("#rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
const tools = ["set-green", "invalid", "disabled", "cancel", "disconnect"]
document.querySelector("#disconnect").addEventListener("click", () => {
  helper.disconnect(); validation.disconnect(); form.removeEventListener("submit", inspect)
  tools.forEach(id => { document.getElementById(id).hidden = true })
})
tools.forEach(id => { document.getElementById(id).hidden = false })
