const { createTooltip } = window.MarkupUITooltip
const node = id => document.getElementById(id)
const bind = (trigger, panel, options) => createTooltip(node(trigger), node(panel), options)
const controllers = {
  save: bind("save", "save-tip"),
  link: bind("ordinary-link", "link-tip"),
  hover: bind("hover-trigger", "hover-tip", { delay: 120, duration: 180 }),
  peer: bind("peer-trigger", "peer-tip"),
  nested: bind("nested-trigger", "nested-tip"),
  disabledHelp: bind("disabled-help", "disabled-tip"),
  edge: bind("edge-trigger", "edge-tip", { placement: "bottom-start", positioning: "fallback" }),
  bottom: bind("bottom-trigger", "bottom-tip", { placement: "bottom" }),
}
controllers.parent = window.MarkupUIPopover.createPopover(node("popover-trigger"), node("parent-panel"))
node("request-show").addEventListener("click", () => controllers.hover.open())
node("request-hide").addEventListener("click", () => controllers.hover.close())
node("tip-form").addEventListener("submit", event => {
  event.preventDefault()
  node("form-log").value = `Saved ${new FormData(event.currentTarget).get("draft")}`
})
window.tooltipDemo = controllers
