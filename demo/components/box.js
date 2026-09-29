import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIBox
  if (!api) throw new Error("Box runtime did not load.")
  void loadComponentApi(document.getElementById("box-api"), new URL("../api/box.json", import.meta.url))
  const root = document.getElementById("conditional-editor")
  const toggle = document.getElementById("toggle-editor")
  const status = document.getElementById("conditional-status")
  try {
    const state = globalThis.MarkupUIState
    if (!state) throw new Error("State runtime did not load.")
    const store = state.createStore({ editing: true, title: "Quarterly report" })
    let binding = state.bind(root, store)
    toggle.addEventListener("click", () => {
      try {
        store.set("editing", !store.get("editing"))
        toggle.textContent = store.get("editing") ? "Close editor" : "Edit report"
      } catch (error) { status.textContent = error.message }
    })
    window.addEventListener("pagehide", () => binding())
    window.addEventListener("pageshow", event => {
      if (event.persisted) {
        try { binding = state.bind(root, store) } catch (error) { status.textContent = error.message }
      }
    })
  } catch (error) { status.textContent = error.message }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
