import "../../dist/markup-ui-select.js"
import { loadComponentApi } from "../component-api.js"

const elements = new Map([...document.querySelectorAll("m-select[id]")].map(element => [element.id, element]))
const language = elements.get("language-root"), tools = elements.get("tools-root"), late = elements.get("late-root")
const form = document.getElementById("selection-form")
const counts = { input: 0, change: 0, clear: 0 }
const output = document.getElementById("state")
window.selectDemo = { elements }
function render() {
  output.textContent = JSON.stringify(Object.fromEntries([...elements].map(([id, element]) => [id, { value: element.value, selectedIndex: element.selectedIndex, valid: element.validity.valid }])), null, 2)
}
function perform(action) { try { action(); render() } catch (error) { output.textContent = `${error.name}: ${error.message}` } }
for (const element of elements.values()) element.addEventListener("m:select-error", event => { output.textContent = event.detail.message })
for (const type of ["input", "change", "m:select-clear"]) language.native.addEventListener(type, () => {
  counts[type === "m:select-clear" ? "clear" : type]++
  document.getElementById("events").textContent = `Language events: input ${counts.input}, change ${counts.change}, clear ${counts.clear}`
  render()
})
tools.native.addEventListener("change", render)
form.addEventListener("submit", event => {
  event.preventDefault()
  document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(render, 0))
document.getElementById("assign").addEventListener("click", () => perform(() => { language.value = "typescript" }))
document.getElementById("none").addEventListener("click", () => perform(() => { language.value = null }))
document.getElementById("default").addEventListener("click", () => perform(() => {
  for (const option of language.options) option.defaultSelected = option.value === "rust"
  language.refresh()
}))
document.getElementById("filter").addEventListener("click", () => perform(() => tools.setFilter("CSS")))
document.getElementById("add").addEventListener("click", event => perform(() => {
  const option = new Option("Python", "python")
  language.native.querySelector("optgroup").append(option)
  language.refresh(); event.currentTarget.disabled = true
}))
document.getElementById("fieldset").addEventListener("click", () => { const fieldset = document.getElementById("tool-fieldset"); fieldset.disabled = !fieldset.disabled })
document.getElementById("mode").addEventListener("click", () => perform(() => {
  const element = elements.get("external-root")
  element.multiple = !element.multiple
  element.listSize = element.multiple ? 4 : 0
}))
document.getElementById("picker").addEventListener("click", () => {
  const result = document.getElementById("picker-result")
  try { language.showPicker(); result.textContent = "Native showPicker requested; the platform owns closing." }
  catch (error) { result.textContent = `${error.name}: ${error.message}` }
})
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("theme").addEventListener("click", () => { document.documentElement.dataset.mTheme = document.documentElement.dataset.mTheme === "dark" ? "light" : "dark" })
document.getElementById("adopt").addEventListener("click", event => perform(() => {
  const control = document.createElement("select")
  control.append(new Option("Late A", "a", true), new Option("Late B", "b"))
  late.append(control); late.refresh()
  document.getElementById("lifecycle-state").textContent = `Original authored owner adopted: ${late.native === control}`
  event.currentTarget.disabled = true
}))
document.getElementById("reconnect").addEventListener("click", () => perform(() => {
  const parent = language.parentNode, next = language.nextSibling, native = language.native
  language.remove(); language.value = "go"; parent.insertBefore(language, next); language.refresh()
  document.getElementById("lifecycle-state").textContent = `Native identity retained: ${language.native === native}; value: ${language.value}`
}))
render()
loadComponentApi(document.getElementById("select-api"), "../api/select.json").catch(error => { output.textContent = `API documentation failed: ${error.message}` })
