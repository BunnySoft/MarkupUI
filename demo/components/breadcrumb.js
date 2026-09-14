import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIBreadcrumb
  if (!api) throw new Error("Breadcrumb runtime did not load.")
  void loadComponentApi(document.getElementById("breadcrumb-api"), new URL("../api/breadcrumb.json", import.meta.url))

  const breadcrumb = document.getElementById("interactive-breadcrumb")
  const status = document.getElementById("interactive-status")

  document.getElementById("set-slash")?.addEventListener("click", () => {
    if (breadcrumb) {
      breadcrumb.separator = "/"
      if (status) status.textContent = 'Separator changed to "/"'
    }
  })

  document.getElementById("set-chevron")?.addEventListener("click", () => {
    if (breadcrumb) {
      breadcrumb.separator = ">"
      if (status) status.textContent = 'Separator changed to ">"'
    }
  })

  document.getElementById("set-arrow")?.addEventListener("click", () => {
    if (breadcrumb) {
      breadcrumb.separator = "→"
      if (status) status.textContent = 'Separator changed to "→"'
    }
  })

  let count = 0
  document.getElementById("add-item")?.addEventListener("click", () => {
    if (breadcrumb) {
      count++
      const item = document.createElement("m-breadcrumb-item")
      item.href = `#sub-${count}`
      const text = document.createElement("m-text")
      text.textContent = `Sub-page ${count}`
      item.append(text)
      breadcrumb.append(item)
      if (status) status.textContent = `Added Sub-page ${count}`
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
