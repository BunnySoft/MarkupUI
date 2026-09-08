const api = window.MarkupUIDialog
const surface = document.querySelector("#decision")
const events = document.querySelector("#events")
const behavior = document.querySelector("#behavior")
let calls = 0
function decide() {
  calls++
  if (behavior.value === "false") return false
  if (behavior.value === "reject") return Promise.reject(new Error("Simulated local rejection"))
  if (behavior.value === "slow") return new Promise(resolve => setTimeout(resolve, 800))
}
const decision = api.createDialog(surface, { backdropDismiss: true, onPositiveClick: decide, onNegativeClick: decide, onClose: decide })
const inner = api.createNativeDialog(document.querySelector("#inner"))
const owner = api.createDialogOwner(document.querySelector("#owned-dialogs"))
document.querySelector("#controls").hidden = false
document.querySelector("#open").addEventListener("click", event => { decision.showModal(event.currentTarget); events.textContent = `Opened ${decision.mode}.` })
document.querySelector("#modeless").addEventListener("click", event => { decision.show(event.currentTarget); events.textContent = `Opened ${decision.mode}.` })
document.querySelector("#open-inner").addEventListener("click", event => inner.showModal(event.currentTarget))
document.querySelector("#spawn").addEventListener("click", () => owner.create(document.querySelector("#dialog-template"), { title: "Owned template", content: "Literal caller text, not evaluated HTML." }))
document.querySelector("#destroy").addEventListener("click", () => owner.destroyAll())
surface.addEventListener("close", () => { events.textContent = `Native close: ${surface.returnValue || "(empty)"}. Callback calls: ${calls}.` })
surface.addEventListener("cancel", () => { events.textContent = "Native cancel request observed." })
surface.addEventListener("mui:dialog-error", event => { events.textContent = `${event.detail.stale ? "Stale" : "Current"} local failure: ${event.detail.error.message}` })
window.dialogDemo = { decision, inner, owner, get calls() { return calls } }
