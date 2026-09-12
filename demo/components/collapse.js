import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUICollapse) throw new Error("Collapse runtime did not load.")
  void loadComponentApi(document.getElementById("collapse-api"), new URL("../api/collapse.json", import.meta.url))

  for (const [id, keys] of [
    ["accordion-collapse", ["one"]], ["outer-collapse", ["one"]], ["inner-collapse", ["one"]],
    ["retained-collapse", ["note"]], ["default-collapse", ["red", "amber"]],
  ]) {
    const root = document.getElementById(id)
    root.defaultExpandedKeys = keys
    root.reset()
  }

  const events = document.getElementById("event-collapse")
  events.addEventListener("m:header-activated", event => {
    if (event.target === events) document.querySelector("[data-header-status]").textContent = `Key: ${event.detail.key}, expanded: ${event.detail.expanded}`
  })
  for (const extra of document.querySelectorAll("[data-extra-name]")) {
    extra.addEventListener("click", () => { document.querySelector("[data-extra-status]").textContent = `Extra ${extra.dataset.extraName} acted independently.` })
  }
  const trigger = document.getElementById("trigger-collapse")
  trigger.addEventListener("m:header-activated", event => {
    if (event.target === trigger) document.querySelector("[data-trigger-status]").textContent = `Summary: ${event.detail.key}, expanded: ${event.detail.expanded}`
  })
  document.querySelector("[data-trigger-extra]").addEventListener("click", () => {
    document.querySelector("[data-trigger-status]").textContent = "Extra acted without toggling."
  })

  const defaults = document.getElementById("default-collapse")
  const update = () => { document.querySelector("[data-default-status]").textContent = `Expanded keys: ${JSON.stringify(defaults.expandedKeys)}` }
  defaults.addEventListener("m:expanded-changed", update)
  document.querySelector("[data-default-expand]").addEventListener("click", () => { defaults.expandedKeys = ["green"]; update() })
  document.querySelector("[data-default-reset]").addEventListener("click", () => { defaults.reset(); update() })
  document.querySelector("[data-disabled-toggle]").addEventListener("click", () => {
    document.getElementById("disabled-collapse").toggle("disabled")
  })
  update()

  const retained = document.getElementById("retained-collapse")
  const close = document.querySelector("[data-retained-close]")
  close.addEventListener("click", () => retained.collapse("note"))
  document.querySelector("[data-retained-detach]").addEventListener("click", () => {
    if (retained.isConnected) retained.remove()
    else document.getElementById("retained-mount").append(retained)
    close.disabled = !retained.isConnected
    document.querySelector("[data-retained-status]").textContent = `${retained.state}; edited content and native open state are retained.`
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
