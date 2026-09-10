import { createHeatmap } from "../../dist/markup-ui-heatmap.js"

const normal = [{ date: "2024-02-01", value: -4 }, { date: "2024-02-05", value: 0 },
  { date: "2024-02-14", value: null }, { date: "2024-02-29", value: 20 }, { date: "2024-03-10", value: 5.5 }]
const root = document.querySelector("#heatmap"), feedback = document.querySelector("#feedback")
const heatmap = createHeatmap(root, { data: normal, describe: cell => cell.date === "2024-02-05" ? "Literal <b>local note</b>, not HTML." : "" })
window.heatmapDemo = { heatmap, normal }
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
function show() { feedback.textContent = JSON.stringify(heatmap.state, null, 2) }
function apply(input) {
  try { heatmap.set(input); show() }
  catch (error) { feedback.textContent = `${error.name}: ${error.message}\nThe previous complete data view remains.` }
}
root.addEventListener("mui:heatmap-change", show)
root.addEventListener("mui:heatmap-explore", event => { feedback.textContent = JSON.stringify(event.detail, null, 2) })
document.querySelector("#normal").addEventListener("click", () => apply({ data: normal, range: null, domain: null }))
document.querySelector("#zero").addEventListener("click", () => apply({ data: [
  { date: "2024-02-01", value: 0 }, { date: "2024-02-02", value: 0 }, { date: "2024-02-03", value: 0 },
], range: null, domain: null }))
document.querySelector("#missing").addEventListener("click", () => apply({ data: [
  { date: "2024-02-01", value: null }, { date: "2024-02-05" },
], range: null, domain: null }))
document.querySelector("#empty").addEventListener("click", () => apply({ data: [], range: null, domain: null }))
document.querySelector("#year").addEventListener("click", () => apply({
  data: [{ date: "2028-01-01", value: -1 }, { date: "2028-12-31", value: 1 }],
  range: ["2028-01-01", "2028-12-31"], firstDayOfWeek: 6, fillCalendarLeading: true, domain: null,
}))
document.querySelector("#first").addEventListener("click", () => apply({
  data: [{ date: "0001-01-01", value: 0 }, { date: "0001-01-07", value: 1 }],
  range: ["0001-01-01", "0001-01-07"], firstDayOfWeek: 6, fillCalendarLeading: true, domain: null,
}))
document.querySelector("#last").addEventListener("click", () => apply({
  data: [{ date: "9999-12-30", value: 0 }, { date: "9999-12-31", value: 10 }],
  range: ["9999-12-30", "9999-12-31"], domain: null,
}))
document.querySelector("#equal").addEventListener("click", () => apply({ data: normal, range: null, domain: [5, 5] }))
for (const [id, key] of [["theme", "colorTheme"], ["size", "size"], ["locale", "locale"]]) {
  document.querySelector(`#${id}`).addEventListener("change", event => apply({ [key]: event.target.value }))
}
document.querySelector("#week").addEventListener("change", event => apply({ firstDayOfWeek: Number(event.target.value) }))
for (const [id, key] of [["leading", "fillCalendarLeading"], ["loading", "loading"], ["month-labels", "showMonthLabels"], ["week-labels", "showWeekLabels"], ["legend", "showColorIndicator"]]) {
  document.querySelector(`#${id}`).addEventListener("change", event => apply({ [key]: event.target.checked }))
}
document.querySelector("#fixed-domain").addEventListener("change", event => apply({ domain: event.target.checked ? [-10, 10] : null }))
document.querySelector("#thresholds").addEventListener("change", event => apply({ thresholds: event.target.checked ? [.1, .25, .5, .9] : [.2, .4, .6, .8] }))
document.querySelector("#custom-colors").addEventListener("change", event => apply({ activeColors: event.target.checked ? ["#dbeafe", "#93c5fd", "#60a5fa", "#2563eb", "#1e3a8a"] : null }))
document.querySelector("#minimum-color").addEventListener("change", event => apply({ minimumColor: event.target.checked ? "#ffecb3" : null }))
document.querySelector("#rtl").addEventListener("change", event => { root.dir = event.target.checked ? "rtl" : "ltr" })
document.querySelector("#zoom").addEventListener("change", event => { root.classList.toggle("zoomed", event.target.checked) })
document.querySelector("#duplicate").addEventListener("click", () => apply({ data: [{ date: "2024-02-01", value: 1 }, { date: "2024-02-01", value: 2 }], range: null }))
document.querySelector("#huge").addEventListener("click", () => apply({ data: [], range: ["0001-01-01", "9999-12-31"] }))
document.querySelector("#disconnect").addEventListener("click", () => {
  heatmap.disconnect(); document.querySelector(".demo-controls").hidden = true
  feedback.textContent = "Disconnected: original authored date/value/legend nodes restored. Native form and original action remain."
})
let count = 0
document.querySelector("#author-action").addEventListener("click", event => { event.target.textContent = `Original action count: ${++count}` })
document.querySelector("#native-form").addEventListener("submit", event => {
  event.preventDefault(); feedback.textContent = JSON.stringify([...new FormData(event.currentTarget)], null, 2)
})
show()
