import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIBadge
  if (!api) throw new Error("Badge runtime did not load.")
  void loadComponentApi(document.getElementById("badge-api"), new URL("../api/badge.json", import.meta.url))

  const badge = document.querySelector("#unread")
  const target = document.querySelector("#inbox")
  let count = 12
  let submissions = 0
  function update(value) {
    count = value
    badge.value = value
    target?.setAttribute("aria-label", `Inbox, ${value} unread messages`)
    const unreadStatus = document.querySelector("#unread-status")
    if (unreadStatus) unreadStatus.textContent = `${value} unread messages.`
  }
  document.querySelector("#increment")?.addEventListener("click", () => update(count + 1))
  document.querySelector("#zero")?.addEventListener("click", () => update(0))
  document.querySelector("#overflow")?.addEventListener("click", () => update(105))
  document.querySelector("#show-zero")?.addEventListener("change", (event) => { badge.showZero = event.target.checked })
  document.querySelector("#show-indicator")?.addEventListener("change", (event) => { badge.show = event.target.checked })
  document.querySelector("#reconnect")?.addEventListener("click", () => {
    const parent = badge?.parentElement
    if (!badge || !parent) return
    badge.remove()
    parent.append(badge)
  })
  document.querySelector("#message-form")?.addEventListener("submit", (event) => {
    event.preventDefault()
    const submitStatus = document.querySelector("#submit-status")
    if (submitStatus) submitStatus.textContent = `${++submissions} native submissions.`
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
