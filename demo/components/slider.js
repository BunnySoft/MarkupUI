const volume = MarkupUISlider.createSlider(document.getElementById("volume-root"), { formatValue: value => `${value} percent` })
const pair = MarkupUISlider.createSliderPair(document.getElementById("window-pair"), { formatValue: value => `${value} minutes` })
const balance = MarkupUISlider.createSlider(document.getElementById("balance-root"))
const vertical = MarkupUISlider.createSlider(document.getElementById("vertical-root"), { formatValue: value => `${value} units` })
const external = MarkupUISlider.createSlider(document.getElementById("external-root"))
window.sliderDemo = { volume, pair, balance, vertical, external }
const helpers = [volume, pair, balance, vertical, external], form = document.getElementById("ranges")
let commits = 0
function render() {
  try { document.getElementById("state").textContent = JSON.stringify({ volume: volume.value, pair: pair.value, ordered: pair.ordered }) }
  catch (error) { document.getElementById("state").textContent = error.message }
}
render()
for (const control of [volume.control, ...pair.controls]) control.addEventListener("input", render)
document.getElementById("window-pair").addEventListener("mui:slider-pair-change", () => {
  document.getElementById("events").textContent = `Pair commits: ${++commits}`; render()
})
form.addEventListener("reset", () => setTimeout(render, 0))
form.addEventListener("submit", event => { event.preventDefault(); document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2) })
document.getElementById("narrow").addEventListener("click", () => { pair.setValue([65, 75]); render() })
document.getElementById("cross").addEventListener("click", () => { pair.setValue([90, 10]); render() })
document.getElementById("defaults").addEventListener("click", () => { pair.controls[0].defaultValue = "15"; pair.controls[1].defaultValue = "85"; pair.refresh(); render() })
document.getElementById("disabled").addEventListener("click", () => { const fieldset = document.getElementById("window-pair"); fieldset.disabled = !fieldset.disabled })
document.getElementById("clamp").addEventListener("click", () => { volume.setValue(999); render() })
document.getElementById("bounds").addEventListener("click", () => { volume.control.max = volume.control.max === "100" ? "60" : "100"; volume.refresh(); render() })
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("disconnect").addEventListener("click", () => {
  helpers.forEach(helper => helper.disconnect())
  for (const id of ["narrow", "cross", "defaults", "clamp", "bounds", "disconnect"]) document.getElementById(id).disabled = true
  render()
})
