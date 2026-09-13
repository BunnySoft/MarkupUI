import { loadComponentApi } from "../component-api.js"

function initialize() {
  const sliderApiEl = document.getElementById("slider-api")
  if (sliderApiEl) {
    void loadComponentApi(sliderApiEl, new URL("../api/slider.json", import.meta.url))
  }

  // Canonical ViewElement demo interactions
  const demoSlider = document.getElementById("demo-slider")
  const sliderStatus = document.getElementById("slider-status")
  if (demoSlider && sliderStatus) {
    demoSlider.addEventListener("m:change", event => {
      sliderStatus.textContent = `Value: ${event.detail.value}`
    })
    document.getElementById("set-min")?.addEventListener("click", () => {
      demoSlider.value = demoSlider.min
      sliderStatus.textContent = `Value: ${demoSlider.value}`
    })
    document.getElementById("set-max")?.addEventListener("click", () => {
      demoSlider.value = demoSlider.max
      sliderStatus.textContent = `Value: ${demoSlider.value}`
    })
    document.getElementById("step-up")?.addEventListener("click", () => {
      demoSlider.stepUp?.()
      sliderStatus.textContent = `Value: ${demoSlider.value}`
    })
    document.getElementById("step-down")?.addEventListener("click", () => {
      demoSlider.stepDown?.()
      sliderStatus.textContent = `Value: ${demoSlider.value}`
    })
  }

  // Existing helper / form interactions
  const volumeEl = document.getElementById("volume-root")
  const pairEl = document.getElementById("window-pair")
  if (volumeEl && pairEl && globalThis.MarkupUISlider?.createSlider) {
    const volume = MarkupUISlider.createSlider(volumeEl, { formatValue: value => `${value} percent` })
    const pair = MarkupUISlider.createSliderPair(pairEl, { formatValue: value => `${value} minutes` })
    const balance = document.getElementById("balance-root") ? MarkupUISlider.createSlider(document.getElementById("balance-root")) : null
    const vertical = document.getElementById("vertical-root") ? MarkupUISlider.createSlider(document.getElementById("vertical-root"), { formatValue: value => `${value} units` }) : null
    const external = document.getElementById("external-root") ? MarkupUISlider.createSlider(document.getElementById("external-root")) : null
    window.sliderDemo = { volume, pair, balance, vertical, external }
    const helpers = [volume, pair, balance, vertical, external].filter(Boolean)
    const form = document.getElementById("ranges")
    let commits = 0
    function render() {
      const stateEl = document.getElementById("state")
      if (!stateEl) return
      try { stateEl.textContent = JSON.stringify({ volume: volume.value, pair: pair.value, ordered: pair.ordered }) }
      catch (error) { stateEl.textContent = error.message }
    }
    render()
    for (const control of [volume.control, ...pair.controls]) control.addEventListener("input", render)
    pairEl.addEventListener("m:slider-pair-change", () => {
      const eventsEl = document.getElementById("events")
      if (eventsEl) eventsEl.textContent = `Pair commits: ${++commits}`
      render()
    })
    if (form) {
      form.addEventListener("reset", () => setTimeout(render, 0))
      form.addEventListener("submit", event => {
        event.preventDefault()
        const sub = document.getElementById("submission")
        if (sub) sub.textContent = JSON.stringify([...new FormData(form)], null, 2)
      })
    }
    document.getElementById("narrow")?.addEventListener("click", () => { pair.setValue([65, 75]); render() })
    document.getElementById("cross")?.addEventListener("click", () => { pair.setValue([90, 10]); render() })
    document.getElementById("defaults")?.addEventListener("click", () => { pair.controls[0].defaultValue = "15"; pair.controls[1].defaultValue = "85"; pair.refresh(); render() })
    document.getElementById("disabled")?.addEventListener("click", () => { pairEl.disabled = !pairEl.disabled })
    document.getElementById("clamp")?.addEventListener("click", () => { volume.setValue(999); render() })
    document.getElementById("bounds")?.addEventListener("click", () => { volume.control.max = volume.control.max === "100" ? "60" : "100"; volume.refresh(); render() })
    document.getElementById("cancel")?.addEventListener("click", () => form?.addEventListener("reset", event => event.preventDefault(), { once: true }))
    document.getElementById("rtl")?.addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
    document.getElementById("disconnect")?.addEventListener("click", () => {
      helpers.forEach(h => h.disconnect())
      for (const id of ["narrow", "cross", "defaults", "clamp", "bounds", "disconnect"]) {
        const btn = document.getElementById(id)
        if (btn) btn.disabled = true
      }
      render()
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

