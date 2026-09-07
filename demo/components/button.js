const editor = document.querySelector("#editor")
const status = document.querySelector("#form-status")
let submissions = 0
editor.addEventListener("submit", (event) => {
  event.preventDefault()
  submissions++
  const values = new FormData(editor, event.submitter)
  status.textContent = `${submissions} submissions; action=${values.get("action")}; title=${values.get("title")}.`
})
editor.addEventListener("reset", () => {
  status.textContent = "Native form reset to initial values."
})

const action = document.querySelector("#count-action")
let clicks = 0
action.control.addEventListener("click", () => {
  document.querySelector("#click-status").textContent = `${++clicks} activations.`
})
document.querySelector("#toggle-loading").addEventListener("click", () => {
  action.loading = !action.loading
})
document.querySelector("#toggle-disabled").addEventListener("click", () => {
  action.disabled = !action.disabled
})
