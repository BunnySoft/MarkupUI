const api = window.MarkupUIMessage
const trigger = document.querySelector("#create")
const fixed = api.createMessageOwner(document.querySelector("#fixed-host"), { max: 3, closable: true, keepAliveOnHover: true, focusFallback: trigger })
const inline = api.createMessageOwner(document.querySelector("#inline-host"), { max: 2, closable: true, template: document.querySelector("#message-template"), focusFallback: document.querySelector("#interactive") })
const inside = api.createMessageOwner(document.querySelector("#inside-host"), { max: 2, closable: true, focusFallback: document.querySelector("#inside-create") })
const modal = window.MarkupUIModal.createModal(document.querySelector("#local-modal"))
const events = document.querySelector("#events")
const operationError = document.querySelector("#operation-error")
let last
let sequence = 0
function run(action, errorRegion = operationError) {
  errorRegion.textContent = ""
  try { action() } catch (error) { errorRegion.textContent = error.message }
}
document.querySelector("#controls").hidden = false
document.querySelector("#kinds").addEventListener("click", event => {
  const kind = event.target.closest("[data-kind]")?.dataset.kind
  if (!kind) return
  run(() => { last = kind === "loading" ? fixed.loading(`Local work ${++sequence} remains pending.`) : fixed[kind](`Local message ${++sequence}: plain text, not evaluated HTML.`, { duration: Number(document.querySelector("#duration").value) }) })
})
document.querySelector("#placement").addEventListener("change", event => { document.querySelector("#fixed-host").dataset.feedbackPlacement = event.target.value })
document.querySelector("#update").addEventListener("click", () => run(() => last?.update({ type: "success", content: "Caller explicitly completed the local work.", duration: Number(document.querySelector("#duration").value) })))
document.querySelector("#destroy-last").addEventListener("click", () => last?.destroy())
document.querySelector("#clear").addEventListener("click", () => fixed.destroyAll())
document.querySelector("#callback-error").addEventListener("click", () => run(() => { last = fixed.warning("Closing this item fails locally.", { duration: 0, onClose: () => { throw new Error("Simulated close failure") } }) }))
document.querySelector("#callback-async-error").addEventListener("click", () => run(() => { last = fixed.info("An async onClose is not a veto.", { duration: 0, onClose: async () => { throw new Error("Simulated late notification failure") } }) }))
document.querySelector("#interactive").addEventListener("click", () => run(() => {
  const message = inline.info("Focus anywhere in this message protects it from automatic expiry.", { duration: 2000 })
  message.element.querySelector("form").addEventListener("submit", event => { event.preventDefault(); events.textContent = "Local native form validated and submitted without navigation." })
}))
document.querySelector("#open-modal").addEventListener("click", event => modal.showModal(event.currentTarget))
document.querySelector("#inside-create").addEventListener("click", () => run(() => inside.success("This owner lives inside the native modal."), document.querySelector("#inside-error")))
for (const root of document.querySelectorAll(".mui-message-host")) {
  root.addEventListener("mui:message-remove", event => { events.textContent = `${root.id}: ${event.detail.reason}` })
  root.addEventListener("mui:message-error", event => { event.preventDefault(); events.textContent = `${root.id}: ${event.detail.stale ? "stale " : ""}${event.detail.error.message}` })
}
window.messageDemo = { fixed, inline, inside, modal, get last() { return last } }
