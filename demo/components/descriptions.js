import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIDescriptions
  if (!api) throw new Error("Descriptions runtime did not load.")
  void loadComponentApi(document.getElementById("descriptions-api"), new URL("../api/descriptions.json", import.meta.url)).catch(() => {})

  const reviewBtn = document.querySelector("#review-project")
  const actionStatus = document.querySelector("#action-status")
  reviewBtn?.addEventListener("click", () => {
    if (actionStatus) actionStatus.textContent = "Project review requested."
  })

  const live = document.querySelector("#live-descriptions")
  const liveStatus = document.querySelector("#live-status")
  const updateStatus = () => {
    if (live && liveStatus) {
      liveStatus.textContent = `Bordered: ${live.bordered}, Size: ${live.size}, Placement: ${live.labelPlacement}`
    }
  }

  document.querySelector("#toggle-bordered")?.addEventListener("click", () => {
    if (live) {
      live.bordered = !live.bordered
      updateStatus()
    }
  })

  const sizes = ["small", "medium", "large"]
  document.querySelector("#cycle-size")?.addEventListener("click", () => {
    if (live) {
      const nextIndex = (sizes.indexOf(live.size) + 1) % sizes.length
      live.size = sizes[nextIndex]
      updateStatus()
    }
  })

  document.querySelector("#toggle-placement")?.addEventListener("click", () => {
    if (live) {
      live.labelPlacement = live.labelPlacement === "top" ? "left" : "top"
      updateStatus()
    }
  })

  document.querySelector("#reconnect-descriptions")?.addEventListener("click", () => {
    if (!live || !live.parentElement) return
    const parent = live.parentElement
    const next = live.nextSibling
    live.remove()
    parent.insertBefore(live, next)
    updateStatus()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
