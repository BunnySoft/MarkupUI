import { createWatermark } from "../../dist/markup-ui-watermark.js"

const root = document.querySelector("#watermark"), feedback = document.querySelector("#feedback")
const localImage = document.querySelector("#local-image")
const watermark = createWatermark(root, { content: "LOCAL DRAFT\nMarkupUI example", width: 260, height: 140,
  xGap: 64, yGap: 54, rotate: -24, fontSize: 20, lineHeight: 28, fontColor: "rgba(35, 85, 140, .35)" })
window.watermarkDemo = { watermark, localImage }
function show() {
  const state = watermark.state
  feedback.textContent = JSON.stringify({ ...state, error: state.error ? { name: state.error.name, message: state.error.message } : null }, null, 2)
}
root.addEventListener("mui:watermark-state", show)
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
async function apply(input) {
  try { await watermark.update(input); show() }
  catch (error) { feedback.textContent = `${error.name}: ${error.message}\nThe previous tile/settings were not changed.` }
}
document.querySelector("#apply").addEventListener("click", () => apply({
  image: null, loadImage: null, content: document.querySelector("#content").value,
  rotate: Number(document.querySelector("#rotate").value), fontSize: Number(document.querySelector("#font-size").value),
  fontColor: document.querySelector("#color").value, opacity: Number(document.querySelector("#opacity").value),
  pixelRatio: document.querySelector("#pixel-ratio").value === "auto" ? "auto" : Number(document.querySelector("#pixel-ratio").value),
  cross: document.querySelector("#cross").checked, debug: document.querySelector("#debug").checked,
  fullscreen: document.querySelector("#fullscreen").checked,
}))
document.querySelector("#use-image").addEventListener("click", () => apply({ image: localImage, loadImage: null }))
document.querySelector("#race").addEventListener("click", () => {
  void apply({ image: null, loadImage: ({ signal }) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(localImage) }, 800)
    function abort() { clearTimeout(timer); reject(new DOMException("Caller loader cancelled", "AbortError")) }
    signal.addEventListener("abort", abort, { once: true })
  }) })
  void apply({ loadImage: null, image: null, content: "LATEST TEXT WINS" })
})
document.querySelector("#error").addEventListener("click", () => {
  const bad = new Image(); bad.src = "data:image/png;base64,aW52YWxpZA=="; void apply({ image: bad, loadImage: null })
})
document.querySelector("#clear").addEventListener("click", () => apply({ content: "", image: null, loadImage: null }))
document.querySelector("#refresh").addEventListener("click", async () => {
  try { await watermark.refresh(); show() } catch (error) { feedback.textContent = error.message }
})
document.querySelector("#disconnect").addEventListener("click", () => { watermark.disconnect(); document.querySelector(".controls").hidden = true })
for (const [id, name] of [["narrow", "narrow"], ["zoom", "zoomed"], ["self-scroll", "self-scrolling"]]) {
  document.querySelector(`#${id}`).addEventListener("change", event => root.classList.toggle(name, event.target.checked))
}
document.querySelector("#rtl").addEventListener("change", event => { root.dir = event.target.checked ? "rtl" : "ltr" })
document.querySelector("#native-form").addEventListener("submit", event => {
  event.preventDefault(); feedback.textContent = JSON.stringify([...new FormData(event.currentTarget)], null, 2)
})
let count = 0
document.querySelector("#count").addEventListener("click", event => { event.target.textContent = `Native action count: ${++count}` })
await watermark.ready; show()
