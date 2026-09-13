import { loadComponentApi } from "../component-api.js"

async function initialize() {
  if (!globalThis.MarkupUIGrid) throw new Error("Grid runtime did not load.")
  await loadComponentApi(document.getElementById("grid-api"), new URL("../api/grid.json", import.meta.url))
  const grid = document.getElementById("live-grid")
  const status = document.getElementById("grid-status")
  const update = () => { status.textContent = `Column gap: ${grid.columnGap ?? "style default"}` }
  document.getElementById("change-gap").addEventListener("click", () => {
    grid.columnGap = grid.columnGap === 24 ? 8 : 24
    update()
  })
  document.getElementById("reset-gap").addEventListener("click", () => { grid.columnGap = null; update() })
  document.getElementById("reconnect-grid").addEventListener("click", () => {
    const parent = grid.parentElement, next = grid.nextSibling
    grid.remove()
    parent.insertBefore(grid, next)
    update()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else void initialize()
