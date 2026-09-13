import { loadComponentApi } from "../component-api.js"

function initialize() {
  const apiContainer = document.getElementById("dialog-api")
  if (apiContainer) {
    void loadComponentApi(apiContainer, new URL("../api/dialog.json", import.meta.url))
  }

  const basicDialog = document.getElementById("basic-dialog")
  document.getElementById("open-basic")?.addEventListener("click", () => {
    basicDialog?.showModal()
  })
  document.getElementById("basic-cancel")?.addEventListener("click", () => {
    basicDialog?.close("cancel")
  })
  document.getElementById("basic-confirm")?.addEventListener("click", () => {
    basicDialog?.close("confirm")
  })

  const typeDialog = document.getElementById("type-dialog")
  const typeBody = document.getElementById("type-dialog-body")
  for (const type of ["info", "success", "warning", "error"]) {
    document.getElementById(`open-${type}`)?.addEventListener("click", () => {
      if (typeDialog) {
        typeDialog.type = type
        if (typeBody) typeBody.textContent = `Showing a ${type} status dialog.`
        typeDialog.showModal()
      }
    })
  }
  document.getElementById("type-close")?.addEventListener("click", () => {
    typeDialog?.close()
  })

  const regionsDialog = document.getElementById("regions-dialog")
  document.getElementById("open-regions")?.addEventListener("click", () => {
    regionsDialog?.showModal()
  })
  document.getElementById("regions-cancel")?.addEventListener("click", () => {
    regionsDialog?.close("decline")
  })
  document.getElementById("regions-confirm")?.addEventListener("click", () => {
    regionsDialog?.close("accept")
  })

  const maskDialog = document.getElementById("mask-dialog")
  document.getElementById("open-mask-disabled")?.addEventListener("click", () => {
    maskDialog?.showModal()
  })
  document.getElementById("mask-close")?.addEventListener("click", () => {
    maskDialog?.close()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

