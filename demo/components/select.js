const helpers = new Map()
for (const root of document.querySelectorAll("[data-select]")) helpers.set(root.id, MarkupUISelect.createSelect(root))
window.selectDemo = { helpers }
const language = helpers.get("language-root"), tools = helpers.get("tools-root")
const form = document.getElementById("selection-form")
const counts = { input: 0, change: 0, clear: 0 }
function render() {
  try { document.getElementById("state").textContent = JSON.stringify(Object.fromEntries([...helpers].map(([id, h]) => [id, h.connected ? h.value : "disconnected"]))) }
  catch (error) { document.getElementById("state").textContent = error.message }
}
function perform(action) { try { action(); render() } catch (error) { document.getElementById("state").textContent = error.message } }
render()
for (const type of ["input", "change", "mui:select-clear"]) language.control.addEventListener(type, () => {
  counts[type === "mui:select-clear" ? "clear" : type]++
  document.getElementById("events").textContent = `Language events: input ${counts.input}, change ${counts.change}, clear ${counts.clear}`
  render()
})
tools.control.addEventListener("change", render)
form.addEventListener("submit", event => {
  event.preventDefault()
  document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(render, 0))
document.getElementById("assign").addEventListener("click", () => perform(() => language.setValue("typescript")))
document.getElementById("none").addEventListener("click", () => perform(() => language.setValue(null)))
document.getElementById("default").addEventListener("click", () => perform(() => {
  for (const option of language.control.options) option.defaultSelected = option.value === "rust"
  language.refresh()
}))
document.getElementById("filter").addEventListener("click", () => perform(() => tools.setFilter("CSS")))
document.getElementById("add").addEventListener("click", event => perform(() => {
  language.control.querySelector("optgroup").append(document.getElementById("option-template").content.cloneNode(true))
  language.refresh(); event.currentTarget.disabled = true
}))
document.getElementById("fieldset").addEventListener("click", () => { const fieldset = document.getElementById("tool-fieldset"); fieldset.disabled = !fieldset.disabled })
document.getElementById("mode").addEventListener("click", () => perform(() => {
  const old = helpers.get("external-root"), control = old.control
  old.disconnect(); control.multiple = !control.multiple; control.size = control.multiple ? 4 : 0
  helpers.set("external-root", MarkupUISelect.createSelect(document.getElementById("external-root")))
}))
document.getElementById("picker").addEventListener("click", () => {
  const result = document.getElementById("picker-result")
  if (typeof language.control.showPicker !== "function") { result.textContent = "Native showPicker is unavailable."; return }
  try { language.control.showPicker(); result.textContent = "Native showPicker requested; the platform owns closing." }
  catch (error) { result.textContent = `${error.name}: ${error.message}` }
})
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("disconnect").addEventListener("click", () => {
  helpers.forEach(helper => helper.disconnect())
  for (const id of ["assign", "none", "default", "filter", "add", "mode", "disconnect"]) document.getElementById(id).disabled = true
  render()
})
