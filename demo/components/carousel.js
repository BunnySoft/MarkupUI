import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUICarousel) throw new Error("Carousel runtime did not load.")
  void loadComponentApi(document.getElementById("carousel-api"), new URL("../api/carousel.json", import.meta.url))

  for (const root of document.querySelectorAll("m-carousel[data-hover-dots]")) {
    for (const indicator of root.querySelectorAll('[data-part="to"]')) {
      const show = () => root.to(Number(indicator.dataset.index))
      indicator.addEventListener("pointerenter", show)
      indicator.addEventListener("focus", show)
    }
  }

  const dots = document.querySelector(".dots-demo")
  const options = document.querySelector("[data-dots-options]")
  options.addEventListener("click", event => {
    const button = event.target.closest("m-button, button")
    if (!button || !options.contains(button)) return
    const attribute = button.hasAttribute("data-dot-type") ? "data-dot-type" : "data-dot-direction"
    if (attribute === "data-dot-type") dots.dataset.dotType = button.dataset.dotType
    else dots.direction = button.dataset.dotDirection
    for (const option of options.querySelectorAll(`[${attribute}]`)) option.setAttribute("aria-pressed", String(option === button))
  })

  const root = document.getElementById("api-carousel")
  const mount = document.getElementById("lifecycle-mount")
  const status = document.querySelector("[data-api-status]")
  function update() {
    status.textContent = root.isConnected
      ? `Settled: ${root.currentIndex}; requested target: ${root.state.targetIndex ?? "none"}; items: ${root.state.total}; disabled: ${root.disabled}.`
      : `Detached; retained settled index: ${root.currentIndex}. Timers and listeners are stopped.`
    for (const button of document.querySelectorAll("[data-api-request],[data-api-reset],[data-api-reorder],[data-api-disable]")) button.disabled = !root.isConnected
  }
  root.addEventListener("m:current-changed", update)
  document.querySelector("[data-api-request]").addEventListener("click", () => { root.currentIndex = 2; update() })
  document.querySelector("[data-api-reset]").addEventListener("click", () => { root.reset(); update() })
  document.querySelector("[data-api-reorder]").addEventListener("click", () => {
    const item = root.items[root.currentIndex]
    if (item) root.querySelector("m-carousel-viewport").prepend(item)
    root.refresh()
    update()
  })
  document.querySelector("[data-api-disable]").addEventListener("click", event => {
    root.disabled = !root.disabled
    event.currentTarget.setAttribute("aria-pressed", String(root.disabled))
    update()
  })
  document.querySelector("[data-api-detach]").addEventListener("click", event => {
    if (root.isConnected) root.remove()
    else mount.append(root)
    event.currentTarget.setAttribute("aria-pressed", String(!root.isConnected))
    update()
  })
  update()
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
