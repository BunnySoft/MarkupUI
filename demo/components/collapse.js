const { createCollapse } = window.MarkupUICollapse
const node = id => document.getElementById(id)
const controllers = {
  primary: createCollapse(node("primary-group"), { accordion: true }),
  nested: createCollapse(node("nested-group"), { accordion: true }),
  separate: createCollapse(node("separate-group"), { accordion: true }),
}
for (const root of [node("primary-group"), node("nested-group"), node("separate-group")]) {
  root.addEventListener("mui:collapse-header-click", event => {
    node("event-log").value = `${root.id}: ${event.detail.name}, expanded ${event.detail.expanded}`
  })
}
node("extra-action").addEventListener("click", () => { node("event-log").value = "Extra action ran once; no disclosure was toggled." })
node("toggle-accordion").addEventListener("click", () => { controllers.primary.accordion = !controllers.primary.accordion })
node("toggle-disabled").addEventListener("click", () => controllers.primary.setDisabled("disabled", !node("disabled-item").hasAttribute("data-collapse-disabled")))
node("open-disabled").addEventListener("click", () => { controllers.primary.expandedNames = "disabled" })
node("demo-form").addEventListener("submit", event => {
  event.preventDefault()
  node("event-log").value = `Ordinary form: ${new FormData(event.currentTarget).get("note")}`
})
window.collapseDemo = controllers
