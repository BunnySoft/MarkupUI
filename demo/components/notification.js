const api = window.MarkupUINotification
const events = document.querySelector("#events")
const fixed = api.createNotificationOwner(document.querySelector("#fixed-host"), { max: 3, keepAliveOnHover: true, template: document.querySelector("#notification-template"), focusFallback: document.querySelector("#create") })
const inline = api.createNotificationOwner(document.querySelector("#inline-host"), { max: 2, focusFallback: document.querySelector("#inline-create") })
const inside = api.createNotificationOwner(document.querySelector("#inside-host"), { max: 2, focusFallback: document.querySelector("#inside-create") })
const modal = window.MarkupUIModal.createModal(document.querySelector("#local-modal"))
let last
let sequence = 0
let calls = 0
function decide() {
  calls++
  const behavior = document.querySelector("#behavior").value
  if (behavior === "false") return false
  if (behavior === "throw") throw new Error("Simulated synchronous close failure")
  if (behavior === "reject") return Promise.reject(new Error("Simulated rejected close"))
  if (behavior === "slow") return new Promise(resolve => setTimeout(() => resolve(true), 800))
}
function run(action, errorRegion = document.querySelector("#operation-error")) {
  errorRegion.textContent = ""
  try { action() } catch (error) { errorRegion.textContent = error.message }
}
document.querySelector("#controls").hidden = false
document.querySelector("#types").addEventListener("click", event => {
  const type = event.target.closest("[data-type]")?.dataset.type
  if (!type) return
  run(() => { last = fixed[type]({ title: `Local project ${++sequence}`, description: "Native authored actions and heading level.", content: "Plain text\npreserves line breaks.", meta: "Local demo only.", action: "Choose the native controls below.", duration: Number(document.querySelector("#duration").value), onClose: decide }) })
})
document.querySelector("#placement").addEventListener("change", event => { document.querySelector("#fixed-host").dataset.feedbackPlacement = event.target.value })
document.querySelector("#update").addEventListener("click", () => run(() => last?.update({ type: "success", title: "Explicitly updated", content: "A newer state supersedes any pending close decision.", duration: Number(document.querySelector("#duration").value) })))
document.querySelector("#destroy-last").addEventListener("click", () => last?.destroy())
document.querySelector("#clear").addEventListener("click", () => fixed.destroyAll())
document.querySelector("#inline-create").addEventListener("click", () => run(() => inline.info({ title: "Silent inline card", content: "This host deliberately has announcements off." })))
document.querySelector("#open-modal").addEventListener("click", event => modal.showModal(event.currentTarget))
document.querySelector("#inside-create").addEventListener("click", () => run(() => inside.success({ title: "Inside the native modal", content: "No portal or z-index promise is needed." }), document.querySelector("#inside-error")))
for (const root of document.querySelectorAll(".mui-notification-host")) {
  root.addEventListener("mui:notification-create", event => {
    event.detail.handle.element.querySelector("form")?.addEventListener("submit", e => { e.preventDefault(); events.textContent = "Native form validated; local action only." })
  })
  root.addEventListener("mui:notification-remove", event => { events.textContent = `${root.id}: ${event.detail.reason}` })
  root.addEventListener("mui:notification-error", event => { event.preventDefault(); events.textContent = `${root.id}: ${event.detail.stale ? "stale " : ""}${event.detail.error.message}` })
}
window.notificationDemo = { fixed, inline, inside, modal, get last() { return last }, get calls() { return calls } }
