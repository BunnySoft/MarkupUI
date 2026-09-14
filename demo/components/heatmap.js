import { loadComponentApi } from "../component-api.js"

function initialize() {
  const heatmapApi = document.getElementById("heatmap-api")
  if (heatmapApi) {
    void loadComponentApi(heatmapApi, new URL("../api/heatmap.json", import.meta.url))
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

