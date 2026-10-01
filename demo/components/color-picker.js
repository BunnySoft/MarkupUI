import { loadComponentApi } from "../component-api.js"

function initialize() {
  const apiEl = document.getElementById("color-picker-api")
  if (apiEl) {
    void loadComponentApi(apiEl, new URL("../api/color-picker.json", import.meta.url))
  }

  const basicPicker = document.getElementById("basic-picker")
  const basicValue = document.getElementById("basic-value")
  if (basicPicker && basicValue) {
    basicPicker.addEventListener("m:change", event => {
      const detail = event.detail
      basicValue.textContent = `Selected color: ${detail?.value || basicPicker.value}`
    })
  }

  const disabledPicker = document.getElementById("disabled-picker")
  const toggleBtn = document.getElementById("toggle-disabled")
  if (disabledPicker && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      disabledPicker.disabled = !disabledPicker.disabled
    })
  }

  const alphaPicker = document.getElementById("alpha-picker")
  const alphaValue = document.getElementById("alpha-value")
  if (alphaPicker && alphaValue) {
    alphaPicker.addEventListener("m:change", event => {
      alphaValue.textContent = `Committed: ${event.detail.value}`
    })
  }
  const form = document.getElementById("color-form")
  const formValue = document.getElementById("form-value")
  if (form && formValue) {
    form.addEventListener("submit", event => {
      event.preventDefault()
      formValue.textContent = `FormData accent: ${new FormData(form).get("accent")}`
    })
    form.addEventListener("reset", event => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) formValue.textContent = `Reset: ${document.getElementById("form-picker").defaultValue}`
      })
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
