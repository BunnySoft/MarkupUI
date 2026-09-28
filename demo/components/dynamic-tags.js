import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIDynamicTags
  if (!api) throw new Error("DynamicTags runtime did not load.")
  void loadComponentApi(document.getElementById("dynamic-tags-api"), new URL("../api/dynamic-tags.json", import.meta.url))
  const seed = (tags, ...values) => {
    for (const value of values) {
      tags.draft = value
      if (tags.commit().status !== "added") throw new Error(`Unable to seed ${tags.id}.`)
    }
  }

  const basicTags = document.getElementById("basic-tags")
  const basicStatus = document.getElementById("basic-status")
  if (basicTags && basicStatus) {
    seed(basicTags, "MarkupUI", "Web Components")
    basicStatus.textContent = `Tags: ${basicTags.values.join(", ")}`
    basicTags.addEventListener("m:change", event => {
      const detail = event.detail
      const tags = detail?.value || []
      basicStatus.textContent = `Tags: ${tags.length ? tags.join(", ") : "none"}`
    })
  }

  const smallTags = document.getElementById("small-tags")
  if (smallTags) {
    seed(smallTags, "CSS", "HTML")
  }

  const mediumTags = document.getElementById("medium-tags")
  if (mediumTags) {
    seed(mediumTags, "TypeScript", "JavaScript")
  }

  const largeTags = document.getElementById("large-tags")
  if (largeTags) {
    seed(largeTags, "Frontend", "UI")
  }

  const maxTags = document.getElementById("max-tags")
  if (maxTags) {
    seed(maxTags, "Tag 1", "Tag 2")
  }

  const disabledTags = document.getElementById("disabled-tags")
  if (disabledTags) {
    disabledTags.disabled = false
    seed(disabledTags, "Readonly Tag")
    disabledTags.disabled = true
  }
  const toggleBtn = document.getElementById("toggle-disabled")
  if (disabledTags && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      disabledTags.disabled = !disabledTags.disabled
    })
  }

  const form = document.getElementById("tags-form")
  const formTags = document.getElementById("form-tags")
  const feedback = document.getElementById("form-feedback")
  formTags.createTag = value => value.toUpperCase()
  seed(formTags, "ALPHA")
  formTags.addEventListener("m:dynamic-tags-reject", event => { feedback.textContent = event.detail.message })
  formTags.addEventListener("m:change", () => { feedback.textContent = `Current tags: ${formTags.values.join(", ")}` })
  form.addEventListener("submit", event => {
    event.preventDefault()
    feedback.textContent = JSON.stringify([...new FormData(form.native).entries()])
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

