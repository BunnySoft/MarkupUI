import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITable
  if (!api) throw new Error("Table runtime did not load.")
  void loadComponentApi(document.getElementById("table-api"), new URL("../api/table.json", import.meta.url))

  const form = document.querySelector("#note-form")
  form?.addEventListener("submit", (event) => {
    event.preventDefault()
    const status = document.querySelector("#form-status")
    if (status) status.textContent = `Saved note: ${new FormData(form).get("note")}`
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
