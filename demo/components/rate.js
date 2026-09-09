const quality = MarkupUIRate.createRate(document.getElementById("quality"))
const detail = MarkupUIRate.createRate(document.getElementById("detail"), { count: 3, allowHalf: true })
const locked = MarkupUIRate.createRate(document.getElementById("locked-rate"), { count: 3 })
window.rateDemo = { quality, detail, locked }
const form = document.getElementById("review"), counts = { native: 0, radio: 0, clear: 0 }
function render() {
  try { document.getElementById("state").textContent = JSON.stringify({ quality: quality.value, detail: detail.value, disabledScore: locked.value }) }
  catch (error) { document.getElementById("state").textContent = error.message }
  document.getElementById("events").textContent = `Quality native changes: ${counts.native}; radio commits: ${counts.radio}; clears: ${counts.clear}`
}
render()
const root = document.getElementById("quality")
root.addEventListener("change", () => { counts.native++; render() })
root.addEventListener("mui:radio-group-change", () => { counts.radio++; render() })
root.addEventListener("mui:rate-clear", () => { counts.clear++; render() })
root.addEventListener("mui:radio-group-error", render)
root.addEventListener("mui:rate-error", render)
form.addEventListener("reset", () => setTimeout(render, 0))
form.addEventListener("submit", event => { event.preventDefault(); document.getElementById("submission").textContent = JSON.stringify([...new FormData(form)], null, 2) })
document.getElementById("set-four").addEventListener("click", () => { quality.setValue(4); render() })
document.getElementById("set-zero").addEventListener("click", () => { quality.setValue(0); render() })
document.getElementById("set-none").addEventListener("click", () => { quality.setValue(null); render() })
document.getElementById("set-half").addEventListener("click", () => { detail.setValue(2.5); render() })
document.getElementById("defaults").addEventListener("click", () => {
  for (const input of root.querySelectorAll("input")) input.defaultChecked = input.value === "2"
  quality.refresh(); render()
})
document.getElementById("disabled").addEventListener("click", () => { root.disabled = !root.disabled })
document.getElementById("cancel").addEventListener("click", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
document.getElementById("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
document.getElementById("disconnect").addEventListener("click", () => {
  quality.disconnect(); detail.disconnect(); locked.disconnect()
  for (const id of ["set-four", "set-zero", "set-none", "set-half", "defaults", "disconnect"]) document.getElementById(id).disabled = true
  render()
})
