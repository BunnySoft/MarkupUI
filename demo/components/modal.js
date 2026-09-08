const api = window.MarkupUIModal
const surface = document.querySelector("#surface")
const events = document.querySelector("#events")
const modal = api.createModal(surface, { backdropDismiss: true })
const nested = api.createModal(document.querySelector("#nested"), { closeOnEsc: false })
const composition = api.createModal(document.querySelector("#composition"))
const owner = api.createModalOwner(document.querySelector("#owner-root"))
const openLink = document.querySelector("#open")
openLink.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return
  if (!modal.supportsModal) return
  try { if (modal.showModal(openLink) === "modal") event.preventDefault() }
  catch (error) { events.textContent = error.message }
})
document.querySelector("#controls").hidden = false
document.querySelector("#modeless").addEventListener("click", event => {
  try { events.textContent = `Explicit ${modal.show(event.currentTarget)} opening.` }
  catch (error) { events.textContent = error.message }
})
document.querySelector("#nested-open").addEventListener("click", event => nested.showModal(event.currentTarget))
document.querySelector("#dialog-composition").addEventListener("click", event => composition.showModal(event.currentTarget))
document.querySelector("#template-open").addEventListener("click", () => {
  try { owner.create(document.querySelector("#modal-template"), { title: "Owned template", content: "Literal native content, not a render callback." }) }
  catch (error) { events.textContent = error.message }
})
document.querySelector("#destroy").addEventListener("click", () => owner.destroyAll())
surface.addEventListener("cancel", event => {
  if (document.querySelector("#veto").checked) event.preventDefault()
  events.textContent = event.defaultPrevented ? "Native cancel vetoed." : "Native cancel observed."
})
surface.addEventListener("close", () => { events.textContent = `Native close returnValue: ${surface.returnValue || "(empty)"}` })
document.querySelector("#background-form").addEventListener("submit", event => { event.preventDefault(); events.textContent = "Unrelated local form submitted." })
window.modalDemo = { modal, nested, composition, owner }
