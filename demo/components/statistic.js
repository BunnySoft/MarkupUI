const authored = document.querySelector("#authored")
const formatted = document.querySelector("#formatted")
let actions = 0
let submissions = 0
function format(locale) {
  formatted.value = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(12345.6)
}
format("en-US")
document.querySelector("#german").addEventListener("click", () => format("de-DE"))
document.querySelector("#english").addEventListener("click", () => format("en-US"))
document.querySelector("#override").addEventListener("click", () => { authored.value = 0 })
document.querySelector("#blank").addEventListener("click", () => { authored.value = "" })
document.querySelector("#restore").addEventListener("click", () => { authored.value = null })
document.querySelector("#tabular").addEventListener("click", () => { authored.tabularNums = !authored.tabularNums })
document.querySelector("#reconnect").addEventListener("click", () => {
  const parent = authored.parentElement
  authored.remove()
  parent.append(authored)
})
document.querySelector("#details-action").addEventListener("click", () => {
  document.querySelector("#action-status").textContent = `${++actions} detail actions.`
})
document.querySelector("#metric-form").addEventListener("submit", (event) => {
  event.preventDefault()
  document.querySelector("#submit-status").textContent = `${++submissions} native submissions.`
})
