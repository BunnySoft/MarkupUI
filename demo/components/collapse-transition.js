const api = window.MarkupUICollapseTransition
const root = document.querySelector("#panel")
const toggle = document.querySelector("#toggle")
const status = document.querySelector("#status")
const calls = []
let controller
function record(name, event) {
  calls.push(name)
  status.textContent = `${name}: target ${event.show ? "open" : "closed"}.`
}
controller = api.createCollapseTransition(root, {
  duration: 700,
  focusTarget: toggle,
  onEnter: event => record("enter", event),
  onLeave: event => record("leave", event),
  onAfterEnter: event => {
    record("after-enter", event)
    if (document.querySelector("#throw-hook").checked) { document.querySelector("#throw-hook").checked = false; throw new Error("Local hook failure") }
  },
  onAfterLeave: event => record("after-leave", event),
  onCancel: event => record("cancel", event),
})
const appearance = api.createCollapseTransition(document.querySelector("#appearance"), { show: true, appear: true, duration: 700 })
root.addEventListener("mui:collapse-transition-error", event => { event.preventDefault(); status.textContent = event.detail.error.message })
function set(show) {
  try {
    const done = controller.setShow(show)
    toggle.setAttribute("aria-expanded", String(controller.show))
    void done.catch(error => { status.textContent = error.message; toggle.setAttribute("aria-expanded", String(controller.show)) })
  } catch (error) { status.textContent = error.message }
}
document.querySelector("#controls").hidden = false
toggle.addEventListener("click", () => set(!controller.show))
document.querySelector("#show").addEventListener("click", () => set(true))
document.querySelector("#hide").addEventListener("click", () => set(false))
document.querySelector("#inside-hide").addEventListener("click", () => set(false))
document.querySelector("#reverse").addEventListener("click", () => { set(false); set(true); set(false); set(true) })
document.querySelector("#finish").addEventListener("click", () => { void controller.finish().catch(error => { status.textContent = error.message }) })
document.querySelector("#cancel").addEventListener("click", () => controller.cancel())
document.querySelector("#grow").addEventListener("click", () => {
  const p = document.createElement("p"); p.textContent = "Additional authored text changes intrinsic height without remounting the content."
  document.querySelector("#extra").append(p)
})
document.querySelector("#dispose").addEventListener("click", () => {
  try { controller.dispose(); toggle.setAttribute("aria-expanded", String(!root.hidden)); status.textContent = "Disposed; original authored visibility restored." }
  catch (error) { status.textContent = error.message }
})
document.querySelector("#native-form").addEventListener("submit", event => { event.preventDefault(); status.textContent = "Native form validated and submitted locally." })
window.collapseTransitionDemo = { controller, appearance, calls }
