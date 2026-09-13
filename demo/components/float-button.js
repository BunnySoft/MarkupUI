import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIFloatButton
  if (!api) throw new Error("Float Button runtime did not load.")
  void loadComponentApi(document.getElementById("float-button-api"), new URL("../api/float-button.json", import.meta.url))

  const feedback = document.querySelector("#action-feedback")
  for (const id of ["single-action", "badge-action", "record-action"]) {
    document.getElementById(id)?.addEventListener("click", () => {
      if (feedback) feedback.textContent = `Application received ${id}.`
    })
  }
  const panel = document.querySelector("#quick-panel")
  if (panel && "showPopover" in HTMLElement.prototype) {
    panel.addEventListener("toggle", event => {
      const toggleFeedback = document.querySelector("#toggle-feedback")
      if (toggleFeedback) toggleFeedback.textContent = `Native popover is ${event.newState}.`
    })
  }
  const form = document.querySelector("#native-form")
  form?.addEventListener("submit", event => {
    event.preventDefault()
    const formFeedback = document.querySelector("#form-feedback")
    if (formFeedback && form instanceof HTMLFormElement) {
      formFeedback.textContent = `Saved project: ${new FormData(form).get("project")}`
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

