import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIProgress
  if (!api) throw new Error("Progress runtime did not load.")
  void loadComponentApi(document.getElementById("progress-api"), new URL("../api/progress.json", import.meta.url))

  const upload = document.querySelector("#upload")
  const legacy = document.querySelector("#legacy")
  const gradientLine = document.querySelector("#gradient-line")
  const gradientCircle = document.querySelector("#gradient-circle")
  const multiple = document.querySelector("#multiple")
  if (gradientLine) gradientLine.color = { stops: ["#2080f0", "#18a058"] }
  if (gradientCircle) gradientCircle.color = { stops: ["#7040a0", "#2080f0"] }
  if (multiple) {
    multiple.color = ["#2080f0", { stops: ["#18a058", "#d03050"] }, "#7040a0"]
    multiple.railColor = ["#dde8f6", "#dfeee5", "#ece3f4"]
  }
  document.querySelector("#advance")?.addEventListener("click", () => {
    if (!upload) return
    upload.percentage = Math.min(100, Number(upload.percentage) + 10)
    const status = document.querySelector("#value-status")
    if (status) status.textContent = `Upload is ${upload.percentage}%.`
  })
  document.querySelector("#toggle-unknown")?.addEventListener("click", () => {
    if (upload) upload.indeterminate = !upload.indeterminate
  })
  document.querySelector("#toggle-indicator")?.addEventListener("click", () => {
    if (upload) upload.showIndicator = !upload.showIndicator
  })
  document.querySelector("#invalid-max")?.addEventListener("click", () => {
    if (!legacy) return
    legacy.setAttribute("max", "0")
    const status = document.querySelector("#validation-status")
    if (status) status.textContent = `Invalid fields: ${legacy.validationErrors.join(", ")}.`
  })
  document.querySelector("#restore-max")?.addEventListener("click", () => {
    if (!legacy) return
    legacy.max = 50
    const status = document.querySelector("#validation-status")
    if (status) status.textContent = "Legacy range is valid."
  })
  document.querySelector("#reconnect")?.addEventListener("click", () => {
    if (!upload) return
    const parent = upload.parentElement
    const next = upload.nextSibling
    upload.remove()
    parent?.insertBefore(upload, next)
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

