const card = document.querySelector("#anatomy-card")
let requests = 0
let stars = 0
let submissions = 0
card.addEventListener("mui:close", (event) => {
  if (event.target !== card) return
  event.preventDefault()
  document.querySelector("#close-status").textContent = `${++requests} close requests; the card remains visible.`
})
document.querySelector("#extra-action").addEventListener("click", () => {
  document.querySelector("#star-status").textContent = `${++stars} stars.`
})
document.querySelector("#card-form").addEventListener("submit", (event) => {
  event.preventDefault()
  document.querySelector("#form-status").textContent = `${++submissions} submissions.`
})
document.querySelector("#toggle-close").addEventListener("click", () => { card.closable = !card.closable })
document.querySelector("#reconnect-card").addEventListener("click", () => {
  const form = card.parentElement
  card.remove()
  form.append(card)
})
document.querySelector("#content-divider").addEventListener("change", (event) => {
  card.setAttribute("segmented-content", event.target.value)
})
document.querySelector("#card-size").addEventListener("change", (event) => { card.size = event.target.value })
