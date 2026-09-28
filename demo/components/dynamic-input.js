import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIDynamicInput
  if (!api) throw new Error("DynamicInput runtime did not load.")
  void loadComponentApi(document.getElementById("dynamic-input-api"), new URL("../api/dynamic-input.json", import.meta.url))

  const basicInput = document.getElementById("basic-dynamic-input")
  const basicValue = document.getElementById("basic-value")
  if (basicInput && basicValue) {
    basicInput.addEventListener("m:change", event => {
      if (event.target === basicInput) basicValue.textContent = `Rows: ${event.detail.rows.length}`
    })
  }

  const form = document.getElementById("entries-form")
  const output = document.getElementById("entries-value")
  form.addEventListener("submit", event => {
    event.preventDefault()
    // FormData is Web-only inspection of the m-form's actual semantic owner.
    output.textContent = JSON.stringify([...new FormData(form.native)])
  })

  const disabledInput = document.getElementById("disabled-dynamic-input")
  const toggleBtn = document.getElementById("toggle-disabled")
  if (disabledInput && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      disabledInput.disabled = !disabledInput.disabled
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

