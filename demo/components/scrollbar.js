const vertical = document.querySelector("#vertical-scroll")
const behavior = () => matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
document.querySelector("#scroll-by").addEventListener("click", () => vertical.scrollBy({ top: 120, behavior: behavior() }))
document.querySelector("#scroll-top").addEventListener("click", () => vertical.scrollTo(0, 0))
document.querySelector("#scroll-bottom").addEventListener("click", () => vertical.scrollTo({ top: vertical.scrollHeight, behavior: behavior() }))
document.querySelector("#resize-region").addEventListener("click", () => vertical.classList.toggle("taller"))
vertical.addEventListener("scroll", () => {
  document.querySelector("#scroll-position").textContent = `Native top: ${vertical.scrollTop}; left: ${vertical.scrollLeft}`
}, { passive: true })
document.querySelector("#reveal-far").addEventListener("click", () => {
  const link = document.querySelector("#far-link")
  link.scrollIntoView({ block: "nearest", inline: "nearest", behavior: behavior() })
  link.focus({ preventScroll: true })
})
document.querySelector("#contain-toggle").addEventListener("change", event => {
  document.querySelector("#inner-scroll").classList.toggle("contain-scroll", event.currentTarget.checked)
})
const form = document.querySelector("#native-form")
form.addEventListener("submit", event => {
  event.preventDefault()
  document.querySelector("#form-feedback").textContent = `Saved activity note: ${new FormData(form).get("note")}`
})
