const fallback = document.querySelector("#fallback")
const authored = document.querySelector("#authored")
let submissions = 0
let actions = 0
let templateActions = 0
document.querySelector("#localize").addEventListener("click", () => { fallback.description = "暂无数据" })
document.querySelector("#restore-description").addEventListener("click", () => { fallback.description = null })
document.querySelector("#glyph").addEventListener("click", () => { fallback.icon = "◇" })
document.querySelector("#illustration").addEventListener("click", () => { fallback.icon = null })
document.querySelector("#report-form").addEventListener("submit", (event) => {
  event.preventDefault()
  document.querySelector("#form-status").textContent = `${++submissions} submissions.`
})
document.querySelector("#browse").addEventListener("click", () => {
  document.querySelector("#action-status").textContent = `${++actions} browse actions.`
})
document.querySelector("#toggle-description").addEventListener("click", () => { authored.showDescription = !authored.showDescription })
document.querySelector("#toggle-icon").addEventListener("click", () => { authored.showIcon = !authored.showIcon })
document.querySelector("#toggle-extra").addEventListener("click", () => {
  const extra = authored.querySelector("[data-mui-empty-extra]")
  extra.hidden = !extra.hidden
})
document.querySelector("#reconnect").addEventListener("click", () => {
  const parent = authored.parentElement
  authored.remove()
  parent.append(authored)
})
document.querySelector("#clone-template").addEventListener("click", () => {
  const template = document.querySelector("#empty-template")
  const content = document.importNode(template.content, true)
  content.querySelector("button").addEventListener("click", () => {
    document.querySelector("#template-status").textContent = `${++templateActions} template actions.`
  })
  document.querySelector("#template-target").replaceChildren(content)
})
