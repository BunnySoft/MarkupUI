import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUINotification
  if (!api) throw new Error("Notification runtime did not load.")
  void loadComponentApi(document.getElementById("notification-api"), new URL("../api/notification.json", import.meta.url))

  const { notification } = api

  const closable = document.querySelector("#closable-demo")
  const closeLog = document.querySelector("#close-log")
  closable?.addEventListener("m:close", (event) => {
    const detail = event.detail
    if (closeLog) closeLog.textContent = `Dismissed notification: ${detail?.value || "closed"}`
  })

  document.querySelector("#btn-info")?.addEventListener("click", () => {
    notification.info({
      title: "Information",
      description: "Here is helpful information for your workflow.",
      closable: true,
    })
  })

  document.querySelector("#btn-success")?.addEventListener("click", () => {
    notification.success({
      title: "Success",
      description: "The requested operation finished successfully.",
      closable: true,
    })
  })

  document.querySelector("#btn-warning")?.addEventListener("click", () => {
    notification.warning({
      title: "Warning",
      description: "Please check your network settings and retry.",
      closable: true,
    })
  })

  document.querySelector("#btn-error")?.addEventListener("click", () => {
    notification.error({
      title: "Error",
      description: "An unexpected error occurred while saving.",
      closable: true,
    })
  })

  document.querySelector("#btn-destroy")?.addEventListener("click", () => {
    notification.destroyAll()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

