import { createTime, formatTime } from "../../dist/markup-ui-time.js"

const feedback = document.querySelector("#feedback"), examples = document.querySelector("#examples")
const absolute = createTime(document.querySelector("#absolute-time"), { time: new Date("2024-03-10T07:30:00Z") })
const staticRelative = createTime(document.querySelector("#static-relative"), { time: 0, to: 60000, type: "relative" })
const anchor = Date.now() - 2000
const live = createTime(document.querySelector("#live-relative"), { time: anchor, type: "relative", live: true })
const hidden = createTime(document.querySelector("#hidden-time"), { time: anchor, type: "relative", live: true })
window.timeDemo = { absolute, staticRelative, live, hidden, formatTime, anchor }
const helpers = [absolute, staticRelative, live, hidden]
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
function show() {
  feedback.textContent = JSON.stringify({ absolute: absolute.state, staticRelative: staticRelative.state,
    live: live.state, hidden: hidden.state }, null, 2)
}
for (const helper of helpers) {
  if (!helper.state.live) helper.element.addEventListener("mui:time-change", show)
  helper.element.addEventListener("mui:time-error", event => { feedback.textContent = String(event.detail.error) })
}
function apply(extra = {}) {
  try {
    const value = document.querySelector("#epoch").value
    if (!value) throw new Error("Enter an explicit epoch number; an empty field is not zero.")
    absolute.set({ time: Number(value), unit: document.querySelector("#unit").value,
      type: document.querySelector("#type").value, locale: document.querySelector("#locale").value,
      timeZone: document.querySelector("#zone").value, dateTime: undefined, ...extra })
    show()
  } catch (error) { feedback.textContent = `${error.name}: ${error.message}\nThe previous datetime/text pair remains.` }
}
document.querySelector("#apply").addEventListener("click", () => apply())
for (const [id, value] of [["zero", 0], ["negative", -1000], ["fold-first", 1730611800000], ["fold-second", 1730615400000], ["year1", -62135596800000]]) {
  document.querySelector(`#${id}`).addEventListener("click", () => {
    document.querySelector("#epoch").value = value; document.querySelector("#unit").value = "milliseconds"
    if (id.startsWith("fold")) document.querySelector("#zone").value = "America/New_York"
    if (id === "year1") document.querySelector("#zone").value = "UTC"
    apply()
  })
}
document.querySelector("#bad-string").addEventListener("click", () => apply({ time: "2024-03-10" }))
document.querySelector("#bad-options").addEventListener("click", () => apply({ dateTime: { dateStyle: "full", year: "numeric" } }))
document.querySelector("#rtl").addEventListener("change", event => { examples.dir = event.target.checked ? "rtl" : "ltr" })
document.querySelector("#zoom").addEventListener("change", event => { examples.classList.toggle("zoomed", event.target.checked) })
document.querySelector("#hide").addEventListener("click", () => { examples.hidden = !examples.hidden; show() })
document.querySelector("#freeze").addEventListener("click", event => {
  live.set({ live: !live.state.live })
  event.target.textContent = live.state.live ? "Freeze live relative reference" : "Resume live relative reference"
  show()
})
document.querySelector("#disconnect").addEventListener("click", () => {
  helpers.forEach(helper => helper.disconnect()); document.querySelector(".controls").hidden = true
  feedback.textContent = "Disconnected: no timers/listeners remain. Authored pairs restore unless the author or an active native selection owns the displayed pair."
})
document.querySelector("#native-form").addEventListener("submit", event => event.preventDefault())
show()
