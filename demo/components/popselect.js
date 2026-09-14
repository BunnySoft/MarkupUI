import { loadComponentApi } from "../component-api.js"

function initialize() {
  const container = document.getElementById("popselect-api")
  if (container) {
    void loadComponentApi(container, new URL("../api/popselect.json", import.meta.url))
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize)
} else {
  initialize()
}

