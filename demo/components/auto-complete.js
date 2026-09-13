import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIAutoComplete
  if (!api) throw new Error("AutoComplete runtime did not load.")
  void loadComponentApi(document.getElementById("auto-complete-api"), new URL("../api/auto-complete.json", import.meta.url))

  const basicAc = document.getElementById("basic-auto-complete")
  const basicOutput = document.getElementById("basic-output")
  if (basicAc && basicOutput) {
    basicAc.addEventListener("m:change", event => {
      const detail = event.detail
      basicOutput.textContent = `Current value: ${detail?.value || ""}`
    })
    basicAc.addEventListener("m:select", event => {
      const detail = event.detail
      basicOutput.textContent = `Selected: ${detail?.value || ""}`
    })
  }

  const clearableAc = document.getElementById("clearable-auto-complete")
  const setClearableBtn = document.getElementById("set-clearable-btn")
  if (clearableAc && setClearableBtn) {
    setClearableBtn.addEventListener("click", () => {
      clearableAc.value = "React"
    })
  }

  const disabledAc = document.getElementById("disabled-auto-complete")
  const toggleDisabledBtn = document.getElementById("toggle-disabled-btn")
  if (disabledAc && toggleDisabledBtn) {
    toggleDisabledBtn.addEventListener("click", () => {
      disabledAc.disabled = !disabledAc.disabled
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()


