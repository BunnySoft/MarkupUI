import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUITypography) throw new Error("Typography runtime did not load.")
  void loadComponentApi(document.getElementById("typography-api"), new URL("../api/typography.json", import.meta.url))
  const heading = document.getElementById("live-title")
  const paragraph = document.getElementById("live-paragraph")
  const documentScope = document.getElementById("live-document")
  const status = document.getElementById("typography-status")
  const update = () => { status.textContent = `Level: ${heading.level}; tone: ${paragraph.type}` }
  document.getElementById("change-level").addEventListener("click", () => {
    heading.level = heading.level === 2 ? 3 : 2
    update()
  })
  document.getElementById("change-tone").addEventListener("click", () => {
    paragraph.type = paragraph.type === "default" ? "success" : "default"
    heading.type = paragraph.type
    update()
  })
  document.getElementById("reconnect-typography").addEventListener("click", () => {
    const parent = documentScope.parentElement
    const next = documentScope.nextSibling
    documentScope.remove()
    parent.insertBefore(documentScope, next)
    update()
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
