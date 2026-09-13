import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUISkeleton
  if (!api) throw new Error("Skeleton runtime did not load.")
  void loadComponentApi(document.getElementById("skeleton-api"), new URL("../api/skeleton.json", import.meta.url))

  const repeated = document.querySelector("#repeated")
  document.querySelector("#apply-repeat")?.addEventListener("click", () => {
    const input = document.querySelector("#repeat-input")
    if (repeated && input) {
      repeated.setAttribute("repeat", input.value)
      const status = document.querySelector("#validation-status")
      if (status) {
        status.textContent = repeated.valid
          ? `Valid repeat: ${repeated.repeat}.`
          : `Invalid placeholder configuration: ${repeated.validationErrors.join(", ")}.`
      }
    }
  })

  document.querySelector("#toggle-animation")?.addEventListener("click", () => {
    if (repeated) repeated.animated = !repeated.animated
  })

  let loading = true
  document.querySelector("#toggle-loading")?.addEventListener("click", () => {
    loading = !loading
    const owner = document.querySelector("#content-owner")
    const placeholder = document.querySelector("#loading-placeholder")
    const loadedContent = document.querySelector("#loaded-content")
    const status = document.querySelector("#loading-status")
    if (owner) owner.setAttribute("aria-busy", String(loading))
    if (placeholder) placeholder.hidden = !loading
    if (loadedContent) loadedContent.hidden = loading
    if (status) status.textContent = loading ? "Loading the profile." : "Profile loaded."
  })

  const authored = document.querySelector("#authored")
  let actions = 0
  document.querySelector("#authored-action")?.addEventListener("click", () => {
    const status = document.querySelector("#action-status")
    if (status) status.textContent = `${++actions} authored actions.`
  })

  document.querySelector("#reconnect")?.addEventListener("click", () => {
    if (authored && authored.parentElement) {
      const parent = authored.parentElement
      authored.remove()
      parent.append(authored)
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
