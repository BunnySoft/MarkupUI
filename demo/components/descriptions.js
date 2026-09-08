document.querySelector("#review-project").addEventListener("click", () => {
  document.querySelector("#action-status").textContent = "Project review requested."
})
const form = document.querySelector("#native-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  document.querySelector("#form-status").textContent = `Saved project: ${new FormData(form).get("name")}`
})
