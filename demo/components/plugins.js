import { m } from "../../dist/markup-ui.js"
import "../../dist/markup-ui-box.js"
import "../../dist/markup-ui-button.js"
import "../../dist/markup-ui-typography.js"
import { advancedPlugin } from "../../dist/markup-ui-advanced.js"

m.use(advancedPlugin)
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
