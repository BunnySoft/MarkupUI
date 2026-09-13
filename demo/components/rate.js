import { loadComponentApi } from "../component-api.js"

function initialize() {
  const apiElement = document.getElementById("rate-api")
  if (apiElement) {
    void loadComponentApi(apiElement, new URL("../api/rate.json", import.meta.url))
  }

  const basicRate = document.getElementById("basic-rate")
  const basicStatus = document.getElementById("basic-status")
  basicRate?.addEventListener("m:change", event => {
    if (basicStatus) basicStatus.textContent = `Selected: ${event.detail.value} of ${basicRate.count}`
  })

  const clearableRate = document.getElementById("clearable-rate")
  const clearBtn = document.getElementById("clear-btn")
  clearBtn?.addEventListener("click", () => {
    clearableRate?.clear()
  })

  // Authored template controller demo
  const qualityEl = document.getElementById("quality")
  const detailEl = document.getElementById("detail")
  const lockedEl = document.getElementById("locked-rate")
  const form = document.getElementById("review")

  if (qualityEl && detailEl && lockedEl && form && globalThis.MarkupUIRate?.createRate) {
    const quality = globalThis.MarkupUIRate.createRate(qualityEl)
    const detail = globalThis.MarkupUIRate.createRate(detailEl, { count: 3, allowHalf: true })
    const locked = globalThis.MarkupUIRate.createRate(lockedEl, { count: 3 })
    window.rateDemo = { quality, detail, locked }
    const counts = { native: 0, radio: 0, clear: 0 }
    function render() {
      try {
        const stateEl = document.getElementById("state")
        if (stateEl) stateEl.textContent = JSON.stringify({ quality: quality.value, detail: detail.value, disabledScore: locked.value })
      } catch (error) {
        const stateEl = document.getElementById("state")
        if (stateEl) stateEl.textContent = error.message
      }
      const eventsEl = document.getElementById("events")
      if (eventsEl) eventsEl.textContent = `Quality native changes: ${counts.native}; radio commits: ${counts.radio}; clears: ${counts.clear}`
    }
    render()

    qualityEl.addEventListener("change", () => { counts.native++; render() })
    qualityEl.addEventListener("m:radio-group-change", () => { counts.radio++; render() })
    qualityEl.addEventListener("m:rate-clear", () => { counts.clear++; render() })
    qualityEl.addEventListener("m:radio-group-error", render)
    qualityEl.addEventListener("m:rate-error", render)
    form.addEventListener("reset", () => setTimeout(render, 0))
    form.addEventListener("submit", event => {
      event.preventDefault()
      const sub = document.getElementById("submission")
      if (sub) sub.textContent = JSON.stringify([...new FormData(form)], null, 2)
    })
    document.getElementById("set-four")?.addEventListener("click", () => { quality.setValue(4); render() })
    document.getElementById("set-zero")?.addEventListener("click", () => { quality.setValue(0); render() })
    document.getElementById("set-none")?.addEventListener("click", () => { quality.setValue(null); render() })
    document.getElementById("set-half")?.addEventListener("click", () => { detail.setValue(2.5); render() })
    document.getElementById("defaults")?.addEventListener("click", () => {
      for (const input of qualityEl.querySelectorAll("input")) input.defaultChecked = input.value === "2"
      quality.refresh(); render()
    })
    document.getElementById("disabled")?.addEventListener("click", () => { qualityEl.disabled = !qualityEl.disabled })
    document.getElementById("cancel")?.addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
    document.getElementById("rtl")?.addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
    document.getElementById("disconnect")?.addEventListener("click", () => {
      quality.disconnect(); detail.disconnect(); locked.disconnect()
      for (const id of ["set-four", "set-zero", "set-none", "set-half", "defaults", "disconnect"]) {
        const btn = document.getElementById(id)
        if (btn) btn.disabled = true
      }
      render()
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

