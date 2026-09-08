function scrollToEdge(id, end) {
  const element = document.getElementById(id)
  element.scrollTo({
    top: end ? element.scrollHeight : 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  })
}
document.querySelector("#nested-end").addEventListener("click", () => scrollToEdge("nested-scroll", true))
document.querySelector("#bottom-start").addEventListener("click", () => scrollToEdge("bottom-scroll", false))
const form = document.querySelector("#native-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  document.querySelector("#form-status").textContent = `Saved project: ${new FormData(form).get("project")}`
})
