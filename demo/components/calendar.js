import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUICalendar
  if (!api) throw new Error("Calendar runtime did not load.")
  void loadComponentApi(document.getElementById("calendar-api"), new URL("../api/calendar.json", import.meta.url))

  const basicCalendar = document.getElementById("basic-calendar")
  const basicValue = document.getElementById("basic-value")
  if (basicCalendar && basicValue) {
    basicCalendar.addEventListener("m:change", event => {
      const detail = event.detail
      basicValue.textContent = `Selected date: ${detail?.value || "None"}`
    })
  }

  const yearCalendar = document.getElementById("year-calendar")
  const yearValue = document.getElementById("year-value")
  if (yearCalendar && yearValue) {
    yearCalendar.addEventListener("m:change", event => {
      const detail = event.detail
      yearValue.textContent = `Selected month: ${detail?.value || "None"}`
    })
  }

  const bounded = document.getElementById("bounded-calendar")
  const boundedValue = document.getElementById("bounded-value")
  bounded.configure({
    isDateDisabled: value => value === "2026-09-16",
    getDayContent: value => value === "2026-09-15" ? "Review" : value === "2026-09-16" ? "Reserved" : "",
  })
  const showSelection = () => { boundedValue.textContent = `Selected date: ${bounded.value || "None"}` }
  bounded.addEventListener("m:change", showSelection)
  document.getElementById("toggle-disabled").addEventListener("click", event => {
    bounded.disabled = !bounded.disabled
    event.currentTarget.label = bounded.disabled ? "Enable calendar" : "Disable calendar"
  })
  document.getElementById("reset-calendar").addEventListener("click", () => {
    bounded.reset()
    showSelection()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

