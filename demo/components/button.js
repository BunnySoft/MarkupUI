const eventMessage = document.getElementById("event-message")
document.getElementById("event-button").addEventListener("click", () => {
  eventMessage.textContent = "Button Clicked"
})

const loadingButtons = [...document.querySelectorAll("[data-loading-button]")]
let loadingTimer

function startLoading() {
  clearTimeout(loadingTimer)
  for (const button of loadingButtons) button.loading = true
  loadingTimer = setTimeout(() => {
    for (const button of loadingButtons) button.loading = false
  }, 2000)
}

for (const button of loadingButtons) {
  button.addEventListener("click", startLoading)
}
