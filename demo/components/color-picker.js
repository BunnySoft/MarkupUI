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

  const root = document.querySelector("#accent-picker")
  if (root && globalThis.MarkupUIColorPicker?.createColorPicker) {
    try {
      MarkupUIColorPicker.createColorPicker(root)
    } catch {
      // Ignore if already owned or in headless test environment
    }
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

