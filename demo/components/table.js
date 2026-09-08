const form = document.querySelector("#note-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  document.querySelector("#form-status").textContent = `Saved note: ${new FormData(form).get("note")}`
})
