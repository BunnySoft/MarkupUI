const spin = document.querySelector("#wrapped")
const content = document.querySelector("#editor")
let pending = false
let originalInert = false
let originalBusy = null
let submissions = 0
let briefTimer
function start() {
  clearTimeout(briefTimer)
  if (!pending) {
    originalInert = content.hasAttribute("inert")
    originalBusy = content.getAttribute("aria-busy")
  }
  pending = true
  content.setAttribute("aria-busy", "true")
  content.inert = originalInert || document.querySelector("#block-content").checked
  spin.show = true
  document.querySelector("#request-status").textContent = "Request active; the indicator appears after its delay."
}
function finish() {
  clearTimeout(briefTimer)
  spin.show = false
  if (pending) {
    content.inert = originalInert
    if (originalBusy === null) content.removeAttribute("aria-busy")
    else content.setAttribute("aria-busy", originalBusy)
  }
  pending = false
  document.querySelector("#request-status").textContent = "No request active."
}
document.querySelector("#start-request").addEventListener("click", start)
document.querySelector("#finish-request").addEventListener("click", finish)
document.querySelector("#short-request").addEventListener("click", () => {
  start()
  briefTimer = setTimeout(finish, 80)
})
document.querySelector("#block-content").addEventListener("change", (event) => {
  if (pending) content.inert = originalInert || event.target.checked
})
document.querySelector("#reconnect").addEventListener("click", () => {
  const parent = spin.parentElement
  spin.remove()
  parent.append(spin)
})
document.querySelector("#editor-form").addEventListener("submit", (event) => {
  event.preventDefault()
  document.querySelector("#submit-status").textContent = `${++submissions} native submissions.`
})
