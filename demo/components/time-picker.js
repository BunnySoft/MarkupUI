import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITimePicker
  if (!api) throw new Error("TimePicker runtime did not load.")
  void loadComponentApi(document.getElementById("time-picker-api"), new URL("../api/time-picker.json", import.meta.url))
  document.querySelectorAll("m-time-picker").forEach(picker => {
    picker.addEventListener("m:error", event => {
      console.error("TimePicker enhancement failed.", event.detail.error)
    })
  })

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

  const form = document.getElementById("clock-form")
  const formPicker = document.getElementById("form-picker")
  const formValue = document.getElementById("form-value")
  const formData = document.getElementById("form-data")
  const showValue = () => {
    formValue.textContent = `Live: ${formPicker.value || "(empty)"}; reset default: ${formPicker.defaultValue || "(empty)"}`
  }
  formPicker.addEventListener("m:change", showValue)
  form.addEventListener("reset", () => setTimeout(showValue, 0))
  form.addEventListener("submit", event => {
    event.preventDefault()
    formData.textContent = `FormData: ${JSON.stringify([...new FormData(form)])}`
  })
  document.getElementById("write-midnight").addEventListener("click", () => {
    formPicker.value = "00:00"
    showValue()
  })
  document.getElementById("write-default").addEventListener("click", () => {
    formPicker.defaultValue = "00:30"
    showValue()
  })
  showValue()
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
