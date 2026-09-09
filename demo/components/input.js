const helpers = new Map()
for (const root of document.querySelectorAll("[data-input]")) {
  helpers.set(root.id, MarkupUIInput.createInput(root))
}
// Deliberately exposed for local acceptance; values never leave this page.
window.inputDemo = { helpers }
const title = document.getElementById("title")
const entry = document.getElementById("entry")
const counts = { input: 0, change: 0, clear: 0 }
for (const type of ["input", "change", "mui:input-clear"]) {
  title.addEventListener(type, () => {
    counts[type === "mui:input-clear" ? "clear" : type]++
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
document.getElementById("programmatic").addEventListener("click", () => { title.value = "Assigned silently"; helpers.get("title-root").refresh() })
document.getElementById("new-default").addEventListener("click", () => { title.defaultValue = "New reset default" })
document.getElementById("cancel-reset").addEventListener("click", () => { entry.addEventListener("reset", event => event.preventDefault(), { once: true }) })
document.getElementById("dispose").addEventListener("click", () => { helpers.forEach(helper => helper.disconnect()) })
