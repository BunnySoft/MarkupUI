import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIAlert
  if (!api) throw new Error("Alert runtime did not load.")
  void loadComponentApi(document.getElementById("alert-api"), new URL("../api/alert.json", import.meta.url))

  const notice = document.querySelector("#notice")
  let requests = 0
  let submissions = 0
  let actions = 0
  let updates = 0
  notice?.addEventListener("m:close", (event) => {
    if (event.target !== notice) return
    event.preventDefault()
    const closeStatus = document.querySelector("#close-status")
    if (closeStatus) closeStatus.textContent = `${++requests} close requests; the notice remains visible.`
  })
  document.querySelector("#notice-form")?.addEventListener("submit", (event) => {
    event.preventDefault()
    const submitStatus = document.querySelector("#submit-status")
    if (submitStatus) submitStatus.textContent = `${++submissions} submissions.`
  })
  document.querySelector("#retry")?.addEventListener("click", () => {
    const form = document.querySelector("#notice-form")
    form?.dispatchEvent(new Event("submit", { cancelable: true }))
  })
  document.querySelector("#details")?.addEventListener("click", () => {
    const actionStatus = document.querySelector("#action-status")
    if (actionStatus) actionStatus.textContent = `${++actions} detail actions.`
  })
  document.querySelector("#toggle-icon")?.addEventListener("click", () => {
    if (notice) notice.showIcon = !notice.showIcon
  })
  document.querySelector("#toggle-close")?.addEventListener("click", () => {
    if (notice) notice.closable = !notice.closable
  })
  document.querySelector("#toggle-border")?.addEventListener("click", () => {
    if (notice) notice.bordered = !notice.bordered
  })
  document.querySelector("#reconnect")?.addEventListener("click", () => {
    const parent = notice?.parentElement
    if (!notice || !parent) return
    notice.remove()
    parent.append(notice)
  })
  document.querySelector("#update-status")?.addEventListener("click", () => {
    const politeCopy = document.querySelector("#polite-copy")
    if (politeCopy) politeCopy.textContent = `Saved changes checked ${++updates} times.`
  })
  document.querySelector("#show-urgent")?.addEventListener("click", () => {
    const urgentNotice = document.querySelector("#urgent-notice")
    if (urgentNotice) urgentNotice.hidden = false
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
