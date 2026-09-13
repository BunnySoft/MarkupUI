import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIAnchor
  if (!api) throw new Error("Anchor runtime did not load.")
  void loadComponentApi(document.getElementById("anchor-api"), new URL("../api/anchor.json", import.meta.url))
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

