const form = document.querySelector("#planning"), events = document.querySelector("#events")
const pickers = new Map(), unsupported = []
for (const root of document.querySelectorAll("[data-date-picker]")) {
  const mode = root.querySelector("[data-date-control]").getAttribute("type")
  if (!MarkupUIDatePicker.isDatePickerTypeSupported(document, mode)) { unsupported.push(mode); continue }
  const helper = MarkupUIDatePicker.createDatePicker(root); pickers.set(root.id, helper)
  root.addEventListener("mui:date-picker-clear", () => { events.textContent = "Editable native field(s) cleared. Empty fields remain native values, not hidden null models." })
  root.addEventListener("mui:date-picker-error", () => { events.textContent = "Unsupported date anatomy/value; native fields were not normalized or replaced." })
}
document.querySelector("#capabilities").textContent = unsupported.length
  ? `Unsupported native modes: ${[...new Set(unsupported)].join(", ")}. Those fields remain native/text fallback; no equivalent calendar validation is claimed.`
  : "Native date/month/week/datetime-local parsing and numeric ordering probes passed. No native popup UI or timezone conversion is claimed."
const trip = pickers.get("trip")
const validation = MarkupUIForm.createForm(form, { items: trip ? [{
  key: "trip", controls: trip.inputs, feedback: document.querySelector("#trip-error"),
  validator: () => trip.state.partial ? { message: "Complete both date endpoints." }
    : trip.state.ordered === false ? { message: "End date must not precede start." } : null,
}] : [] })
function apply(id, value) { pickers.get(id)?.setValue(value); validation.refresh() }
document.querySelector("#today").addEventListener("click", () => {
  const local = new Date()
  const date = `${String(local.getFullYear()).padStart(4, "0")}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`
  apply("day", date)
  events.textContent = "Set local calendar parts explicitly; no UTC ISO slicing or timestamp model conversion."
})
document.querySelector("#reverse").addEventListener("click", () => apply("trip", ["2024-03-10", "2024-03-01"]))
document.querySelector("#partial").addEventListener("click", () => apply("trip", ["2024-03-01", ""]))
document.querySelector("#invalid").addEventListener("click", () => {
  try { apply("day", "2023-02-29") } catch { events.textContent = "Impossible nonempty date rejected before touching the real native field." }
})
document.querySelector("#readonly").addEventListener("click", () => { const field = document.querySelector("#trip-start"); field.readOnly = !field.readOnly; trip?.refresh() })
document.querySelector("#disabled").addEventListener("click", () => { const root = document.querySelector("#day"); root.disabled = !root.disabled; pickers.get("day")?.refresh() })
document.querySelector("#cancel").addEventListener("click", () => { form.addEventListener("reset", event => event.preventDefault(), { once: true }) })
document.querySelector("#validate").addEventListener("click", async () => { events.textContent = `Manual form validation: ${(await validation.validate()).status}. Custom ordering is not native calendar-cell disabling.` })
document.querySelector("#rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
let intent = 0
async function inspect(event) {
  event.preventDefault()
  const current = ++intent, result = await validation.validate({ reason: "submit" })
  if (current === intent && result.status === "valid" && result.current) document.querySelector("#submission").textContent = JSON.stringify([...new FormData(form, event.submitter)], null, 2)
}
form.addEventListener("submit", inspect)
const tools = ["today", "reverse", "partial", "validate", "invalid", "readonly", "disabled", "cancel", "disconnect"]
document.querySelector("#disconnect").addEventListener("click", () => {
  intent++; pickers.forEach(helper => helper.disconnect()); validation.disconnect(); form.removeEventListener("submit", inspect)
  tools.forEach(id => { document.getElementById(id).hidden = true })
})
tools.forEach(id => { document.getElementById(id).hidden = false })
if (!pickers.has("day")) ["today", "invalid", "disabled"].forEach(id => { document.getElementById(id).hidden = true })
if (!trip) ["reverse", "partial", "readonly"].forEach(id => { document.getElementById(id).hidden = true })
