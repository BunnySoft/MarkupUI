import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIEmpty
  if (!api) throw new Error("Empty runtime did not load.")
  void loadComponentApi(document.getElementById("empty-api"), new URL("../api/empty.json", import.meta.url))

  const fallback = document.querySelector("#fallback")
  const authored = document.querySelector("#authored")
  let submissions = 0
  let actions = 0
  let templateActions = 0
  document.querySelector("#localize")?.addEventListener("click", () => { fallback.description = "暂无数据" })
  document.querySelector("#restore-description")?.addEventListener("click", () => { fallback.description = null })
  document.querySelector("#glyph")?.addEventListener("click", () => { fallback.icon = "◇" })
  document.querySelector("#illustration")?.addEventListener("click", () => { fallback.icon = null })
  document.querySelector("#report-form")?.addEventListener("submit", (event) => {
    event.preventDefault()
    const formStatus = document.querySelector("#form-status")
    if (formStatus) formStatus.textContent = `${++submissions} submissions.`
  })
  document.querySelector("#browse")?.addEventListener("click", () => {
    const actionStatus = document.querySelector("#action-status")
    if (actionStatus) actionStatus.textContent = `${++actions} browse actions.`
  })
  document.querySelector("#toggle-description")?.addEventListener("click", () => { authored.showDescription = !authored.showDescription })
  document.querySelector("#toggle-icon")?.addEventListener("click", () => { authored.showIcon = !authored.showIcon })
  document.querySelector("#toggle-extra")?.addEventListener("click", () => {
    const extra = authored?.querySelector("[data-m-empty-extra]")
    if (extra) extra.hidden = !extra.hidden
  })
  document.querySelector("#reconnect")?.addEventListener("click", () => {
    const parent = authored?.parentElement
    if (!authored || !parent) return
    authored.remove()
    parent.append(authored)
  })
  document.querySelector("#clone-template")?.addEventListener("click", () => {
    const template = document.querySelector("#empty-template")
    if (!template) return
    const content = document.importNode(template.content, true)
    content.querySelector("#template-action, button, m-button")?.addEventListener("click", () => {
      const templateStatus = document.querySelector("#template-status")
      if (templateStatus) templateStatus.textContent = `${++templateActions} template actions.`
    })
    document.querySelector("#template-target")?.replaceChildren(content)
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
