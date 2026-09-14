import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIPageHeader
  if (!api) throw new Error("Page Header runtime did not load.")
  void loadComponentApi(document.getElementById("page-header-api"), new URL("../api/page-header.json", import.meta.url))

  const dynamicHeader = document.querySelector("#dynamic-header")
  const backStatus = document.querySelector("#back-status")
  let backCount = 0

  dynamicHeader?.addEventListener("m:back", () => {
    backCount += 1
    if (backStatus) backStatus.textContent = `Back event received: ${backCount} times.`
  })

  document.querySelector("#change-title")?.addEventListener("click", () => {
    if (dynamicHeader) dynamicHeader.title = "Updated Project Title"
  })

  document.querySelector("#change-subtitle")?.addEventListener("click", () => {
    if (dynamicHeader) dynamicHeader.subtitle = "Updated subtitle via property assignment"
  })

  document.querySelector("#reset-titles")?.addEventListener("click", () => {
    if (dynamicHeader) {
      dynamicHeader.title = "Dynamic Page Header"
      dynamicHeader.subtitle = "Configured with title and subtitle properties"
    }
  })

  const form = document.getElementById("record-form")
  const result = document.getElementById("application-result")
  let submitCount = 0

  form?.addEventListener("submit", (event) => {
    event.preventDefault()
    submitCount += 1
    if (result) result.textContent = `Application saved (${submitCount}): ${new FormData(form).get("name")}`
  })

  form?.addEventListener("reset", () => {
    if (result) result.textContent = "Native reset requested."
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
