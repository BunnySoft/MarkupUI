const status = document.querySelector("#action-status")
document.querySelector("#archive-alpha").addEventListener("click", () => {
  status.textContent = "Archive Alpha requested; the application owns any list changes."
})
document.querySelector("#open-report").addEventListener("click", () => {
  status.textContent = "Report preview requested."
})
const form = document.querySelector("#native-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  const data = new FormData(form)
  document.querySelector("#form-status").textContent = `Saved report: ${data.get("name")}`
})
