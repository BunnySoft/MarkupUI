const form = document.querySelector("#native-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  document.querySelector("#form-status").textContent = `Saved recovery note: ${new FormData(form).get("note")}`
})
for (const button of document.querySelectorAll("[data-demo-milestone]")) {
  button.addEventListener("click", () => {
    document.querySelector("#action-status").textContent = `Milestone selected: ${button.dataset.demoMilestone}`
  })
}
