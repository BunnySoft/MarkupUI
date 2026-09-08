const { createPopconfirm } = window.MarkupUIPopconfirm
const node = id => document.getElementById(id)
const simulated = () => {
  const outcome = node("outcome").value
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (outcome.includes("reject")) reject(new Error("Local simulated failure"))
      else resolve(outcome !== "false")
    }, outcome.startsWith("slow") ? 1400 : 450)
  })
}
const controllers = {
  main: createPopconfirm(node("main-trigger"), node("main-panel"), { onPositive: simulated }),
  nested: createPopconfirm(node("nested-trigger"), node("nested-panel"), { onPositive: () => true }),
  edge: createPopconfirm(node("edge-trigger"), node("edge-panel"), { placement: "bottom-start", positioning: "fallback" }),
  bottom: createPopconfirm(node("bottom-trigger"), node("bottom-panel"), { placement: "bottom" }),
  parent: window.MarkupUIPopover.createPopover(node("parent-trigger"), node("parent-panel")),
}
node("demo-form").addEventListener("submit", event => {
  event.preventDefault()
  node("result-log").value = `Ordinary form submitted: ${new FormData(event.currentTarget).get("draft")}`
})
for (const panel of document.querySelectorAll(".mui-popconfirm")) {
  panel.addEventListener("mui:popconfirm-error", event => {
    node("result-log").value = `Local ${event.detail.action ?? "anatomy"} error${event.detail.stale ? " (stale UI session)" : ""}`
  })
  panel.addEventListener("toggle", event => {
    if (event.target === panel) node("result-log").value = `${panel.id}: ${panel.matches(":popover-open") ? "open" : "closed"}`
  })
}
window.popconfirmDemo = controllers
