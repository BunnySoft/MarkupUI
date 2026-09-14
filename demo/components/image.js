import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIImage
  if (!api) throw new Error("Image runtime did not load.")
  void loadComponentApi(document.getElementById("image-api"), new URL("../api/image.json", import.meta.url))

  const previewImage = document.getElementById("preview-image")
  document.getElementById("open-preview")?.addEventListener("click", () => {
    if (previewImage && typeof previewImage.openPreview === "function") {
      previewImage.openPreview()
    }
  })

  const group = document.getElementById("gallery-group")
  const galleryStatus = document.getElementById("gallery-status")
  document.getElementById("open-gallery")?.addEventListener("click", () => {
    if (group && typeof group.open === "function") {
      group.open(0)
    }
  })

  group?.addEventListener("m:image-change", (event) => {
    if (galleryStatus) {
      galleryStatus.textContent = `Viewing image index ${event.detail.current}`
    }
  })

  const fallbackImage = document.getElementById("fallback-image")
  const fallbackStatus = document.getElementById("fallback-status")
  fallbackImage?.addEventListener("m:load", (event) => {
    if (fallbackStatus) {
      fallbackStatus.textContent = `Loaded image: ${event.detail.src}`
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()