import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUIIcon) throw new Error("Icon runtime did not load.")
  void loadComponentApi(document.getElementById("icon-api"), new URL("../api/icon.json", import.meta.url))
  const icon = document.getElementById("live-icon")
  const status = document.getElementById("icon-status")
  const update = () => { status.textContent = `Size: ${icon.size ?? "inherited"}` }
  document.getElementById("change-size").addEventListener("click", () => {
    icon.size = icon.size === 48 ? 32 : 48
    update()
  })
  document.getElementById("reset-size").addEventListener("click", () => {
    icon.size = null
    update()
  })
  document.getElementById("reconnect-icon").addEventListener("click", () => {
    const parent = icon.parentElement
    const next = icon.nextSibling
    icon.remove()
    parent.insertBefore(icon, next)
    update()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
