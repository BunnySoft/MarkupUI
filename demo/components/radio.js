import "../../dist/markup-ui-radio.js"
import { loadComponentApi } from "../component-api.js"

await Promise.all(["m-radio", "m-radio-group", "m-radio-button"].map(tag => customElements.whenDefined(tag)))
const plans = document.getElementById("plans"), layouts = document.getElementById("layouts")
const form = document.getElementById("subscription")
window.radioDemo = { plans, layouts, external: document.getElementById("external"), billing: document.getElementById("billing") }
let changes = 0
function renderState() {
  try { document.getElementById("state").textContent = JSON.stringify({ value: plans.value, name: plans.name, form: plans.form?.id ?? null }) }
  catch (error) { document.getElementById("state").textContent = error.message }
}
function action(id, callback) {
  document.getElementById(id).addEventListener("click", event => {
    try { callback(event); renderState() }
    catch (error) { document.getElementById("state").textContent = error.message }
  })
}
renderState()
plans.addEventListener("m:radio-group-change", () => {
  document.getElementById("events").textContent = `Accepted plan changes: ${++changes}`; renderState()
})
plans.addEventListener("m:radio-group-error", renderState)
form.addEventListener("submit", event => {
  event.preventDefault(); document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(renderState, 0))
action("silent", () => { plans.value = "pro" })
action("clear", () => { plans.value = null })
action("default", () => { document.getElementById("pro-root").defaultChecked = true })
action("add", event => {
  document.getElementById("plan-items").append(document.getElementById("plan-template").content.cloneNode(true))
  plans.refresh(); event.currentTarget.disabled = true
})
action("remove", () => { plans.native.querySelector("#plan-items input:checked")?.closest("m-radio").remove(); plans.refresh() })
action("disabled", () => { plans.disabled = !plans.disabled })
action("peer", () => {
  const region = document.getElementById("peer-region")
  if (region.children.length) region.replaceChildren()
  else region.append(document.getElementById("peer-template").content.cloneNode(true))
  plans.refresh()
})
action("cancel", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
action("rtl", () => { layouts.dir = layouts.dir === "rtl" ? "ltr" : "rtl" })
action("theme", () => {
  const preview = document.getElementById("button-preview")
  preview.dataset.mTheme = preview.dataset.mTheme === "dark" ? "light" : "dark"
})
action("reconnect", () => {
  const parent = plans.parentNode, next = plans.nextSibling
  plans.remove(); parent.insertBefore(plans, next); plans.refresh()
})
document.getElementById("size").addEventListener("change", event => { layouts.size = event.target.value })
await loadComponentApi(document.getElementById("radio-api"), new URL("../api/radio.json", import.meta.url))
