const { createPopover } = window.MarkupUIPopover
const node = id => document.getElementById(id)
const bind = (trigger, panel, options) => createPopover(node(trigger), node(panel), options)
const controllers = {
  click: bind("click-trigger", "click-panel"),
  nested: bind("nested-trigger", "nested-panel", { placement: "right-start" }),
  hover: bind("hover-trigger", "hover-panel", { trigger: "hover", delay: 100, duration: 150 }),
  focus: bind("focus-trigger", "focus-panel", { trigger: "focus" }),
  manual: bind("manual-trigger", "manual-panel", { trigger: "manual" }),
  edge: bind("edge-trigger", "edge-panel", { placement: "bottom-start", positioning: "fallback" }),
  bottom: bind("edge-bottom", "bottom-panel", { placement: "bottom" }),
}
node("manual-trigger").addEventListener("click", () => controllers.manual.open())
node("manual-close").addEventListener("click", () => controllers.manual.close())
node("demo-form").addEventListener("submit", event => {
  event.preventDefault()
  node("event-log").value = `Submitted ${new FormData(event.currentTarget).get("note")}`
})
for (const panel of document.querySelectorAll(".mui-popover")) {
  panel.addEventListener("toggle", event => {
    if (event.target === panel) node("event-log").value = `${panel.id}: ${panel.matches(":popover-open") ? "open" : "closed"}`
  })
}
window.popoverDemo = controllers
