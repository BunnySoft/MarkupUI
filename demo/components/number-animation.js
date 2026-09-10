import { createNumberAnimation } from "../../dist/markup-ui-number-animation.js"

const feedback = document.querySelector("#feedback"), completion = document.querySelector("#completion"), finishes = []
function done(name, info) {
  finishes.push({ name, ...info })
  completion.textContent = `${name} finished run ${info.runId} at its exact requested endpoint.`
}
const animation = createNumberAnimation(document.querySelector("#number"), {
  from: 0, to: 2500.5, duration: 1500, precision: 2, showSeparator: true, active: false,
  onFinish: info => done("main", info),
})
const hidden = createNumberAnimation(document.querySelector("#hidden-number"), {
  from: 100, to: 0, duration: 1000, active: false, onFinish: info => done("hidden", info),
})
window.numberAnimationDemo = { animation, hidden, finishes }
function show() {
  const state = helper => ({ ...helper.state, error: helper.state.errorPhase ? String(helper.state.error) : null })
  document.querySelector("#active").checked = animation.state.active
  feedback.textContent = JSON.stringify({ main: state(animation), hidden: state(hidden), finishes }, null, 2)
}
function perform(action) {
  try { action(); show() } catch (error) { feedback.textContent = `${error.name}: ${error.message}\nThe last valid view/run remains.` }
}
for (const helper of [animation, hidden]) {
  helper.element.addEventListener("mui:number-animation-finish", () => queueMicrotask(show))
  helper.element.addEventListener("mui:number-animation-error", event => { feedback.textContent = `${event.detail.phase}: ${String(event.detail.error)}` })
}
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
function number(id) {
  const value = document.querySelector(`#${id}`).value
  if (value === "") throw new Error(`Enter an explicit ${id} number; blank is not zero.`)
  return Number(value)
}
document.querySelector("#apply").addEventListener("click", () => perform(() => animation.set({
  from: number("from"), to: number("to"), duration: number("duration"), precision: number("precision"),
  locale: document.querySelector("#locale").value, showSeparator: document.querySelector("#group").checked,
  easing: document.querySelector("#easing").value, active: document.querySelector("#active").checked,
})))
document.querySelector("#active").addEventListener("change", event => perform(() => animation.set({ active: event.target.checked })))
document.querySelector("#play").addEventListener("click", () => perform(() => animation.play()))
document.querySelector("#pause").addEventListener("click", () => perform(() => animation.pause()))
document.querySelector("#cancel").addEventListener("click", () => perform(() => animation.cancel()))
document.querySelector("#reset").addEventListener("click", () => perform(() => animation.reset()))
document.querySelector("#retarget").addEventListener("click", () => perform(() => animation.retarget(number("to"), number("duration"))))
document.querySelector("#extremes").addEventListener("click", () => perform(() => animation.set({ from: -Number.MAX_VALUE, to: Number.MAX_VALUE, duration: 1000, precision: 0, easing: "linear", active: true })))
document.querySelector("#equal").addEventListener("click", () => perform(() => animation.set({ from: 42, to: 42, active: true })))
document.querySelector("#zero").addEventListener("click", () => perform(() => animation.set({ from: 0, to: -10.25, duration: 0, precision: 2, active: true })))
document.querySelector("#fail-format").addEventListener("click", () => perform(() => animation.set({ format: info => {
  if (info.progress > .5) throw new Error("Intentional local formatter failure")
  return String(info.value)
}, from: 0, to: 100, duration: 1000, active: true })))
document.querySelector("#recover").addEventListener("click", () => perform(() => animation.set({ format: null })))
document.querySelector("#hidden-play").addEventListener("click", () => perform(() => hidden.play()))
document.querySelector("#hide").addEventListener("click", () => { const node = document.querySelector("#display"); node.hidden = !node.hidden })
document.querySelector("#rtl").addEventListener("change", event => { document.querySelector("#display").dir = event.target.checked ? "rtl" : "ltr" })
document.querySelector("#zoom").addEventListener("change", event => { document.querySelector("#display").classList.toggle("zoomed", event.target.checked) })
document.querySelector("#disconnect").addEventListener("click", () => {
  animation.disconnect(); hidden.disconnect(); document.querySelector(".controls").hidden = true
  feedback.textContent = "Disconnected: frames/tasks/listeners released. Native final fallbacks restore unless selection/author changes own the current value."
})
document.querySelector("#native-form").addEventListener("submit", event => event.preventDefault())
show()
