const form = document.querySelector("#project-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  document.querySelector("#form-status").textContent = `Saved project: ${new FormData(form).get("project")}`
})
const follow = document.querySelector("#follow-project")
follow.addEventListener("click", () => {
  const pressed = follow.getAttribute("aria-pressed") !== "true"
  follow.setAttribute("aria-pressed", String(pressed))
  document.querySelector("#follow-status").textContent = pressed ? "Following the project." : "Not following the project."
})
