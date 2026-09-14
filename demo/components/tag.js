import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITag
  if (!api) throw new Error("Tag runtime did not load.")
  void loadComponentApi(document.getElementById("tag-api"), new URL("../api/tag.json", import.meta.url))

  const topic = document.querySelector("#topic")
  let changes = 0
  let submissions = 0
  topic?.addEventListener("m:change", (event) => {
    const status = document.querySelector("#change-status")
    if (status) status.textContent = `${++changes} changes; Design is ${event.detail ? "checked" : "unchecked"}.`
  })
  document.querySelector("#tag-form")?.addEventListener("submit", (event) => {
    event.preventDefault()
    const status = document.querySelector("#form-status")
    if (status) status.textContent = `${++submissions} submissions.`
  })
  document.querySelector("#assign-checked")?.addEventListener("click", () => {
    if (topic) topic.checked = true
  })
  document.querySelector("#toggle-disabled")?.addEventListener("click", () => {
    if (topic) topic.disabled = !topic.disabled
  })
  document.querySelector("#reconnect-topic")?.addEventListener("click", () => {
    if (!topic) return
    const parent = topic.parentElement
    topic.remove()
    parent?.prepend(topic)
  })
  const closable = document.querySelector("#closable-tag")
  let requests = 0
  let clicks = 0
  closable?.addEventListener("m:close", (event) => {
    event.preventDefault()
    const status = document.querySelector("#close-status")
    if (status) status.textContent = `${++requests} close requests; Project remains visible.`
  })
  closable?.addEventListener("click", () => {
    const status = document.querySelector("#click-status")
    if (status) status.textContent = `${++clicks} tag click callbacks.`
  })
  document.querySelector("#propagate-close")?.addEventListener("change", (event) => {
    if (closable) closable.triggerClickOnClose = event.target.checked
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
