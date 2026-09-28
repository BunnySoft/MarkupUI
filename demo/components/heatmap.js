import { loadComponentApi } from "../component-api.js"

function initialize() {
  const heatmapApi = document.getElementById("heatmap-api")
  if (heatmapApi) {
    void loadComponentApi(heatmapApi, new URL("../api/heatmap.json", import.meta.url))
  }
  const heatmap = document.getElementById("basic-heatmap")
  heatmap.addEventListener("m:heatmap-explore", event => {
    document.getElementById("heatmap-value").textContent = `${event.detail.date}: ${event.detail.value ?? "Missing"}`
  })
  document.getElementById("update-values").addEventListener("click", () => {
    heatmap.data = [{ date: "2024-02-01", value: -3 }, { date: "2024-02-10", value: 4 }, { date: "2024-02-29", value: 12 }]
  })
  document.getElementById("toggle-loading").addEventListener("click", () => {
    heatmap.settings = { loading: !heatmap.settings.loading }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

