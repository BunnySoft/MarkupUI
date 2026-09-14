import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIStatistic
  if (!api) throw new Error("Statistic runtime did not load.")
  void loadComponentApi(document.getElementById("statistic-api"), new URL("../api/statistic.json", import.meta.url))

  const authored = document.querySelector("#authored")
  const formatted = document.querySelector("#formatted")
  let actions = 0
  let submissions = 0

  function format(locale) {
    if (formatted) {
      formatted.value = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(12345.6)
    }
  }
  format("en-US")

  document.querySelector("#german")?.addEventListener("click", () => format("de-DE"))
  document.querySelector("#english")?.addEventListener("click", () => format("en-US"))
  document.querySelector("#override")?.addEventListener("click", () => {
    if (authored) authored.value = 0
  })
  document.querySelector("#blank")?.addEventListener("click", () => {
    if (authored) authored.value = ""
  })
  document.querySelector("#restore")?.addEventListener("click", () => {
    if (authored) authored.value = null
  })
  document.querySelector("#tabular")?.addEventListener("click", () => {
    if (authored) authored.tabularNums = !authored.tabularNums
  })
  document.querySelector("#reconnect")?.addEventListener("click", () => {
    const parent = authored?.parentElement
    if (authored && parent) {
      authored.remove()
      parent.append(authored)
    }
  })
  document.querySelector("#details-action")?.addEventListener("click", () => {
    const status = document.querySelector("#action-status")
    if (status) status.textContent = `${++actions} detail actions.`
  })
  document.querySelector("#metric-form")?.addEventListener("submit", (event) => {
    event.preventDefault()
    const status = document.querySelector("#submit-status")
    if (status) status.textContent = `${++submissions} native submissions.`
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

