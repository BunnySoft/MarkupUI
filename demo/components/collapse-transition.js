import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUICollapseTransition
  if (!api) throw new Error("Collapse Transition runtime did not load.")
  void loadComponentApi(document.getElementById("collapse-transition-api"), new URL("../api/collapse-transition.json", import.meta.url))

  const toggleBtn = document.getElementById("toggle-button")
  const basic = document.getElementById("basic-transition")
  if (toggleBtn && basic) {
    toggleBtn.addEventListener("click", () => {
      basic.show = !basic.show
      toggleBtn.setAttribute("aria-expanded", String(basic.show))
    })
  }

  const toggleCollapsed = document.getElementById("toggle-collapsed")
  const collapsed = document.getElementById("collapsed-transition")
  if (toggleCollapsed && collapsed) {
    toggleCollapsed.addEventListener("click", () => {
      collapsed.show = !collapsed.show
      toggleCollapsed.setAttribute("aria-expanded", String(collapsed.show))
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

