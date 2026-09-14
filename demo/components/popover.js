import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIPopover
  if (!api) throw new Error("Popover runtime did not load.")
  void loadComponentApi(document.getElementById("popover-api"), new URL("../api/popover.json", import.meta.url))

  const manualPopover = document.getElementById("popover-manual")
  const manualState = document.getElementById("manual-state")

  function updateManualState() {
    if (manualState && manualPopover) {
      manualState.textContent = `State: ${manualPopover.show ? "open" : "closed"}`
    }
  }

  document.getElementById("manual-open")?.addEventListener("click", () => {
    manualPopover?.open()
    updateManualState()
  })
  document.getElementById("manual-close")?.addEventListener("click", () => {
    manualPopover?.close()
    updateManualState()
  })
  document.getElementById("manual-toggle")?.addEventListener("click", () => {
    manualPopover?.toggle()
    updateManualState()
  })
  document.getElementById("manual-inner-close")?.addEventListener("click", () => {
    manualPopover?.close()
    updateManualState()
  })

  const formPopover = document.getElementById("popover-form")
  const filterInput = document.getElementById("filter-input")
  document.getElementById("filter-reset")?.addEventListener("click", () => {
    if (filterInput) filterInput.value = ""
  })
  document.getElementById("filter-apply")?.addEventListener("click", () => {
    formPopover?.close()
  })

  for (const panel of document.querySelectorAll("m-popover-content")) {
    panel.addEventListener("toggle", () => {
      updateManualState()
    })
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize)
} else {
  initialize()
}
