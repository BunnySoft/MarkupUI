const inlineRoot = document.querySelector("#inline-bar")
const fixedRoot = document.querySelector("#fixed-bar")
const inline = window.MarkupUILoadingBar.createLoadingBar(inlineRoot, { finishDelay: 800 })
const fixed = window.MarkupUILoadingBar.createLoadingBar(fixedRoot, { finishDelay: 1000, errorDelay: 1800 })
fixedRoot.hidden = false
document.querySelector("#controls").hidden = false
document.querySelector("#fixed-controls").hidden = false
const events = document.querySelector("#events")
for (const root of [inlineRoot, fixedRoot]) {
  root.addEventListener("mui:loading-bar-change", event => { events.textContent = `${root.id}: ${event.detail.previous} → ${event.detail.state}` })
  root.addEventListener("mui:loading-bar-fault", event => { events.textContent = event.detail.error.message })
}
document.querySelector("#start").addEventListener("click", () => inline.start())
document.querySelector("#measure").addEventListener("click", () => { if (inline.state !== "loading") inline.start(); inline.setProgress(40) })
document.querySelector("#finish").addEventListener("click", () => inline.finish())
document.querySelector("#error").addEventListener("click", () => inline.error())
document.querySelector("#stop").addEventListener("click", () => inline.stop())
document.querySelector("#restart").addEventListener("click", () => { inline.start(); inline.finish(); inline.start() })
document.querySelector("#reset").addEventListener("click", () => { inline.disconnect(); inline.connect(); events.textContent = "Inline controller reconnected idle." })
document.querySelector("#fixed-start").addEventListener("click", () => fixed.start())
document.querySelector("#fixed-finish").addEventListener("click", () => fixed.finish())
document.querySelector("#fixed-error").addEventListener("click", () => { fixed.stop(); fixed.error() })
document.querySelector("#native-form").addEventListener("submit", event => { event.preventDefault(); events.textContent = "Unrelated native form submitted." })
events.textContent = "Both independent controllers connected idle."
window.loadingBarDemo = { inline, fixed }
