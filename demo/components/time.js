import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITime
  if (!api) throw new Error("Time runtime did not load.")
  void loadComponentApi(document.getElementById("time-api"), new URL("../api/time.json", import.meta.url)).catch(() => {})

  const relativeEl = document.querySelector("#relative-demo")
  if (relativeEl) {
    relativeEl.time = Date.now() - 60000
  }

  const btnCycle = document.querySelector("#btn-cycle-type")
  const interactiveEl = document.querySelector("#interactive-time")
  const status = document.querySelector("#action-status")

  const types = ["datetime", "date", "relative"]
  let typeIndex = 0

  btnCycle?.addEventListener("click", () => {
    if (interactiveEl) {
      typeIndex = (typeIndex + 1) % types.length
      interactiveEl.type = types[typeIndex]
      if (status) status.textContent = `Type: ${interactiveEl.type}`
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

