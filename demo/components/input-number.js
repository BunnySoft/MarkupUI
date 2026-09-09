const helpers = new Map()
for (const root of document.querySelectorAll("[data-input-number]")) helpers.set(root.id, MarkupUIInputNumber.createInputNumber(root))
window.numberDemo = { helpers }
const quantity = helpers.get("quantity-root"), form = document.getElementById("numbers")
const counts = { input: 0, change: 0, clear: 0 }
function render() {
  try { document.getElementById("state").textContent = JSON.stringify(quantity.connected ? quantity.state : "Helpers disconnected", null, 2) }
  catch (error) { document.getElementById("state").textContent = `${error.name}: ${error.message}` }
}
function perform(action) { try { action(); render() } catch (error) { document.getElementById("step-error").textContent = `${error.name}: ${error.message}` } }
render()
for (const type of ["input", "change", "mui:input-number-clear"]) quantity.control.addEventListener(type, () => {
  counts[type === "mui:input-number-clear" ? "clear" : type]++
  document.getElementById("events").textContent = `Quantity events: input ${counts.input}, change ${counts.change}, clear ${counts.clear}`
  render()
})
form.addEventListener("submit", event => { event.preventDefault(); document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2) })
form.addEventListener("reset", () => setTimeout(render, 0))
document.getElementById("off-grid").addEventListener("click", () => perform(() => quantity.setValue(.15)))
document.getElementById("out-of-range").addEventListener("click", () => perform(() => quantity.setValue(2)))
document.getElementById("blank").addEventListener("click", () => perform(() => quantity.setValue(null)))
document.getElementById("defaults").addEventListener("click", () => perform(() => { quantity.control.defaultValue = "0.4"; quantity.refresh() }))
document.getElementById("readonly").addEventListener("click", () => perform(() => { quantity.control.readOnly = !quantity.control.readOnly; quantity.refresh() }))
document.getElementById("fieldset").addEventListener("click", () => { const fieldset = document.getElementById("grid-fieldset"); fieldset.disabled = !fieldset.disabled })
document.getElementById("bounds").addEventListener("click", () => perform(() => { quantity.control.max = quantity.control.max === "1" ? "0.3" : "1"; quantity.refresh() }))
document.getElementById("any-step").addEventListener("click", () => perform(() => helpers.get("any-root").step(1)))
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("disconnect").addEventListener("click", () => {
  helpers.forEach(helper => helper.disconnect())
  for (const id of ["off-grid", "out-of-range", "blank", "defaults", "readonly", "bounds", "any-step", "disconnect"]) document.getElementById(id).disabled = true
  render()
})
