import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITooltip
  if (!api) throw new Error("Tooltip runtime did not load.")
  void loadComponentApi(document.getElementById("tooltip-api"), new URL("../api/tooltip.json", import.meta.url))

  const manualTooltip = document.getElementById("tooltip-manual")
  const manualState = document.getElementById("manual-state")

  function updateManualState() {
    if (manualState && manualTooltip) {
      manualState.textContent = `State: ${manualTooltip.show ? "open" : "closed"}`
    }
  }

  document.getElementById("manual-open")?.addEventListener("click", () => {
    manualTooltip?.open()
    updateManualState()
  })
  document.getElementById("manual-close")?.addEventListener("click", () => {
    manualTooltip?.close()
    updateManualState()
  })
  document.getElementById("manual-toggle")?.addEventListener("click", () => {
    manualTooltip?.toggle()
    updateManualState()
  })

  for (const tip of document.querySelectorAll("m-tooltip")) {
    tip.addEventListener("toggle", updateManualState, true)
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize)
} else {
  initialize()
}
