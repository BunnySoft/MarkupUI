import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUICascader
  if (!api) throw new Error("Cascader runtime did not load.")
  void loadComponentApi(document.getElementById("cascader-api"), new URL("../api/cascader.json", import.meta.url))

  const basicCascader = document.getElementById("basic-cascader")
  const basicValue = document.getElementById("basic-value")
  if (basicCascader && basicValue) {
    basicCascader.addEventListener("m:change", event => {
      const detail = event.detail
      basicValue.textContent = `Selected: ${detail?.value || "None"}`
    })
  }

  const disabledCascader = document.getElementById("disabled-cascader")
  const toggleBtn = document.getElementById("toggle-disabled")
  if (disabledCascader && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      disabledCascader.disabled = !disabledCascader.disabled
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

