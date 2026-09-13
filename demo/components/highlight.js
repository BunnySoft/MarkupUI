import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIHighlight
  if (!api) throw new Error("Highlight runtime did not load.")
  void loadComponentApi(document.getElementById("highlight-api"), new URL("../api/highlight.json", import.meta.url))

  const controls = document.querySelector("#matching-controls")
  if (controls) controls.disabled = false
  const form = document.querySelector("#highlight-form")
  const source = document.querySelector("#text-input")
  const patterns = document.querySelector("#pattern-input")
  const sensitive = document.querySelector("#case-sensitive")
  const palette = document.querySelector("#palette")
  const preview = document.querySelector("#preview")
  const declarative = document.querySelector("#declarative-preview")
  const errorMessage = document.querySelector("#error-message")

  function update() {
    try {
      if (preview && source && patterns) {
        const ranges = api.highlightText(preview, source.value, patterns.value.split(/\r?\n/), {
          caseSensitive: sensitive?.checked ?? false,
          highlightClass: palette?.value ?? "",
        })
        const feedback = document.querySelector("#feedback")
        if (feedback) feedback.textContent = `${ranges.length} literal matches. Offsets use the original UTF-16 text.`
      }
      if (declarative && source && patterns) {
        declarative.text = source.value
        declarative.keywords = patterns.value.split(/\r?\n/).filter(line => line.length > 0)
        declarative.caseSensitive = sensitive?.checked ?? false
      }
      if (errorMessage) errorMessage.textContent = ""
    } catch (error) {
      if (!(error instanceof TypeError || error instanceof RangeError)) throw error
      if (errorMessage) errorMessage.textContent = `Preview not updated: ${error.message}`
    }
  }

  form?.addEventListener("submit", event => {
    event.preventDefault()
    update()
  })
  form?.addEventListener("input", update)
  document.querySelector("#clear-patterns")?.addEventListener("click", () => {
    if (patterns) patterns.value = ""
    update()
  })
  update()
  const linkSurface = document.querySelector("#link-surface")
  if (linkSurface) api.highlightText(linkSurface, "Atlas notes", ["Atlas"])
  const rtlSurface = document.querySelector("#rtl-surface")
  if (rtlSurface) api.highlightText(rtlSurface, "بحث Atlas بحث", ["بحث"])
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

