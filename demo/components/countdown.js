import { createCountdown, formatCountdown } from "../../dist/markup-ui-countdown.js"

const feedback = document.querySelector("#feedback"), completion = document.querySelector("#completion")
const finishes = []
function finished(name, info) {
  if (name === "main" && document.querySelector("#finish-failure").checked) throw new Error("Intentional main finish-hook failure")
  finishes.push({ name, ...info })
  completion.textContent = `${name} completed run ${info.runId}. No request, sound or navigation occurred.`
}
const main = createCountdown(document.querySelector("#main-countdown"), {
  duration: 10000, active: false,
  format: info => {
    if (info.remaining === 0 && document.querySelector("#format-failure").checked) throw new Error("Intentional main final-formatter failure")
    return document.querySelector("#custom-format").checked
      ? `${info.hours} hours ${info.minutes} minutes ${info.seconds} seconds ${info.milliseconds} milliseconds`
      : formatCountdown(info.remaining, info.precision).text
  },
  onFinish: info => finished("main", info),
})
const units = createCountdown(document.querySelector("#unit-countdown"), { duration: 10000, active: false, onFinish: info => finished("units", info) })
const hidden = createCountdown(document.querySelector("#hidden-countdown"), { duration: 10000, active: false, onFinish: info => finished("hidden", info) })
const helpers = [main, units, hidden]
window.countdownDemo = { main, units, hidden, finishes, formatCountdown }
function show() {
  const state = helper => ({ ...helper.state, error: helper.state.errorPhase ? String(helper.state.error) : null })
  feedback.textContent = JSON.stringify({ main: state(main), units: state(units), hidden: state(hidden), finishes }, null, 2)
}
function perform(action) {
  try { action(); show() } catch (error) { feedback.textContent = `${error.name}: ${error.message}\nThe previous valid run/view remains unless an actual runtime error was reported.` }
}
for (const helper of helpers) {
  helper.element.addEventListener("mui:countdown-finish", () => queueMicrotask(show))
  helper.element.addEventListener("mui:countdown-error", event => { feedback.textContent = `${event.detail.phase} error in run ${event.detail.runId}: ${String(event.detail.error)}` })
}
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
function number(id) {
  const input = document.querySelector(`#${id}`)
  if (input.value === "") throw new Error(`Enter an explicit ${id} number; blank is not zero.`)
  return Number(input.value)
}
document.querySelector("#settings").addEventListener("click", () => perform(() => {
  const settings = { duration: number("duration"), precision: number("precision"), refreshInterval: number("interval") }
  helpers.forEach(helper => helper.set(settings))
}))
document.querySelector("#replace").addEventListener("click", () => perform(() => main.set({ value: number("value") })))
document.querySelector("#start").addEventListener("click", () => perform(() => helpers.forEach(helper => helper.start())))
document.querySelector("#pause").addEventListener("click", () => perform(() => helpers.forEach(helper => helper.pause())))
document.querySelector("#reset").addEventListener("click", () => perform(() => helpers.forEach(helper => helper.reset())))
document.querySelector("#zero").addEventListener("click", () => perform(() => main.set({ value: 0, active: true })))
document.querySelector("#refresh").addEventListener("click", () => perform(() => helpers.forEach(helper => helper.refresh())))
document.querySelector("#hide").addEventListener("click", () => { const node = document.querySelector("#examples"); node.hidden = !node.hidden })
document.querySelector("#rtl").addEventListener("change", event => { document.querySelector("#examples").dir = event.target.checked ? "rtl" : "ltr" })
document.querySelector("#zoom").addEventListener("change", event => { document.querySelector("#examples").classList.toggle("zoomed", event.target.checked) })
document.querySelector("#disconnect").addEventListener("click", () => {
  helpers.forEach(helper => helper.disconnect()); document.querySelector(".controls").hidden = true
  feedback.textContent = "Disconnected: owned timers/listeners released, native duration fallbacks restored unless the author or selection owns the current text."
})
document.querySelector("#native-form").addEventListener("submit", event => event.preventDefault())
show()
