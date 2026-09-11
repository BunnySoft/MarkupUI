const closableCard = document.getElementById("closable-card")
const closeMessage = document.getElementById("close-message")
closableCard.addEventListener("mui:close", event => {
  if (event.target !== closableCard) return
  closeMessage.textContent = "Card Close"
})

const loadingCard = document.getElementById("loading-card")
const loadingControl = document.getElementById("loading-control")
MarkupUISwitch.createSwitch(document.getElementById("loading-switch"))

function renderLoading() {
  const loading = loadingControl.checked
  loadingCard.setAttribute("aria-busy", String(loading))
  for (const node of loadingCard.querySelectorAll("[data-loading-content]")) {
    node.hidden = !loading
  }
  for (const node of loadingCard.querySelectorAll("[data-loaded-content]")) {
    node.hidden = loading
  }
}

loadingControl.addEventListener("change", renderLoading)
renderLoading()

MarkupUITabs.createTabs(document.getElementById("custom-tabs"))
