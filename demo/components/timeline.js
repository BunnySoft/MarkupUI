import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITimeline
  if (!api) throw new Error("Timeline runtime did not load.")
  void loadComponentApi(document.getElementById("timeline-api"), new URL("../api/timeline.json", import.meta.url)).catch(() => {})

  const timeline = document.querySelector("#interactive-timeline")
  const item1 = document.querySelector("#interactive-item-1")
  const status = document.querySelector("#action-status")

  const updateStatus = () => {
    if (timeline && item1 && status) {
      status.textContent = `Horizontal: ${timeline.horizontal}, Type: ${item1.type}`
    }
  }

  document.querySelector("#btn-toggle-horizontal")?.addEventListener("click", () => {
    if (timeline) {
      timeline.horizontal = !timeline.horizontal
      updateStatus()
    }
  })

  const types = ["default", "info", "success", "warning", "error"]
  document.querySelector("#btn-cycle-type")?.addEventListener("click", () => {
    if (item1) {
      const nextIndex = (types.indexOf(item1.type) + 1) % types.length
      item1.type = types[nextIndex]
      updateStatus()
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
