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
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

