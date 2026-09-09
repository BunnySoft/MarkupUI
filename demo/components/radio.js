const helpers = new Map()
for (const root of document.querySelectorAll("[data-radio-group]")) helpers.set(root.id, MarkupUIRadio.createRadioGroup(root))
window.radioDemo = { helpers }
const plans = helpers.get("plans")
const form = document.getElementById("subscription")
let changes = 0
function renderState() {
  try {
    const state = plans.state
    document.getElementById("state").textContent = JSON.stringify({ value: state.value, name: state.name, form: state.form?.id ?? null })
  } catch (error) { document.getElementById("state").textContent = error.message }
}
renderState()
function perform(action) {
  try { action(); renderState() }
  catch (error) { document.getElementById("state").textContent = error.message }
}
document.getElementById("plans").addEventListener("mui:radio-group-change", () => {
  document.getElementById("events").textContent = `Accepted plan changes: ${++changes}`; renderState()
})
document.getElementById("plans").addEventListener("mui:radio-group-error", renderState)
form.addEventListener("submit", event => {
  event.preventDefault()
  document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(renderState, 0))
document.getElementById("silent").addEventListener("click", () => perform(() => plans.setValue("pro")))
document.getElementById("clear").addEventListener("click", () => perform(() => plans.setValue(null)))
document.getElementById("default").addEventListener("click", () => perform(() => {
  const basic = document.getElementById("basic"), pro = document.getElementById("pro")
  if (!pro) throw new Error("Pro was removed; reload to restore that option.")
  if (basic) basic.defaultChecked = false
  pro.defaultChecked = true
  plans.refresh()
}))
document.getElementById("add").addEventListener("click", event => {
  document.getElementById("plan-items").append(document.getElementById("plan-template").content.cloneNode(true))
  event.currentTarget.disabled = true; perform(() => plans.refresh())
})
document.getElementById("remove").addEventListener("click", () => {
  document.querySelector("#plan-items input:checked")?.closest("label").remove()
  perform(() => plans.refresh())
})
document.getElementById("disabled").addEventListener("click", () => {
  const root = document.getElementById("plans"); root.disabled = !root.disabled
})
document.getElementById("peer").addEventListener("click", () => {
  const region = document.getElementById("peer-region")
  if (region.childElementCount) region.replaceChildren()
  else region.append(document.getElementById("peer-template").content.cloneNode(true))
  try { plans.refresh() } catch { /* The demo reports invalid scope without rewriting native grouping. */ }
  renderState()
})
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("disconnect").addEventListener("click", () => {
  helpers.forEach(helper => helper.disconnect()); renderState()
  for (const id of ["silent", "clear", "default", "add", "remove", "peer", "disconnect"]) document.getElementById(id).disabled = true
})
