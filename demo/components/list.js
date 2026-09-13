import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUIList) throw new Error("List runtime did not load.")
  void loadComponentApi(document.getElementById("list-api"), new URL("../api/list.json", import.meta.url)).catch(() => {})

  const status = document.getElementById("action-status")
  const archiveBtn = document.getElementById("archive-alpha")
  if (archiveBtn && status) {
    archiveBtn.addEventListener("click", () => {
      status.textContent = "Archive Alpha requested; the application owns any list changes."
    })
  }

  const openBtn = document.getElementById("open-report")
  if (openBtn && status) {
    openBtn.addEventListener("click", () => {
      status.textContent = "Report preview requested."
    })
  }

  const form = document.getElementById("native-form")
  const formStatus = document.getElementById("form-status")
  if (form && formStatus) {
    form.addEventListener("submit", event => {
      event.preventDefault()
      const data = new FormData(form)
      formStatus.textContent = `Saved report: ${data.get("name")}`
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
