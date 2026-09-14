import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIUpload
  if (!api) throw new Error("Upload runtime did not load.")
  void loadComponentApi(document.getElementById("upload-api"), new URL("../api/upload.json", import.meta.url))

  const basicUpload = document.getElementById("basic-upload")
  basicUpload?.addEventListener("m:change", () => {
    // Basic upload change handler
  })

  const draggerUpload = document.getElementById("dragger-upload")
  draggerUpload?.addEventListener("m:change", () => {
    // Dragger upload change handler
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
