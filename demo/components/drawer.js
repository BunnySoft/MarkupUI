const surface = document.querySelector("#drawer")
const events = document.querySelector("#events")
const drawer = MarkupUIDrawer.createDrawer(surface, { backdropDismiss: true })
const nested = MarkupUIModal.createModal(document.querySelector("#nested"))
const owner = MarkupUIDrawer.createDrawerOwner(document.querySelector("#owner-root"))
const link = document.querySelector("#open")
document.querySelector("#controls").hidden = false
link.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || !drawer.supportsModal) return
  try { if (drawer.showModal(link) === "modal") event.preventDefault() }
  catch (error) { events.textContent = error.message }
})
document.querySelector("#placement").addEventListener("change", event => { surface.dataset.drawerPlacement = event.target.value })
document.querySelector("#size").addEventListener("change", event => { surface.dataset.demoSize = event.target.value })
document.querySelector("#modeless").addEventListener("click", event => {
  try { events.textContent = `Explicit ${drawer.show(event.currentTarget)} opening.` }
  catch (error) { events.textContent = error.message }
})
document.querySelector("#nested-open").addEventListener("click", event => nested.showModal(event.currentTarget))
document.querySelector("#spawn").addEventListener("click", () => {
  try { owner.create(document.querySelector("#drawer-template")) }
  catch (error) { events.textContent = error.message }
})
document.querySelector("#destroy").addEventListener("click", () => owner.destroyAll())
surface.addEventListener("cancel", event => { if (document.querySelector("#veto").checked) event.preventDefault() })
surface.addEventListener("close", () => { events.textContent = `Native close returnValue: ${surface.returnValue || "(empty)"}` })
let operation = 0
let timer
const status = document.querySelector("#check-status")
surface.addEventListener("mui:native-dialog-session", () => {
  operation++
  clearTimeout(timer)
  if (surface.isConnected && status.isConnected) status.textContent = "No local check pending."
})
document.querySelector("#check-close").addEventListener("click", () => {
  const token = ++operation
  const generation = drawer.generation
  clearTimeout(timer)
  status.textContent = "Checking locally…"
  timer = setTimeout(() => {
    if (token === operation && drawer.connected && drawer.mode !== "closed" && drawer.generation === generation) drawer.close("checked")
  }, 400)
})
window.drawerDemo = { drawer, nested, owner }
