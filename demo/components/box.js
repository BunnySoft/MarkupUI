import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIBox
  if (!api) throw new Error("Box runtime did not load.")
  void loadComponentApi(document.getElementById("box-api"), new URL("../api/box.json", import.meta.url))
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
