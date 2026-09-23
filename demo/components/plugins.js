import { m } from "../../dist/markup-ui.js"
import "../../dist/markup-ui-box.js"
import "../../dist/markup-ui-button.js"
import "../../dist/markup-ui-typography.js"
import { advancedPlugin } from "../../dist/markup-ui-advanced.js"
import { widgetsPlugin } from "../../dist/markup-ui-widgets.js"

m.use(advancedPlugin)
m.use(widgetsPlugin)
const grid = document.querySelector("#scores")
const scoreColumn = grid.querySelector('[key="score"]')
const status = document.querySelector("#grid-status")
grid.rows = [{ name: "Grace", score: 10 }, { name: "Ada", score: 2 }]
grid.addEventListener("m:sort", event => {
  status.textContent = `${event.detail.key}: ${event.detail.direction}`
})
grid.addEventListener("m:error", event => { status.textContent = event.detail.message })
document.querySelector("#replace-rows").addEventListener("click", () => {
  grid.rows = [{ name: "Lin", score: 25 }, { name: "Sam", score: 4 }]
})
document.querySelector("#toggle-column").addEventListener("click", () => {
  if (scoreColumn.parentNode === grid) scoreColumn.remove()
  else grid.append(scoreColumn)
})
document.querySelector("#reconnect-grid").addEventListener("click", () => {
  const next = grid.nextSibling, parent = grid.parentNode
  grid.remove()
  parent.insertBefore(grid, next)
})

const rating = document.querySelector("#review-score")
const ratingStatus = document.querySelector("#rating-status")
let changes = 0
rating.addEventListener("m:change", event => {
  ratingStatus.textContent = `Score ${event.detail}; user changes: ${++changes}`
})
rating.addEventListener("m:error", event => { ratingStatus.textContent = event.detail.message })
document.querySelector("#assign-score").addEventListener("click", () => { rating.value = 2 })
document.querySelector("#disable-score").addEventListener("click", () => { rating.disabled = !rating.disabled })
document.querySelector("#resize-score").addEventListener("click", () => {
  const max = rating.max === 5 ? 3 : 5
  if (rating.value > max) rating.value = max
  rating.max = max
})
document.querySelector("#reconnect-score").addEventListener("click", () => {
  const next = rating.nextSibling, parent = rating.parentNode
  rating.remove()
  parent.insertBefore(rating, next)
})
