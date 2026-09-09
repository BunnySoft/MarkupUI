const form = document.querySelector("#schedule"), events = document.querySelector("#events")
const supported = MarkupUITimePicker.isTimePickerSupported(document), pickers = new Map()
if (supported) for (const root of document.querySelectorAll("[data-time-picker]")) {
  const helper = MarkupUITimePicker.createTimePicker(root); pickers.set(root.id, helper)
  root.addEventListener("mui:time-picker-clear", () => { events.textContent = "Native time cleared; empty is not a hidden null or midnight value." })
  root.addEventListener("mui:time-picker-error", () => { events.textContent = "Unsupported native time anatomy/value; fields were not silently normalized." })
}
const validation = MarkupUIForm.createForm(form, { items: [] })
const meeting = pickers.get("meeting")
document.querySelector("#capability").textContent = supported
  ? `Native parsing/precision probes passed. showPicker method present: ${typeof meeting.control.showPicker === "function"}. No chooser UI/open-state/format guarantee is inferred.`
  : "Native time parsing/precision unavailable; no helper or calendar/formatting polyfill installed."
document.querySelector("#now").addEventListener("click", () => {
  const local = new Date()
  const value = [local.getHours(), local.getMinutes(), local.getSeconds()].map(part => String(part).padStart(2, "0")).join(":")
  meeting.setValue(value); validation.refresh()
  events.textContent = "Explicit application local clock parts; no date anchor or UTC ISO slicing."
})
document.querySelector("#midnight").addEventListener("click", () => { meeting.setValue("00:00"); validation.refresh() })
document.querySelector("#invalid").addEventListener("click", () => { try { meeting.setValue("24:00") } catch { events.textContent = "24:00 rejected before touching the real field." } })
document.querySelector("#readonly").addEventListener("click", () => { meeting.control.readOnly = !meeting.control.readOnly; meeting.refresh() })
document.querySelector("#disabled").addEventListener("click", () => { const root = document.querySelector("#meeting"); root.disabled = !root.disabled; meeting.refresh() })
document.querySelector("#cancel").addEventListener("click", () => { form.addEventListener("reset", event => event.preventDefault(), { once: true }) })
document.querySelector("#validate").addEventListener("click", () => validation.reportValidity())
document.querySelector("#rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
function inspect(event) {
  event.preventDefault()
  document.querySelector("#submission").textContent = JSON.stringify([...new FormData(form, event.submitter)], null, 2)
}
form.addEventListener("submit", inspect)
const tools = ["now", "midnight", "invalid", "readonly", "disabled", "cancel", "validate", "disconnect"]
document.querySelector("#disconnect").addEventListener("click", () => {
  pickers.forEach(helper => helper.disconnect()); validation.disconnect(); form.removeEventListener("submit", inspect)
  tools.forEach(id => { document.getElementById(id).hidden = true })
})
if (supported) tools.forEach(id => { document.getElementById(id).hidden = false })
