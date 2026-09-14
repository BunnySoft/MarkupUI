import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUIBackTop) throw new Error("BackTop runtime did not load.")
  void loadComponentApi(document.getElementById("back-top-api"), new URL("../api/back-top.json", import.meta.url))
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

