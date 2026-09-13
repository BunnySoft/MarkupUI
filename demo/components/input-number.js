import { InputNumber } from "../../dist/markup-ui-input-number.js"
import { loadComponentApi } from "../component-api.js"

const quantity = document.getElementById("quantity-root"), form = document.getElementById("numbers")
const counts = { input: 0, change: 0, clear: 0 }
function render() {
  try { document.getElementById("state").textContent = JSON.stringify(quantity.state, null, 2) }
  catch (error) { document.getElementById("state").textContent = `${error.name}: ${error.message}` }
}
function perform(action) { try { action(); render() } catch (error) { document.getElementById("step-error").textContent = `${error.name}: ${error.message}` } }
for (const root of document.querySelectorAll("m-input-number")) {
  if (!(root instanceof InputNumber)) throw new Error("InputNumber did not register.")
  root.refresh()
}
render()
for (const type of ["input", "change", "m:input-number-clear"]) quantity.native.addEventListener(type, () => {
  counts[type === "m:input-number-clear" ? "clear" : type]++
  document.getElementById("events").textContent = `Quantity events: input ${counts.input}, change ${counts.change}, clear ${counts.clear}`
  render()
})
form.addEventListener("submit", event => { event.preventDefault(); document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2) })
form.addEventListener("reset", () => setTimeout(render, 0))
document.getElementById("off-grid").addEventListener("click", () => perform(() => { quantity.value = .15 }))
document.getElementById("out-of-range").addEventListener("click", () => perform(() => { quantity.value = 2 }))
document.getElementById("blank").addEventListener("click", () => perform(() => { quantity.value = null }))
document.getElementById("defaults").addEventListener("click", () => perform(() => { quantity.defaultValue = "0.4" }))
document.getElementById("readonly").addEventListener("click", () => perform(() => { quantity.readOnly = !quantity.readOnly }))
document.getElementById("fieldset").addEventListener("click", () => { const fieldset = document.getElementById("grid-fieldset"); fieldset.disabled = !fieldset.disabled })
document.getElementById("bounds").addEventListener("click", () => perform(() => { quantity.max = quantity.max === "1" ? "0.3" : "1" }))
document.getElementById("any-step").addEventListener("click", () => perform(() => document.getElementById("any-root").stepUp()))
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("theme").addEventListener("click", () => { document.documentElement.dataset.mTheme = document.documentElement.dataset.mTheme === "dark" ? "light" : "dark" })
document.getElementById("adopt").addEventListener("click", event => perform(() => {
  const host = document.getElementById("late-root"), control = document.createElement("input")
  control.type = "number"; control.defaultValue = "2"
  host.value = 7
  host.append(control); host.refresh()
  document.getElementById("lifecycle-state").textContent = `Authored owner retained: ${host.native === control}; value ${host.value}, reset default ${host.defaultValue}.`
  event.currentTarget.disabled = true
}))
document.getElementById("reconnect").addEventListener("click", () => perform(() => {
  const next = quantity.nextSibling, parent = quantity.parentNode, control = quantity.native
  quantity.remove(); quantity.value = .6; parent.insertBefore(quantity, next); quantity.refresh()
  document.getElementById("lifecycle-state").textContent = `Same native owner after reconnect: ${quantity.native === control}; value ${quantity.value}.`
}))
void loadComponentApi(document.getElementById("input-number-api"), new URL("../api/input-number.json", import.meta.url))
