const { createTabs } = window.MarkupUITabs
const node = id => document.getElementById(id)
const beforeLeave = () => {
  const mode = node("guard-mode").value
  if (mode === "deny") return false
  if (mode === "reject") return Promise.reject(new Error("Local simulated rejection"))
  if (mode.startsWith("slow")) return new Promise((resolve, reject) => setTimeout(() => {
    if (mode === "slow-reject") reject(new Error("Late local rejection"))
    else resolve(true)
  }, 700))
  return true
}
const controllers = {
  main: createTabs(node("main-tabs"), { beforeLeave }),
  nested: createTabs(node("nested-tabs")),
  manual: createTabs(node("manual-tabs"), { activation: "manual" }),
}
let sequence = 0
node("main-tabs").addEventListener("mui:tabs-add", () => {
  const fragment = node("pair-template").content.cloneNode(true)
  const tab = fragment.querySelector("[data-tabs-tab]")
  const pane = fragment.querySelector("[data-tabs-pane]")
  const key = `extra-${++sequence}`
  tab.id = `tab-${key}`
  pane.id = `pane-${key}`
  tab.setAttribute("data-tabs-key", key)
  tab.setAttribute("data-tabs-target", pane.id)
  tab.textContent = `Extra ${sequence}`
  pane.querySelector("h2").textContent = tab.textContent
  node("main-tabs").querySelector("[data-tabs-list]").append(tab)
  node("main-tabs").querySelector("[data-tabs-panels]").append(pane)
  controllers.main.refresh()
  controllers.main.value = key
  tab.focus()
})
node("main-tabs").addEventListener("mui:tabs-close", event => {
  const { value, tab, panel } = event.detail
  tab.remove()
  panel.remove()
  for (const button of node("main-tabs").querySelectorAll("[data-tabs-close]")) {
    if (button.getAttribute("data-tabs-close") === value) button.remove()
  }
  controllers.main.refresh()
})
for (const root of [node("main-tabs"), node("nested-tabs"), node("manual-tabs")]) {
  root.addEventListener("mui:tabs-change", event => { node("event-log").value = `${root.id}: ${event.detail.value}` })
  root.addEventListener("mui:tabs-error", event => { node("event-log").value = `Guard error${event.detail.stale ? " (stale request)" : ""}` })
}
node("demo-form").addEventListener("submit", event => {
  event.preventDefault()
  node("event-log").value = `Ordinary form: ${new FormData(event.currentTarget).get("draft")}`
})
window.tabsDemo = controllers
