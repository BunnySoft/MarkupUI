import "../../dist/markup-ui-box.js"
import "../../dist/markup-ui-typography.js"
import "../../dist/markup-ui-button.js"
import "../../dist/markup-ui-chart.js"
import { bind, createStore } from "../../dist/markup-ui-state.js"
import { loadComponentApi } from "../component-api.js"

document.getElementById("regional").source = {
  region: ["North", "South", "West"],
  desktop: [120, 180, 140],
  mobile: [90, 110, 160],
}
const sales = [
  { month: "January", sales: 120 }, { month: "February", sales: 180 },
  { month: "March", sales: 150 }, { month: "April", sales: 210 },
]
const store = createStore({ report: { sales } })
const stop = bind(document.getElementById("bound-chart"), store)
let updated = false
document.getElementById("update-sales").addEventListener("click", () => {
  updated = !updated
  store.set("report.sales", sales.map(row => ({ ...row, sales: row.sales + (updated ? 40 : 0) })))
})
document.getElementById("reload-sales").addEventListener("click", () => {
  void document.getElementById("remote-sales").reload().catch(() => {})
})
const direct = document.getElementById("direct-chart")
direct.tableSource = [["Quarter", "Total"], ["Q1", 450], ["Q2", 620], ["Q3", 580]]
direct.option = {
  title: { text: "Quarterly totals" },
  dataset: { source: direct.tableSource },
  xAxis: { type: "category" },
  yAxis: { type: "value" },
  series: [{ type: "line", encode: { x: "Quarter", y: "Total" } }],
}
window.addEventListener("pagehide", event => { if (!event.persisted) stop() })
void loadComponentApi(document.getElementById("chart-api"), new URL("../api/chart.json", import.meta.url))
