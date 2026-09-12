import { loadComponentApi } from "../component-api.js"
import { Switch } from "../../dist/markup-ui-switch.js"

await customElements.whenDefined(Switch.tag)
void loadComponentApi(document.getElementById("switch-api"), new URL("../api/switch.json", import.meta.url))
const alerts = document.getElementById("alerts-switch")
const form = document.getElementById("settings")
const counts = { input: 0, change: 0 }
function renderState() {
  document.getElementById("state").textContent = JSON.stringify({
    connected: alerts.isConnected, checked: alerts.checked, defaultChecked: alerts.defaultChecked,
    value: alerts.value, defaultValue: alerts.defaultValue, loading: alerts.loading
  })
}
renderState()
for (const type of ["input", "change"]) alerts.addEventListener(type, () => {
  counts[type]++
  document.getElementById("events").textContent = `Native alerts events: input ${counts.input}, change ${counts.change}`
  renderState()
})
form.addEventListener("submit", event => {
  event.preventDefault()
  document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(renderState, 0))
document.getElementById("busy").addEventListener("click", () => { alerts.loading = !alerts.loading; renderState() })
document.getElementById("silent").addEventListener("click", () => { alerts.checked = !alerts.checked; renderState() })
document.getElementById("default").addEventListener("click", () => { alerts.defaultChecked = !alerts.defaultChecked; renderState() })
document.getElementById("token").addEventListener("click", () => { alerts.defaultValue = "updated-token"; renderState() })
document.getElementById("fieldset").addEventListener("click", () => {
  const fieldset = document.getElementById("preferences"); fieldset.disabled = !fieldset.disabled
})
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("theme").addEventListener("click", () => {
  const root = document.documentElement; root.dataset.mTheme = root.dataset.mTheme === "dark" ? "light" : "dark"
})
const late = document.getElementById("late-switch")
document.getElementById("adopt").addEventListener("click", event => {
  const input = document.createElement("input")
  input.type = "checkbox"; input.name = "late"; input.value = "authored"; input.defaultChecked = true; input.checked = false
  late.append(input); late.refresh()
  document.getElementById("lifecycle-state").textContent = `Original authored input adopted: ${late.native === input}; checked ${late.checked}; default ${late.defaultChecked}`
  event.currentTarget.disabled = true
})
document.getElementById("reconnect").addEventListener("click", () => {
  const parent = late.parentNode, next = late.nextSibling, input = late.native
  late.remove(); late.checked = !late.checked; parent.insertBefore(late, next)
  document.getElementById("lifecycle-state").textContent = `Same native input: ${late.native === input}; checked ${late.checked}`
})
