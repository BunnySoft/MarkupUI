import { loadComponentApi } from "../component-api.js"

function initialize() {
  const apiContainer = document.getElementById("loading-bar-api")
  if (apiContainer) {
    void loadComponentApi(apiContainer, new URL("../api/loading-bar.json", import.meta.url))
  }

  // Element controls
  const elemBar = document.querySelector("#element-bar")
  document.querySelector("#elem-start")?.addEventListener("click", () => elemBar?.start())
  document.querySelector("#elem-finish")?.addEventListener("click", () => elemBar?.finish())
  document.querySelector("#elem-error")?.addEventListener("click", () => elemBar?.error())
  document.querySelector("#elem-reset")?.addEventListener("click", () => {
    if (elemBar) elemBar.status = "none"
  })

  // Programmatic service
  const service = window.MarkupUILoadingBar?.loadingBar
  document.querySelector("#service-start")?.addEventListener("click", () => service?.start())
  document.querySelector("#service-finish")?.addEventListener("click", () => service?.finish())
  document.querySelector("#service-error")?.addEventListener("click", () => service?.error())

  // Inline and Fixed bar controllers
  const inlineRoot = document.querySelector("#inline-bar")
  const fixedRoot = document.querySelector("#fixed-bar")
  if (inlineRoot && fixedRoot && window.MarkupUILoadingBar?.createLoadingBar) {
    const inline = window.MarkupUILoadingBar.createLoadingBar(inlineRoot, { finishDelay: 800 })
    const fixed = window.MarkupUILoadingBar.createLoadingBar(fixedRoot, { finishDelay: 1000, errorDelay: 1800 })
    fixedRoot.hidden = false
    const controls = document.querySelector("#controls")
    if (controls) controls.hidden = false
    const fixedControls = document.querySelector("#fixed-controls")
    if (fixedControls) fixedControls.hidden = false
    const events = document.querySelector("#events")
    for (const root of [inlineRoot, fixedRoot]) {
      root.addEventListener("m:loading-bar-change", event => {
        if (events) events.textContent = `${root.id}: ${event.detail.previous} → ${event.detail.state}`
      })
      root.addEventListener("m:loading-bar-fault", event => {
        if (events) events.textContent = event.detail.error.message
      })
    }
    document.querySelector("#start")?.addEventListener("click", () => inline.start())
    document.querySelector("#measure")?.addEventListener("click", () => {
      if (inline.state !== "loading") inline.start()
      inline.setProgress(40)
    })
    document.querySelector("#finish")?.addEventListener("click", () => inline.finish())
    document.querySelector("#error")?.addEventListener("click", () => inline.error())
    document.querySelector("#stop")?.addEventListener("click", () => inline.stop())
    document.querySelector("#restart")?.addEventListener("click", () => { inline.start(); inline.finish(); inline.start() })
    document.querySelector("#reset")?.addEventListener("click", () => {
      inline.disconnect()
      inline.connect()
      if (events) events.textContent = "Inline controller reconnected idle."
    })
    document.querySelector("#fixed-start")?.addEventListener("click", () => fixed.start())
    document.querySelector("#fixed-finish")?.addEventListener("click", () => fixed.finish())
    document.querySelector("#fixed-error")?.addEventListener("click", () => { fixed.stop(); fixed.error() })
    document.querySelector("#native-form")?.addEventListener("submit", event => {
      event.preventDefault()
      if (events) events.textContent = "Unrelated native form submitted."
    })
    if (events) events.textContent = "Both independent controllers connected idle."
    window.loadingBarDemo = { inline, fixed }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true })
} else {
  initialize()
}

