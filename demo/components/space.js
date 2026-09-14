import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUISpace) throw new Error("Space runtime did not load.")
  void loadComponentApi(document.getElementById("space-api"), new URL("../api/space.json", import.meta.url))
  const space = document.getElementById("live-space")
  const status = document.getElementById("space-status")
  const update = () => { status.textContent = `Column gap: ${space.columnGap ?? "preset"}` }
  document.getElementById("change-gap").addEventListener("click", () => {
    space.columnGap = space.columnGap === 24 ? 8 : 24
    update()
  })
  document.getElementById("reset-gap").addEventListener("click", () => { space.columnGap = null; update() })
  document.getElementById("reconnect-space").addEventListener("click", () => {
    const parent = space.parentElement
    const next = space.nextSibling
    space.remove()
    parent.insertBefore(space, next)
    update()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
