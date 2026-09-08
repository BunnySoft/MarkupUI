const list = document.querySelector("#steps")
const nested = window.MarkupUISteps.createSteps(document.querySelector("#nested"))
const steps = window.MarkupUISteps.createSteps(list)
for (const action of list.querySelectorAll("[data-step-action]")) action.hidden = false
let reject = false
const output = document.querySelector("#state")
const report = () => { output.textContent = `Current ${steps.current ?? "unset"}; ${steps.steps.map(step => `${step.index}: ${step.status}`).join(", ")}` }
list.addEventListener("mui:steps-request", event => {
  if (reject) { reject = false; output.textContent = "Application declined this local selection intent."; return }
  steps.current = event.detail.current
  report()
})
list.addEventListener("mui:steps-error", event => { output.textContent = event.detail.error.message })
document.querySelector("#before").addEventListener("click", () => { steps.current = 0; report() })
document.querySelector("#after").addEventListener("click", () => { steps.current = steps.steps.length + 1; report() })
document.querySelector("#unset").addEventListener("click", () => { steps.current = null; report() })
document.querySelector("#status").addEventListener("click", () => { steps.status = steps.status === "error" ? "process" : "error"; report() })
document.querySelector("#finish-review").addEventListener("click", () => { const review = document.querySelector("#review"); if (review) review.dataset.stepStatus = "finish"; steps.refresh(); report() })
document.querySelector("#hide-last").addEventListener("click", () => { const last = document.querySelector("#publish"); if (last) last.hidden = !last.hidden; steps.refresh(); report() })
document.querySelector("#insert").addEventListener("click", () => { const fragment = document.querySelector("#extra-step").content.cloneNode(true); list.insertBefore(fragment, steps.currentStep ?? list.querySelector("template")); steps.refresh(); report() })
document.querySelector("#remove").addEventListener("click", () => { const current = steps.currentStep; if (current?.contains(document.querySelector("#nested"))) nested.disconnect(); current?.remove(); steps.refresh(); report() })
document.querySelector("#direction").addEventListener("click", () => list.classList.toggle("mui-steps--vertical"))
document.querySelector("#placement").addEventListener("click", () => list.classList.toggle("mui-steps--bottom"))
document.querySelector("#reject").addEventListener("click", () => { reject = true })
document.querySelector("#native-form").addEventListener("submit", event => { event.preventDefault(); output.textContent = "Native unrelated form submitted." })
report()
window.stepsDemo = { steps, nested }
