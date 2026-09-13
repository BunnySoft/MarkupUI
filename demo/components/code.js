import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUICode
  if (!api) throw new Error("Code runtime did not load.")
  void loadComponentApi(document.getElementById("code-api"), new URL("../api/code.json", import.meta.url))
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
