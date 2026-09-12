import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUIDivider) throw new Error("Divider runtime did not load.")
  void loadComponentApi(document.getElementById("divider-api"), new URL("../api/divider.json", import.meta.url))
  const divider = document.getElementById("live-divider")
  const heading = document.getElementById("divider-live-heading")
  const label = document.getElementById("divider-label")
  let revision = 0
  function update() {
    document.getElementById("divider-status").textContent =
      `${divider.isConnected ? "Connected" : "Detached"}; ${divider.orientation}; ${divider.semantic ? "semantic" : "decorative"}; rule label: ${JSON.stringify(divider.label)}. Heading identity retained.`
  }
  document.getElementById("divider-orientation").addEventListener("change", event => { divider.orientation = event.target.value; update() })
  document.getElementById("divider-placement").addEventListener("change", event => { divider.titlePlacement = event.target.value; update() })
  document.getElementById("divider-semantic").addEventListener("change", event => { divider.semantic = event.target.checked; update() })
  document.getElementById("divider-dashed").addEventListener("change", event => { divider.dashed = event.target.checked; update() })
  label.addEventListener("input", () => { divider.label = label.value; update() })
  document.getElementById("divider-clear-label").addEventListener("click", () => { divider.label = null; label.value = ""; update() })
  document.getElementById("divider-update-title").addEventListener("click", () => {
    heading.textContent = `Live heading ${++revision}`
    update()
  })
  document.getElementById("divider-detach").addEventListener("click", () => {
    if (divider.isConnected) divider.remove()
    else document.getElementById("divider-live-mount").append(divider)
    update()
  })
  update()
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
