const { createBackTop } = window.MarkupUIBackTop
const reader = document.querySelector("#reader")
const pageAction = document.querySelector("#page-action")
const readerAction = document.querySelector("#reader-action")
const pageButton = document.querySelector("#page-button")
const state = document.querySelector("#state")
const page = createBackTop(pageAction)
const local = createBackTop(readerAction, { root: reader, visibilityHeight: 100 })
const explicitPage = createBackTop(pageButton)
readerAction.hidden = false
pageButton.hidden = false
for (const action of [pageAction, readerAction, pageButton]) {
  action.addEventListener("mui:back-top-update-show", event => {
    state.textContent = `${action.id}: threshold ${event.detail.show ? "reached" : "not reached"}`
  })
  action.addEventListener("mui:back-top-error", event => { state.textContent = event.detail.error.message })
}
document.querySelector("#reader-end").addEventListener("click", () => {
  reader.scrollTo({ top: reader.scrollHeight, left: 120, behavior: "instant" })
})
document.querySelector("#cancel-next").addEventListener("click", () => {
  readerAction.addEventListener("click", event => event.preventDefault(), { once: true })
  state.textContent = "Next reader-top click will be cancelled by an authored listener."
})
document.querySelector("#reader-form").addEventListener("submit", event => {
  event.preventDefault()
  state.textContent = "Unexpected form submission"
})
state.textContent = "Native links plus independent page/reader controllers connected."
window.backTopDemo = { page, local, explicitPage }
