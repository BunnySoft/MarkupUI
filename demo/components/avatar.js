const avatar = document.getElementById("dynamic-avatar")
const status = document.getElementById("image-status")
const portrait = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%2318a058'/%3E%3C/svg%3E"

avatar.addEventListener("mui:load", () => { status.textContent = "Image loaded." })
avatar.addEventListener("mui:error", () => { status.textContent = "Image unavailable; the fallback template is shown." })
document.getElementById("load-image").addEventListener("click", () => { avatar.src = portrait })
document.getElementById("fail-image").addEventListener("click", () => { avatar.src = "data:image/png;base64,invalid" })
document.getElementById("clear-image").addEventListener("click", () => {
  avatar.removeAttribute("src")
  status.textContent = "Text content restored."
})
