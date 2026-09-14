import { loadComponentApi } from "../component-api.js"

function initialize() {
  void loadComponentApi(document.getElementById("thing-api"), new URL("../api/thing.json", import.meta.url)).catch(() => {})

  const form = document.querySelector("#project-form")
  form?.addEventListener("submit", event => {
    event.preventDefault()
    const status = document.querySelector("#form-status")
    if (status) status.textContent = `Saved project: ${new FormData(form).get("project")}`
  })

  const follow = document.querySelector("#follow-project")
  follow?.addEventListener("click", () => {
    const pressed = follow.getAttribute("aria-pressed") !== "true"
    follow.setAttribute("aria-pressed", String(pressed))
    const status = document.querySelector("#follow-status")
    if (status) status.textContent = pressed ? "Following the project." : "Not following the project."
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

