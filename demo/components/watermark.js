import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIWatermark
  if (!api) throw new Error("Watermark runtime did not load.")
  void loadComponentApi(document.getElementById("watermark-api"), new URL("../api/watermark.json", import.meta.url))

  const watermark = document.getElementById("dynamic-watermark")
  const contentInput = document.getElementById("content-input")
  const rotateInput = document.getElementById("rotate-input")
  const crossInput = document.getElementById("cross-input")
  const fullscreenInput = document.getElementById("fullscreen-input")
  const countButton = document.getElementById("count-button")

  if (watermark && contentInput) {
    contentInput.addEventListener("input", () => {
      watermark.content = contentInput.value
    })
  }
  if (watermark && rotateInput) {
    rotateInput.addEventListener("input", () => {
      const val = Number(rotateInput.value)
      if (Number.isFinite(val)) watermark.rotate = val
    })
  }
  if (watermark && crossInput) {
    crossInput.addEventListener("change", () => {
      watermark.cross = crossInput.checked
    })
  }
  if (watermark && fullscreenInput) {
    fullscreenInput.addEventListener("change", () => {
      watermark.fullscreen = fullscreenInput.checked
    })
  }

  let count = 0
  if (countButton) {
    countButton.addEventListener("click", () => {
      countButton.textContent = `Native action count: ${++count}`
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

