const helpers = new Map()
for (const root of document.querySelectorAll("[data-switch]")) helpers.set(root.id, MarkupUISwitch.createSwitch(root))
window.switchDemo = { helpers }
const alerts = helpers.get("alerts-switch")
const form = document.getElementById("settings")
const counts = { input: 0, change: 0 }
function renderState() {
  document.getElementById("state").textContent = JSON.stringify({
    connected: alerts.connected, checked: alerts.control.checked, defaultChecked: alerts.control.defaultChecked,
    value: alerts.control.value, defaultValue: alerts.control.defaultValue, loading: alerts.loading
  })
}
renderState()
for (const type of ["input", "change"]) alerts.control.addEventListener(type, () => {
  counts[type]++
  document.getElementById("events").textContent = `Native alerts events: input ${counts.input}, change ${counts.change}`
  renderState()
})
form.addEventListener("submit", event => {
  event.preventDefault()
  document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(renderState, 0))
document.getElementById("busy").addEventListener("click", () => { alerts.setLoading(!alerts.loading); renderState() })
document.getElementById("silent").addEventListener("click", () => { alerts.setChecked(!alerts.control.checked); renderState() })
document.getElementById("default").addEventListener("click", () => { alerts.control.defaultChecked = !alerts.control.defaultChecked; alerts.refresh(); renderState() })
document.getElementById("token").addEventListener("click", () => { alerts.control.defaultValue = "updated-token"; alerts.refresh(); renderState() })
document.getElementById("fieldset").addEventListener("click", () => {
  const fieldset = document.getElementById("preferences"); fieldset.disabled = !fieldset.disabled
})
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("disconnect").addEventListener("click", () => {
  helpers.forEach(helper => helper.disconnect())
  for (const id of ["busy", "silent", "default", "token", "disconnect"]) document.getElementById(id).disabled = true
  renderState()
})
