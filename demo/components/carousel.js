import { createCarousel } from "../../dist/markup-ui-carousel.js"

const root = document.querySelector("#main-carousel")
const carousel = createCarousel(root, { interval: 2000 })
const nested = createCarousel(document.querySelector("#nested-carousel"), { loop: false })
const hidden = createCarousel(document.querySelector("#hidden-carousel"), { defaultIndex: 1 })
const feedback = document.querySelector("#feedback")
const show = () => { feedback.textContent = JSON.stringify(carousel.state, null, 2) }
window.carouselDemo = { carousel, nested, hidden }
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
root.addEventListener("mui:carousel-change", event => {
  if (event.target === root) show()
})
document.querySelector("#direction").addEventListener("change", event => { carousel.set({ direction: event.target.value }); show() })
document.querySelector("#rtl").addEventListener("change", event => { root.dir = event.target.checked ? "rtl" : "ltr"; carousel.refresh(); show() })
for (const [id, option] of [["loop", "loop"], ["autoplay", "autoplay"], ["disable", "disabled"]]) {
  document.querySelector(`#${id}`).addEventListener("change", event => { carousel.set({ [option]: event.target.checked }); show() })
}
document.querySelector("#narrow").addEventListener("change", event => { root.classList.toggle("narrow", event.target.checked) })
document.querySelector("#zoom").addEventListener("change", event => { root.classList.toggle("zoomed", event.target.checked); carousel.refresh() })
document.querySelector("#reorder").addEventListener("click", () => {
  const slide = carousel.slides[carousel.getCurrentIndex()]
  if (slide) carousel.viewport.prepend(slide)
  carousel.refresh(); show()
})
document.querySelector("#remove").addEventListener("click", () => {
  carousel.slides[carousel.getCurrentIndex()]?.remove(); carousel.refresh(); show()
})
document.querySelector("#add").addEventListener("click", () => {
  carousel.viewport.append(document.querySelector("#new-slide").content.cloneNode(true)); carousel.refresh(); show()
})
document.querySelector("#hide").addEventListener("click", () => {
  root.hidden = !root.hidden
  if (!root.hidden) carousel.refresh()
  show()
})
document.querySelector("#disconnect").addEventListener("click", () => {
  carousel.disconnect(); nested.disconnect(); hidden.disconnect()
  document.querySelector(".demo-controls").hidden = true
  feedback.textContent = "Disconnected: native slide scrolling and controls inside slides remain. Reload to rebind."
})
let clicks = 0
document.querySelector("#counter").addEventListener("click", event => { event.target.textContent = `Local click count: ${++clicks}` })
document.querySelector("#fields").addEventListener("submit", event => {
  event.preventDefault(); feedback.textContent = JSON.stringify([...new FormData(event.currentTarget)], null, 2)
})
show()
