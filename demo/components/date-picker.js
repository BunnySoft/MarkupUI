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

  const form = document.getElementById("planning-form")?.native
  const result = document.getElementById("form-result")
  if (form && result) {
    form.addEventListener("submit", event => {
      event.preventDefault()
      result.textContent = [...new FormData(form)].map(([name, value]) => `${name}: ${value}`).join("; ")
    })
    form.addEventListener("reset", event => {
      queueMicrotask(() => { if (!event.defaultPrevented) result.textContent = "Native defaults restored." })
    })
  }

  for (const id of ["quarter-picker", "form-quarter-picker"]) {
    const picker = document.getElementById(id)
    picker?.addEventListener("m:date-picker-draft", () => {
      if (result && id === "form-quarter-picker") result.textContent = `Invalid or composing quarter draft: ${picker.state.draft}`
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
