const { createDropdown } = window.MarkupUIDropdown
const node = id => document.getElementById(id)
const controllers = {
  main: createDropdown(node("main-trigger"), node("main-menu"), { value: "edit" }),
  rtl: createDropdown(node("rtl-trigger"), node("rtl-menu"), { positioning: "fallback", placement: "bottom-start" }),
  bottom: createDropdown(node("bottom-trigger"), node("bottom-menu"), { placement: "bottom" }),
}
for (const menu of [node("main-menu"), node("rtl-menu"), node("bottom-menu")]) {
  menu.addEventListener("mui:dropdown-select", event => {
    node("selection-log").value = `Selected ${event.detail.path.join(" > ")}`
  })
}
node("toggle-profile").addEventListener("click", () => {
  node("profile").closest("li").hidden = !node("profile").closest("li").hidden
})
node("demo-form").addEventListener("submit", event => {
  event.preventDefault()
  node("selection-log").value = `Ordinary form: ${new FormData(event.currentTarget).get("title")}`
})
window.dropdownDemo = controllers
