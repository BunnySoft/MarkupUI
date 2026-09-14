import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITimePicker
  if (!api) throw new Error("TimePicker runtime did not load.")
  void loadComponentApi(document.getElementById("time-picker-api"), new URL("../api/time-picker.json", import.meta.url))

  const basicPicker = document.getElementById("basic-picker")
  const basicValue = document.getElementById("basic-value")
  if (basicPicker && basicValue) {
    basicPicker.addEventListener("m:change", event => {
      const detail = event.detail
      basicValue.textContent = `Selected time: ${detail?.value || "None"}`
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

