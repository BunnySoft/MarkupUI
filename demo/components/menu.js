import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIMenu
  if (!api) throw new Error("Menu runtime did not load.")
  void loadComponentApi(document.getElementById("menu-api"), new URL("../api/menu.json", import.meta.url))

  const interactiveMenu = document.querySelector("#interactive-menu")
  const menuStatus = document.querySelector("#menu-status")

  interactiveMenu?.addEventListener("m:change", (event) => {
    if (menuStatus) {
      menuStatus.textContent = `Selected: ${event.detail.value}`
    }
  })

  document.querySelector("#select-inbox")?.addEventListener("click", () => {
    if (interactiveMenu) interactiveMenu.value = "mail"
  })
  document.querySelector("#select-starred")?.addEventListener("click", () => {
    if (interactiveMenu) interactiveMenu.value = "starred"
  })
  document.querySelector("#select-trash")?.addEventListener("click", () => {
    if (interactiveMenu) interactiveMenu.value = "trash"
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
