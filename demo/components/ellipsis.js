import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIEllipsis
  if (!api) throw new Error("Ellipsis runtime did not load.")
  void loadComponentApi(document.getElementById("ellipsis-api"), new URL("../api/ellipsis.json", import.meta.url))

  const dynamic = document.querySelector("#clamped-dynamic")
  const currentLines = document.querySelector("#clamp-status")
  function updateClamp(lines) {
    if (dynamic) {
      dynamic.lineClamp = lines
      if (currentLines) currentLines.textContent = `Current clamp: ${lines} line${lines === 1 ? "" : "s"}`
    }
  }

  document.querySelector("#clamp-1")?.addEventListener("click", () => updateClamp(1))
  document.querySelector("#clamp-2")?.addEventListener("click", () => updateClamp(2))
  document.querySelector("#clamp-3")?.addEventListener("click", () => updateClamp(3))

  const clickExpand = document.querySelector("#click-expand")
  const expandStatus = document.querySelector("#expand-status")
  clickExpand?.addEventListener("click", () => {
    if (expandStatus && clickExpand) {
      expandStatus.textContent = `Expanded: ${clickExpand.expanded}`
    }
  })
  document.querySelector("#toggle-expand")?.addEventListener("click", () => {
    if (clickExpand) {
      clickExpand.expanded = !clickExpand.expanded
      if (expandStatus) expandStatus.textContent = `Expanded: ${clickExpand.expanded}`
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
