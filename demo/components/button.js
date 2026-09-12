import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIButton
  if (!api) throw new Error("Button runtime did not load.")
  void loadComponentApi(document.getElementById("button-api"), new URL("../api/button.json", import.meta.url))

  const eventMessage = document.getElementById("event-message")
  document.getElementById("event-button").addEventListener("click", () => {
    eventMessage.textContent = "Button Clicked"
  })

  const form = document.getElementById("button-form")
  const formMessage = document.getElementById("form-message")
  form.addEventListener("submit", event => {
    event.preventDefault()
    const data = new FormData(form, event.submitter)
    formMessage.textContent = `Submitted ${data.get("title")} (${data.get("action")})`
  })
  form.addEventListener("reset", () => { formMessage.textContent = "Form reset" })

  const loadingButtons = [...document.querySelectorAll("[data-loading-button]")]
  let loadingTimer
  function startLoading() {
    clearTimeout(loadingTimer)
    for (const button of loadingButtons) button.loading = true
    loadingTimer = setTimeout(() => {
      for (const button of loadingButtons) button.loading = false
    }, 2000)
  }
  for (const button of loadingButtons) button.addEventListener("click", startLoading)
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
