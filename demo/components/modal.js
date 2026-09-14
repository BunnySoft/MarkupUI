import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIModal
  if (!api) throw new Error("Modal runtime did not load.")
  void loadComponentApi(document.getElementById("modal-api"), new URL("../api/modal.json", import.meta.url))

  const basicModal = document.querySelector("#basic-modal")
  const basicModalStatus = document.querySelector("#basic-modal-status")
  const openBasicModalBtn = document.querySelector("#open-basic-modal")
  const closeBasicModalBtn = document.querySelector("#close-basic-modal")

  openBasicModalBtn?.addEventListener("click", () => {
    basicModal?.showModal()
    if (basicModalStatus) basicModalStatus.textContent = "Modal is open."
  })

  closeBasicModalBtn?.addEventListener("click", () => {
    basicModal?.close("dismissed")
  })

  basicModal?.addEventListener("m:close", (event) => {
    if (basicModalStatus) {
      basicModalStatus.textContent = `Modal closed with value: ${event.detail?.value || "(none)"}`
    }
  })

  const widthModal = document.querySelector("#width-modal")
  const openWidthModalBtn = document.querySelector("#open-width-modal")
  const closeWidthModalBtn = document.querySelector("#close-width-modal")

  openWidthModalBtn?.addEventListener("click", () => {
    widthModal?.showModal()
  })
  closeWidthModalBtn?.addEventListener("click", () => {
    widthModal?.close()
  })

  const staticModal = document.querySelector("#static-modal")
  const openStaticModalBtn = document.querySelector("#open-static-modal")
  const closeStaticModalBtn = document.querySelector("#close-static-modal")

  openStaticModalBtn?.addEventListener("click", () => {
    staticModal?.showModal()
  })
  closeStaticModalBtn?.addEventListener("click", () => {
    staticModal?.close()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

