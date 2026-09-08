const feedback = document.querySelector("#action-feedback")
for (const id of ["single-action", "badge-action", "record-action"]) {
  document.getElementById(id).addEventListener("click", () => {
    feedback.textContent = `Application received ${id}.`
  })
}
const panel = document.querySelector("#quick-panel")
if ("showPopover" in HTMLElement.prototype) {
  panel.addEventListener("toggle", event => {
    document.querySelector("#toggle-feedback").textContent = `Native popover is ${event.newState}.`
  })
}
const form = document.querySelector("#native-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  document.querySelector("#form-feedback").textContent = `Saved project: ${new FormData(form).get("project")}`
})
