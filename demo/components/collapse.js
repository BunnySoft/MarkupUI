const depth = root => {
  let value = 0
  for (let parent = root.parentElement?.closest("[data-collapse]"); parent; parent = parent.parentElement?.closest("[data-collapse]")) value++
  return value
}
const roots = [...document.querySelectorAll("[data-collapse]")]
  .sort((a, b) => depth(b) - depth(a))
const controllers = new Map()

for (const root of roots) {
  controllers.set(root, MarkupUICollapse.createCollapse(root, {
    accordion: root.hasAttribute("data-accordion"),
  }))
}

const eventRoot = document.querySelector("[data-event-collapse]")
eventRoot.addEventListener("mui:collapse-header-click", event => {
  document.querySelector("[data-header-status]").textContent =
    `Name: ${event.detail.name}, Expanded: ${event.detail.expanded}`
})

const triggerRoot = document.querySelector("[data-trigger-collapse]")
triggerRoot.addEventListener("mui:collapse-header-click", event => {
  document.querySelector("[data-trigger-status]").textContent =
    `Main/arrow summary: ${event.detail.name}, expanded ${event.detail.expanded}`
})

for (const extra of document.querySelectorAll("[data-extra-name]")) {
  extra.addEventListener("click", () => {
    document.querySelector("[data-trigger-status]").textContent =
      `Extra ${extra.dataset.extraName} acted without toggling disclosure.`
  })
}

window.collapseParity = { controllers }
