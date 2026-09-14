import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUIDropdown) throw new Error("Dropdown runtime did not load.")
  void loadComponentApi(document.getElementById("dropdown-api"), new URL("../api/dropdown.json", import.meta.url))
  for (const root of document.querySelectorAll("m-dropdown")) {
    const status = root.closest("[data-demo-example]")?.querySelector("[data-dropdown-status]")
    root.addEventListener("m:selection-requested", event => {
      if (event.target === root && status) status.textContent = `Selected ${event.detail.path.join(" > ")}; value ${JSON.stringify(root.value)}.`
    })
    root.addEventListener("m:error", event => {
      if (event.target === root && status) status.textContent = `Dropdown error: ${event.detail.error.message}`
    })
  }
  const manual = document.getElementById("manual-toggle-dropdown")
  document.querySelector("[data-manual-toggle]").addEventListener("click", () => manual.toggle())
  document.querySelector("[data-root-disabled]").addEventListener("click", event => {
    manual.disabled = !manual.disabled
    event.currentTarget.setAttribute("aria-pressed", String(manual.disabled))
  })
  const area = document.getElementById("manual-area")
  const positioned = document.getElementById("position-dropdown")
  const trigger = positioned.querySelector("m-dropdown-trigger > button")
  area.addEventListener("contextmenu", event => {
    if (event.target.closest("m-dropdown-menu")) return
    event.preventDefault()
    const bounds = area.getBoundingClientRect()
    trigger.style.left = `${Math.max(0, Math.min(bounds.width - trigger.offsetWidth, event.clientX - bounds.left))}px`
    trigger.style.top = `${Math.max(0, Math.min(bounds.height - trigger.offsetHeight, event.clientY - bounds.top))}px`
    if (positioned.show) positioned.syncPosition()
    else positioned.open()
  })
  const root = document.getElementById("lifecycle-dropdown")
  const status = root.closest("[data-demo-example]").querySelector("[data-dropdown-status]")
  let count = 0
  document.getElementById("listener-action").addEventListener("click", () => { status.textContent = `Native listener ran ${++count} time(s).` })
  document.getElementById("cancel-action").addEventListener("click", event => {
    event.preventDefault()
    status.textContent = "Original click canceled; value and open state are unchanged."
  })
  document.querySelector("[data-select-last]").addEventListener("click", () => {
    root.select("last")
    status.textContent = `Silent value: ${root.value}. No native action was activated.`
  })
  document.querySelector("[data-add-item]").addEventListener("click", () => {
    const item = document.createElement("m-dropdown-item")
    item.key = `added-${root.items.length}`
    const action = document.createElement("button")
    action.type = "button"
    action.textContent = `Added action ${root.items.length}`
    item.append(action)
    root.querySelector(":scope > m-dropdown-menu").append(item)
    root.refresh()
    status.textContent = `Added ${item.key}; existing controls retained.`
  })
  document.querySelector("[data-detach]").addEventListener("click", () => {
    if (root.isConnected) root.remove()
    else document.getElementById("lifecycle-mount").append(root)
    for (const button of document.querySelectorAll("[data-select-last],[data-add-item]")) button.disabled = !root.isConnected
    status.textContent = `${root.state}; value ${JSON.stringify(root.value)} and native listener retained.`
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
