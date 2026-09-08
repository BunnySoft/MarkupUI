const { createMenu } = window.MarkupUIMenu
const node = id => document.getElementById(id)
const controllers = {
  vertical: createMenu(node("vertical-menu"), { defaultValue: "home", defaultExpandedKeys: ["guide"], accordion: true }),
  horizontal: createMenu(node("horizontal-menu")),
}
for (const root of [node("vertical-menu"), node("horizontal-menu")]) {
  root.addEventListener("mui:menu-select", event => {
    node("event-log").value = `Selected ${event.detail.path.join(" > ")}; native href/action remains authored.`
  })
}
node("show-performance").addEventListener("click", () => controllers.vertical.showOption("performance"))
node("toggle-collapse").addEventListener("click", () => { controllers.vertical.collapsed = !controllers.vertical.collapsed })
node("toggle-accordion").addEventListener("click", () => { controllers.vertical.accordion = !controllers.vertical.accordion })
node("demo-form").addEventListener("submit", event => {
  event.preventDefault()
  node("event-log").value = `Ordinary form submitted: ${new FormData(event.currentTarget).get("note")}`
})
window.menuDemo = controllers
