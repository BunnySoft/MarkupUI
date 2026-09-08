const form = document.querySelector("#retry-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  document.querySelector("#attempt-feedback").textContent = `Application received retry intent for ${new FormData(form).get("email")}. This demo performs no network request.`
})
