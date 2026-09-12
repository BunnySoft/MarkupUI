import "../../dist/markup-ui-input.js"
import { loadComponentApi } from "../component-api.js"

await customElements.whenDefined("m-input")
const title = document.getElementById("title-root")
const entry = document.getElementById("entry")
const counts = { input: 0, change: 0, clear: 0 }
for (const type of ["input", "change", "m:input-clear"]) {
  title.addEventListener(type, () => {
    counts[type === "m:input-clear" ? "clear" : type]++
    document.getElementById("events").textContent = `Title events: input ${counts.input}, change ${counts.change}, clear ${counts.clear}`
  })
}
entry.addEventListener("submit", event => {
  event.preventDefault()
  document.getElementById("submission").textContent = JSON.stringify([...new FormData(entry)], null, 2)
})
document.getElementById("toggle-fieldset").addEventListener("click", () => {
  const fieldset = document.getElementById("controls-fieldset")
  fieldset.disabled = !fieldset.disabled
})
document.getElementById("toggle-readonly").addEventListener("click", () => { title.readOnly = !title.readOnly })
document.getElementById("toggle-rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("programmatic").addEventListener("click", () => { title.value = "Assigned silently" })
document.getElementById("new-default").addEventListener("click", () => { title.defaultValue = "New reset default" })
document.getElementById("cancel-reset").addEventListener("click", () => { entry.addEventListener("reset", event => event.preventDefault(), { once: true }) })
document.getElementById("validate").addEventListener("click", () => title.reportValidity())
document.getElementById("reconnect").addEventListener("click", () => {
  const native = title.native, next = title.nextSibling, parent = title.parentNode
  title.remove()
  parent.insertBefore(title, next)
  document.getElementById("lifecycle-status").textContent = `Native owner retained: ${title.native === native}.`
})
document.getElementById("late-content").addEventListener("click", () => {
  const suffix = document.createElement("span")
  suffix.textContent = "Suffix"
  title.append(suffix)
})
await loadComponentApi(document.getElementById("input-api"), new URL("../api/input.json", import.meta.url))
