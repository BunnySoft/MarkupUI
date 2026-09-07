const form = document.getElementById("record-form")
const back = document.getElementById("application-back")
const result = document.getElementById("application-result")
let backCount = 0

back.addEventListener("click", () => {
  backCount += 1
  result.value = `Application back action: ${backCount}`
})
form.addEventListener("submit", (event) => {
  event.preventDefault()
  result.value = `Application saved: ${new FormData(form).get("name")}`
})
form.addEventListener("reset", () => {
  result.value = "Native reset requested."
})
