import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITreeSelect
  if (!api) throw new Error("TreeSelect runtime did not load.")
  void loadComponentApi(document.getElementById("tree-select-api"), new URL("../api/tree-select.json", import.meta.url))

  const basicSelect = document.getElementById("basic-select")
  const basicValue = document.getElementById("basic-value")
  if (basicSelect && basicValue) {
    basicSelect.addEventListener("m:change", event => {
      const detail = event.detail
      basicValue.textContent = `Selected value: ${detail?.value || "None"}`
    })
  }

  const disabledSelect = document.getElementById("disabled-select")
  const toggleBtn = document.getElementById("toggle-disabled")
  if (disabledSelect && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      disabledSelect.disabled = !disabledSelect.disabled
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

