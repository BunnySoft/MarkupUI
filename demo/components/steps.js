import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUISteps
  if (!api) throw new Error("Steps runtime did not load.")
  void loadComponentApi(document.getElementById("steps-api"), new URL("../api/steps.json", import.meta.url))

  // Interactive ViewElement controls
  const interactiveSteps = document.querySelector("#interactive-steps")
  const statusEl = document.querySelector("#interactive-status")

  interactiveSteps?.addEventListener("m:change", (event) => {
    if (statusEl) {
      statusEl.textContent = `Current step: ${event.detail.current}`
    }
  })

  document.querySelector("#prev-step")?.addEventListener("click", () => {
    interactiveSteps?.previous()
    if (statusEl && interactiveSteps) {
      statusEl.textContent = `Current step: ${interactiveSteps.current}`
    }
  })

  document.querySelector("#next-step")?.addEventListener("click", () => {
    interactiveSteps?.next()
    if (statusEl && interactiveSteps) {
      statusEl.textContent = `Current step: ${interactiveSteps.current}`
    }
  })

  document.querySelector("#toggle-vertical")?.addEventListener("click", () => {
    if (interactiveSteps) {
      interactiveSteps.vertical = !interactiveSteps.vertical
    }
  })

  document.querySelector("#toggle-error")?.addEventListener("click", () => {
    if (interactiveSteps) {
      interactiveSteps.status = interactiveSteps.status === "error" ? "process" : "error"
      interactiveSteps.synchronize()
    }
  })

  // Progressive enhancement example
  const list = document.querySelector("#steps")
  const nestedEl = document.querySelector("#nested")
  if (list && typeof api.createSteps === "function") {
    try {
      const nested = nestedEl ? api.createSteps(nestedEl) : undefined
      const steps = api.createSteps(list)
      for (const action of list.querySelectorAll("[data-step-action]")) action.hidden = false
      let reject = false
      const output = document.querySelector("#state")
      const report = () => {
        if (output) {
          output.textContent = `Current ${steps.current ?? "unset"}; ${steps.steps.map(step => `${step.index}: ${step.status}`).join(", ")}`
        }
      }
      list.addEventListener("m:steps-request", (event) => {
        if (reject) {
          reject = false
          if (output) output.textContent = "Application declined this local selection intent."
          return
        }
        steps.current = event.detail.current
        report()
      })
      list.addEventListener("m:steps-error", (event) => {
        if (output) output.textContent = event.detail.error.message
      })
      document.querySelector("#before")?.addEventListener("click", () => { steps.current = 0; report() })
      document.querySelector("#after")?.addEventListener("click", () => { steps.current = steps.steps.length + 1; report() })
      document.querySelector("#unset")?.addEventListener("click", () => { steps.current = null; report() })
      document.querySelector("#status")?.addEventListener("click", () => { steps.status = steps.status === "error" ? "process" : "error"; report() })
      document.querySelector("#finish-review")?.addEventListener("click", () => { const review = document.querySelector("#review"); if (review) review.dataset.stepStatus = "finish"; steps.refresh(); report() })
      document.querySelector("#hide-last")?.addEventListener("click", () => { const last = document.querySelector("#publish"); if (last) last.hidden = !last.hidden; steps.refresh(); report() })
      document.querySelector("#insert")?.addEventListener("click", () => { const fragment = document.querySelector("#extra-step")?.content.cloneNode(true); if (fragment) { list.insertBefore(fragment, steps.currentStep ?? list.querySelector("template")); steps.refresh(); report() } })
      document.querySelector("#remove")?.addEventListener("click", () => { const current = steps.currentStep; if (current && nestedEl && current.contains(nestedEl)) nested?.disconnect(); current?.remove(); steps.refresh(); report() })
      document.querySelector("#direction")?.addEventListener("click", () => list.classList.toggle("m-steps--vertical"))
      document.querySelector("#placement")?.addEventListener("click", () => list.classList.toggle("m-steps--bottom"))
      document.querySelector("#reject")?.addEventListener("click", () => { reject = true })
      document.querySelector("#native-form")?.addEventListener("submit", (event) => { event.preventDefault(); if (output) output.textContent = "Native unrelated form submitted." })
      report()
      window.stepsDemo = { steps, nested }
    } catch {
      // ignore
    }
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

