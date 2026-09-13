import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIDatePicker
  if (!api) throw new Error("DatePicker runtime did not load.")
  void loadComponentApi(document.getElementById("date-picker-api"), new URL("../api/date-picker.json", import.meta.url))

  const basicPicker = document.getElementById("basic-picker")
  const basicValue = document.getElementById("basic-value")
  if (basicPicker && basicValue) {
    basicPicker.addEventListener("m:change", event => {
      const detail = event.detail
      basicValue.textContent = `Selected date: ${detail?.value || "None"}`
    })
  }

  const disabledPicker = document.getElementById("disabled-picker")
  const toggleBtn = document.getElementById("toggle-disabled")
  if (disabledPicker && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      disabledPicker.disabled = !disabledPicker.disabled
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

