import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIAffix
  if (!api) throw new Error("Affix runtime did not load.")
  void loadComponentApi(document.getElementById("affix-api"), new URL("../api/affix.json", import.meta.url))

  function scrollToEdge(id, end) {
    const element = document.getElementById(id)
    if (!element) return
    element.scrollTo({
      top: end ? element.scrollHeight : 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    })
  }
  document.querySelector("#nested-end")?.addEventListener("click", () => scrollToEdge("nested-scroll", true))
  document.querySelector("#bottom-start")?.addEventListener("click", () => scrollToEdge("bottom-scroll", false))
  const form = document.querySelector("#native-form")
  form?.addEventListener("submit", event => {
    event.preventDefault()
    const status = document.querySelector("#form-status")
    if (status && form instanceof HTMLFormElement) {
      status.textContent = `Saved project: ${new FormData(form).get("project")}`
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

