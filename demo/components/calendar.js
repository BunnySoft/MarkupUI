import { createCalendar } from "../../dist/markup-ui-calendar.js"

const root = document.querySelector("#calendar"), feedback = document.querySelector("#feedback")
const dateInput = document.querySelector("#native-date")
function localToday() {
  const now = new Date()
  return `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}
const calendar = createCalendar(root, {
  value: null, defaultValue: "2024-02-15", today: localToday(),
  isDateDisabled: (_value, parts) => document.querySelector("#all-disabled").checked
    || document.querySelector("#even-disabled").checked && parts.date % 2 === 0,
  getDayContent: (_value, parts) => parts.date === 14 ? "Planning notes" : parts.date === 22 ? "Literal <em> text, no HTML" : "",
})
window.calendarDemo = { calendar, localToday }
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
function show() { document.querySelector("#panel").value = calendar.state.panel; feedback.textContent = JSON.stringify(calendar.state, null, 2) }
function change(options) {
  try { calendar.set(options); dateInput.value = calendar.value ?? ""; show() }
  catch (error) { feedback.textContent = `${error.name}: ${error.message}\nThe previous calendar view remains.` }
}
root.addEventListener("mui:calendar-change", event => { dateInput.value = event.detail.value ?? ""; show() })
root.addEventListener("mui:calendar-panel-change", show)
root.addEventListener("mui:calendar-error", event => { feedback.textContent = String(event.detail.error) })
dateInput.addEventListener("change", () => { if (calendar.connected) change({ value: dateInput.value || null }) })
document.querySelector("#week-start").addEventListener("change", event => change({ firstDayOfWeek: Number(event.target.value) }))
document.querySelector("#locale").addEventListener("change", event => change({ locale: event.target.value }))
document.querySelector("#disabled").addEventListener("change", event => change({ disabled: event.target.checked }))
for (const id of ["even-disabled", "all-disabled"]) document.querySelector(`#${id}`).addEventListener("change", () => { calendar.refresh(); show() })
document.querySelector("#rtl").addEventListener("change", event => { root.dir = event.target.checked ? "rtl" : "ltr" })
for (const [id, name] of [["narrow", "narrow"], ["zoom", "zoomed"]]) {
  document.querySelector(`#${id}`).addEventListener("change", event => root.classList.toggle(name, event.target.checked))
}
document.querySelector("#panel").addEventListener("change", event => change({ panel: event.target.value }))
document.querySelector("#jan31").addEventListener("click", () => change({ value: "2024-01-31" }))
document.querySelector("#year1").addEventListener("click", () => change({ value: null, panel: "0001-01" }))
document.querySelector("#year9999").addEventListener("click", () => change({ value: null, panel: "9999-12" }))
document.querySelector("#one-day").addEventListener("click", () => change({ value: null, min: "2024-02-29", max: "2024-02-29", panel: "2024-02" }))
document.querySelector("#full-bounds").addEventListener("click", () => change({ min: "0001-01-01", max: "9999-12-31" }))
document.querySelector("#today-snapshot").addEventListener("click", () => change({ today: localToday() }))
document.querySelector("#reset-calendar").addEventListener("click", () => { calendar.reset(); dateInput.value = calendar.value ?? ""; show() })
document.querySelector("#failed-note").addEventListener("click", () => change({ getDayContent: value => { if (value.endsWith("-15")) throw new Error("Local annotation preparation failed"); return "" } }))
document.querySelector("#disconnect").addEventListener("click", () => {
  calendar.disconnect(); document.querySelector(".demo-controls").hidden = true
  feedback.textContent = "Disconnected: the exact authored February 2024 fallback rows and header are restored. Reload to rebind."
})
document.querySelector("#calendar-form").addEventListener("submit", event => {
  event.preventDefault(); feedback.textContent = JSON.stringify([...new FormData(event.currentTarget)], null, 2)
})
show()
