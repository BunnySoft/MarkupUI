const topic = document.querySelector("#topic")
let changes = 0
let submissions = 0
topic.addEventListener("mui:change", (event) => {
  document.querySelector("#change-status").textContent = `${++changes} changes; Design is ${event.detail ? "checked" : "unchecked"}.`
})
document.querySelector("#tag-form").addEventListener("submit", (event) => {
  event.preventDefault()
  document.querySelector("#form-status").textContent = `${++submissions} submissions.`
})
document.querySelector("#assign-checked").addEventListener("click", () => { topic.checked = true })
document.querySelector("#toggle-disabled").addEventListener("click", () => { topic.disabled = !topic.disabled })
document.querySelector("#reconnect-topic").addEventListener("click", () => {
  const parent = topic.parentElement
  topic.remove()
  parent.prepend(topic)
})
const closable = document.querySelector("#closable-tag")
let requests = 0
let clicks = 0
closable.addEventListener("mui:close", (event) => {
  event.preventDefault()
  document.querySelector("#close-status").textContent = `${++requests} close requests; Project remains visible.`
})
closable.addEventListener("click", () => {
  document.querySelector("#click-status").textContent = `${++clicks} tag click callbacks.`
})
document.querySelector("#propagate-close").addEventListener("change", (event) => {
  closable.triggerClickOnClose = event.target.checked
})
