import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUISpin
  if (!api) throw new Error("Spin runtime did not load.")
  void loadComponentApi(document.getElementById("spin-api"), new URL("../api/spin.json", import.meta.url))

  const spin = document.querySelector("#wrapped")
  const content = document.querySelector("#editor")
  let pending = false
  let originalInert = false
  let originalBusy = null
  let submissions = 0
  let briefTimer

  function start() {
    clearTimeout(briefTimer)
    if (!pending) {
      originalInert = content.hasAttribute("inert")
      originalBusy = content.getAttribute("aria-busy")
    }
    pending = true
    content.setAttribute("aria-busy", "true")
    content.inert = originalInert || Boolean(document.querySelector("#block-content")?.checked)
    spin.show = true
    const status = document.querySelector("#request-status")
    if (status) status.textContent = "Request active; the indicator appears after its delay."
  }

  function finish() {
    clearTimeout(briefTimer)
    spin.show = false
    if (pending) {
      content.inert = originalInert
      if (originalBusy === null) content.removeAttribute("aria-busy")
      else content.setAttribute("aria-busy", originalBusy)
    }
    pending = false
    const status = document.querySelector("#request-status")
    if (status) status.textContent = "No request active."
  }

  document.querySelector("#start-request")?.addEventListener("click", start)
  document.querySelector("#finish-request")?.addEventListener("click", finish)
  document.querySelector("#short-request")?.addEventListener("click", () => {
    start()
    briefTimer = setTimeout(finish, 80)
  })
  document.querySelector("#block-content")?.addEventListener("change", (event) => {
    if (pending) content.inert = originalInert || event.target.checked
  })
  document.querySelector("#reconnect")?.addEventListener("click", () => {
    const parent = spin.parentElement
    spin.remove()
    parent.append(spin)
  })
  document.querySelector("#editor-form")?.addEventListener("submit", (event) => {
    event.preventDefault()
    const submitStatus = document.querySelector("#submit-status")
    if (submitStatus) submitStatus.textContent = `${++submissions} native submissions.`
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
