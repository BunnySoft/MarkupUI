import { loadComponentApi } from "../component-api.js"

async function initialize() {
  if (!globalThis.MarkupUIFlex) throw new Error("Flex runtime did not load.")
  const url = new URL("../api/flex.json", import.meta.url)
  await loadComponentApi(document.getElementById("flex-api"), url)
  const flex = document.getElementById("live-flex")
  const status = document.getElementById("flex-status")
  const update = () => { status.textContent = `Column gap: ${flex.columnGap ?? "preset"}` }
  document.getElementById("change-gap").addEventListener("click", () => {
    flex.columnGap = flex.columnGap === 24 ? 8 : 24
    update()
  })
  document.getElementById("reset-gap").addEventListener("click", () => { flex.columnGap = null; update() })
  document.getElementById("reconnect-flex").addEventListener("click", () => {
    const parent = flex.parentElement
    const next = flex.nextSibling
    flex.remove()
    parent.insertBefore(flex, next)
    update()
  })
  for (const [property, choices] of [
    ["align", ["normal", "start", "end", "flex-start", "flex-end", "self-start", "self-end", "center", "baseline", "first baseline", "last baseline", "stretch"]],
    ["justify", ["normal", "start", "end", "flex-start", "flex-end", "center", "left", "right", "stretch", "space-between", "space-around", "space-evenly"]],
  ]) {
    const select = document.getElementById(`${property}-choice`)
    const target = document.getElementById("aligned")
    for (const choice of choices) select.add(new Option(choice, choice))
    select.value = target[property]
    select.addEventListener("change", () => { target[property] = select.value })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else void initialize()
