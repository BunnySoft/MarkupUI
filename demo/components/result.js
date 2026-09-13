import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIResult
  if (!api) throw new Error("Result runtime did not load.")
  void loadComponentApi(document.getElementById("result-api"), new URL("../api/result.json", import.meta.url))

  const result = document.getElementById("interactive-result")
  const statusText = document.getElementById("interactive-status")

  document.getElementById("btn-success")?.addEventListener("click", () => {
    if (result) {
      result.status = "success"
      result.title = "Operation Succeeded"
      result.description = "The task was completed without issues."
      if (statusText) statusText.textContent = "Status: success"
    }
  })

  document.getElementById("btn-warning")?.addEventListener("click", () => {
    if (result) {
      result.status = "warning"
      result.title = "Attention Required"
      result.description = "Please review your settings."
      if (statusText) statusText.textContent = "Status: warning"
    }
  })

  document.getElementById("btn-error")?.addEventListener("click", () => {
    if (result) {
      result.status = "error"
      result.title = "Something Went Wrong"
      result.description = "An error occurred while saving."
      if (statusText) statusText.textContent = "Status: error"
    }
  })

  document.getElementById("btn-404")?.addEventListener("click", () => {
    if (result) {
      result.status = "404"
      result.title = "404 Not Found"
      result.description = "The requested resource could not be located."
      if (statusText) statusText.textContent = "Status: 404"
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

