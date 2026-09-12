import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUICard) throw new Error("Card runtime did not load.")
  void loadComponentApi(document.getElementById("card-api"), new URL("../api/card.json", import.meta.url))

  const closableCard = document.getElementById("closable-card")
  const closeMessage = document.getElementById("close-message")
  closableCard.addEventListener("m:close", event => {
    if (event.target !== closableCard || event.defaultPrevented) return
    closeMessage.textContent = "Card Close"
  })

  const loadingCard = document.getElementById("loading-card")
  const loadingControl = document.getElementById("loading-switch")

  function renderLoading() {
    const loading = loadingControl.checked
    loadingCard.setAttribute("aria-busy", String(loading))
    for (const node of loadingCard.querySelectorAll("[data-loading-content]")) node.hidden = !loading
    for (const node of loadingCard.querySelectorAll("[data-loaded-content]")) node.hidden = loading
  }
  loadingControl.addEventListener("change", renderLoading)
  renderLoading()
  globalThis.MarkupUITabs.createTabs(document.getElementById("custom-tabs"))
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
