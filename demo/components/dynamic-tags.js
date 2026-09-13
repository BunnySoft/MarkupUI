import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIDynamicTags
  if (!api) throw new Error("DynamicTags runtime did not load.")
  void loadComponentApi(document.getElementById("dynamic-tags-api"), new URL("../api/dynamic-tags.json", import.meta.url))

  const basicTags = document.getElementById("basic-tags")
  const basicStatus = document.getElementById("basic-status")
  if (basicTags && basicStatus) {
    basicTags.add("MarkupUI")
    basicTags.add("Web Components")
    basicStatus.textContent = `Tags: ${basicTags.getTags().join(", ")}`
    basicTags.addEventListener("m:change", event => {
      const detail = event.detail
      const tags = detail?.value || []
      basicStatus.textContent = `Tags: ${tags.length ? tags.join(", ") : "none"}`
    })
  }

  const smallTags = document.getElementById("small-tags")
  if (smallTags) {
    smallTags.add("CSS")
    smallTags.add("HTML")
  }

  const mediumTags = document.getElementById("medium-tags")
  if (mediumTags) {
    mediumTags.add("TypeScript")
    mediumTags.add("JavaScript")
  }

  const largeTags = document.getElementById("large-tags")
  if (largeTags) {
    largeTags.add("Frontend")
    largeTags.add("UI")
  }

  const maxTags = document.getElementById("max-tags")
  if (maxTags) {
    maxTags.add("Tag 1")
    maxTags.add("Tag 2")
  }

  const disabledTags = document.getElementById("disabled-tags")
  if (disabledTags) {
    disabledTags.add("Readonly Tag")
  }
  const toggleBtn = document.getElementById("toggle-disabled")
  if (disabledTags && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      disabledTags.disabled = !disabledTags.disabled
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

