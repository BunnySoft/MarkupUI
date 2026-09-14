import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITabs
  if (!api) throw new Error("Tabs runtime did not load.")
  void loadComponentApi(document.getElementById("tabs-api"), new URL("../api/tabs.json", import.meta.url))

  const interactiveTabs = document.querySelector("#interactive-tabs")
  const tabsStatus = document.querySelector("#tabs-status")

  interactiveTabs?.addEventListener("m:change", (event) => {
    if (tabsStatus) {
      tabsStatus.textContent = `Current tab: ${event.detail.value}`
    }
  })

  document.querySelector("#btn-v1")?.addEventListener("click", () => {
    interactiveTabs?.select("v1")
  })
  document.querySelector("#btn-v2")?.addEventListener("click", () => {
    interactiveTabs?.select("v2")
  })
  document.querySelector("#btn-v3")?.addEventListener("click", () => {
    interactiveTabs?.select("v3")
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
