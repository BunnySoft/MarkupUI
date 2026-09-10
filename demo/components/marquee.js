import { createMarquee } from "../../dist/markup-ui-marquee.js"

const main = createMarquee(document.querySelector("#main-marquee"))
const short = createMarquee(document.querySelector("#short-marquee"))
const hidden = createMarquee(document.querySelector("#hidden-marquee"))
const helpers = [main, short, hidden], feedback = document.querySelector("#feedback"), completion = document.querySelector("#completion")
window.marqueeDemo = { main, short, hidden }
function show() {
  const state = helper => ({ ...helper.state, error: helper.state.error ? String(helper.state.error) : null })
  feedback.textContent = JSON.stringify({ main: state(main), short: state(short), hidden: state(hidden) }, null, 2)
}
for (const helper of helpers) {
  helper.element.addEventListener("mui:marquee-change", show)
  helper.element.addEventListener("mui:marquee-finish", () => { completion.textContent = "A finite traversal completed. The original content is now static and fully reachable."; show() })
  helper.element.addEventListener("mui:marquee-error", event => { feedback.textContent = `${String(event.detail.error)}\nContent remains reachable in static view.` })
}
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
document.querySelector("#apply").addEventListener("click", () => {
  try {
    const speed = document.querySelector("#speed").value, delay = document.querySelector("#delay").value
    if (!speed || !delay) throw new Error("Supply explicit speed and delay numbers.")
    main.set({ speed: Number(speed), delay: Number(delay), direction: document.querySelector("#direction").value,
      iterations: document.querySelector("#iterations").value === "infinite" ? "infinite" : Number(document.querySelector("#iterations").value) })
    show()
  } catch (error) { feedback.textContent = String(error) }
})
for (const id of ["narrow", "wide", "zoom"]) {
  document.querySelector(`#${id}`).addEventListener("change", event => { main.element.classList.toggle(id === "zoom" ? "zoomed" : id, event.target.checked) })
}
document.querySelector("#rtl").addEventListener("change", event => { main.element.dir = event.target.checked ? "rtl" : "ltr" })
const suffix = document.createTextNode(" Additional application-authored text keeps the same original track and can be removed again.")
document.querySelector("#extra").addEventListener("click", () => { if (suffix.parentNode) suffix.remove(); else main.content.append(suffix) })
const interactive = document.createElement("button"); interactive.type = "button"; interactive.textContent = "New authored control: static only"
document.querySelector("#interactive").addEventListener("click", () => { if (interactive.parentNode) interactive.remove(); else main.content.append(interactive) })
document.querySelector("#hidden-play").addEventListener("click", () => hidden.play())
document.querySelector("#disconnect").addEventListener("click", () => {
  helpers.forEach(helper => helper.disconnect()); document.querySelector(".demo-controls").hidden = true
  feedback.textContent = "Disconnected: no owned animation/observer/listener remains. Original native scrolling content and independent form controls remain."
})
document.querySelector("#native-form").addEventListener("submit", event => event.preventDefault())
show()
