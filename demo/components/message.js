import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIMessage
  if (!api) throw new Error("Message runtime did not load.")
  void loadComponentApi(document.getElementById("message-api"), new URL("../api/message.json", import.meta.url))

  const { message } = api
  const status = document.getElementById("service-status")

  document.getElementById("btn-info")?.addEventListener("click", () => {
    message.info("This is an informational message.")
    if (status) status.textContent = "Triggered info message."
  })
  document.getElementById("btn-success")?.addEventListener("click", () => {
    message.success("Operation completed successfully!")
    if (status) status.textContent = "Triggered success message."
  })
  document.getElementById("btn-warning")?.addEventListener("click", () => {
    message.warning("Warning: Please check your settings.")
    if (status) status.textContent = "Triggered warning message."
  })
  document.getElementById("btn-error")?.addEventListener("click", () => {
    message.error("Error: Something went wrong.")
    if (status) status.textContent = "Triggered error message."
  })
  document.getElementById("btn-loading")?.addEventListener("click", () => {
    message.loading("Loading data, please wait...")
    if (status) status.textContent = "Triggered loading message."
  })
  document.getElementById("btn-closable")?.addEventListener("click", () => {
    message.create("Closable message notice", { closable: true, duration: 5000 })
    if (status) status.textContent = "Triggered closable message."
  })
  document.getElementById("btn-destroy")?.addEventListener("click", () => {
    message.destroyAll()
    if (status) status.textContent = "Destroyed all active messages."
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

