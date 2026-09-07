const notice = document.querySelector("#notice")
let requests = 0
let submissions = 0
let actions = 0
let updates = 0
notice.addEventListener("mui:close", (event) => {
  if (event.target !== notice) return
  event.preventDefault()
  document.querySelector("#close-status").textContent = `${++requests} close requests; the notice remains visible.`
})
document.querySelector("#notice-form").addEventListener("submit", (event) => {
  event.preventDefault()
  document.querySelector("#submit-status").textContent = `${++submissions} submissions.`
})
document.querySelector("#details").addEventListener("click", () => {
  document.querySelector("#action-status").textContent = `${++actions} detail actions.`
})
document.querySelector("#toggle-icon").addEventListener("click", () => { notice.showIcon = !notice.showIcon })
document.querySelector("#toggle-close").addEventListener("click", () => { notice.closable = !notice.closable })
document.querySelector("#toggle-border").addEventListener("click", () => { notice.bordered = !notice.bordered })
document.querySelector("#reconnect").addEventListener("click", () => {
  const parent = notice.parentElement
  notice.remove()
  parent.append(notice)
})
document.querySelector("#update-status").addEventListener("click", () => {
  document.querySelector("#polite-copy").textContent = `Saved changes checked ${++updates} times.`
})
document.querySelector("#show-urgent").addEventListener("click", () => { document.querySelector("#urgent-notice").hidden = false })
