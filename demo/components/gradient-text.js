import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIGradientText
  if (!api) throw new Error("GradientText runtime did not load.")
  void loadComponentApi(document.getElementById("gradient-text-api"), new URL("../api/gradient-text.json", import.meta.url))
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
