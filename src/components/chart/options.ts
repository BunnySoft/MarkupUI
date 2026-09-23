import { ChartDataset } from "./dataset.js"
import { ChartEncode, ChartLabel, ChartLegend, ChartSeries, ChartTitle, ChartTooltip, ChartXAxis, ChartYAxis } from "./config.js"
import { chartTable, validateSource, type ChartSource } from "./data.js"

export type ChartOption = Record<string, unknown>
export interface ChartTableData { name: string; columns: string[]; rows: Array<Array<string | number | null>> }
export interface ChartConfiguration { option: ChartOption; tables: ChartTableData[]; loading: boolean }

function attributes(element: Element, names: string[]): void {
  for (const { name } of element.attributes) {
    if (!names.includes(name) && !["id", "class", "hidden"].includes(name) && !name.startsWith("data-bind-")) {
      throw new TypeError(`Unsupported ${element.localName} attribute: ${name}`)
    }
  }
}
const compact = (object: ChartOption): ChartOption => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== null))

export function chartConfiguration(host: HTMLElement): ChartConfiguration {
  const option: ChartOption = { animation: false, tooltip: { show: false }, grid: { containLabel: true, left: 24, right: 24, top: 80, bottom: 24 } }
  const datasets: ChartOption[] = [], series: ChartOption[] = [], tables: ChartTableData[] = []
  const singleton = new Set<string>(), ids = new Set<string>(), datasetIds = new Set<string>()
  let loading = false
  const children = [...host.children].filter(child => child.localName.startsWith("m-chart-"))
  for (const child of children) {
    if (child.id) {
      if (ids.has(child.id)) throw new TypeError("Chart configuration IDs must be unique.")
      ids.add(child.id)
    }
    if (!(child instanceof ChartDataset) && !(child instanceof ChartSeries)) {
      if (singleton.has(child.localName)) throw new TypeError(`Duplicate ${child.localName}.`)
      singleton.add(child.localName)
      if (child.children.length) throw new TypeError("Scalar chart configuration cannot contain child elements.")
    }
    if (child instanceof ChartDataset) {
      attributes(child, ["source", "src", "source-path", "dimensions", "source-header"])
      if (child.error) throw child.error
      const source = child.source
      validateSource(source)
      datasets.push(compact({ id: child.id || null, source, dimensions: child.dimensions, sourceHeader: child.sourceHeader }))
      if (child.id) datasetIds.add(child.id)
      tables.push({ name: child.id || `Dataset ${datasets.length}`, ...chartTable(source, child.dimensions, child.sourceHeader) })
      loading ||= child.loading
    } else if (child instanceof ChartSeries) {
      attributes(child, ["type", "name", "dataset-id", "stack", "smooth", "area-style", "radius", "series-layout-by"])
      const item = compact({
        id: child.id || null, type: child.type, name: child.name, datasetId: child.datasetId,
        stack: child.stack, smooth: child.smooth, areaStyle: child.areaStyle, radius: child.radius, seriesLayoutBy: child.seriesLayoutBy,
      })
      if (child.areaStyle !== null && child.type !== "line") throw new TypeError("area-style requires a line series.")
      if (child.radius !== null && child.type !== "pie") throw new TypeError("radius requires a pie series.")
      const companions = new Set<string>()
      for (const region of child.children) {
        if (companions.has(region.localName) || region.children.length) throw new TypeError("Series accepts one scalar Encode and Label.")
        companions.add(region.localName)
        if (region instanceof ChartEncode) {
          attributes(region, ["x", "y", "item-name", "value", "tooltip"])
          item.encode = compact({ x: region.x, y: region.y, itemName: region.itemName, value: region.value, tooltip: region.tooltip })
        } else if (region instanceof ChartLabel) {
          attributes(region, ["show", "position"])
          const position = region.position
          if (position !== null && !["top", "bottom", "left", "right", "inside", "outside", "center"].includes(position)) throw new TypeError("Invalid chart label position.")
          item.label = compact({ show: region.show, position })
        } else throw new TypeError("Unknown chart series child.")
      }
      series.push(item)
    } else if (child instanceof ChartTitle) {
      attributes(child, ["text", "subtext"])
      option.title = { text: child.text, subtext: child.subtext }
    } else if (child instanceof ChartTooltip) {
      attributes(child, ["trigger", "show"])
      option.tooltip = { trigger: child.trigger, show: child.show, renderMode: "richText" }
    } else if (child instanceof ChartLegend) {
      attributes(child, ["show"])
      option.legend = { show: child.show, top: 40 }
    } else if (child instanceof ChartXAxis || child instanceof ChartYAxis) {
      attributes(child, ["type", "name"])
      option[child instanceof ChartXAxis ? "xAxis" : "yAxis"] = compact({ type: child.type, name: child.name })
    } else throw new TypeError(`Unsupported chart child ${child.localName}.`)
  }
  for (const descendant of host.querySelectorAll("m-chart-dataset,m-chart-series,m-chart-title,m-chart-tooltip,m-chart-legend,m-chart-x-axis,m-chart-y-axis")) {
    if (descendant.closest("m-chart") === host && descendant.parentElement !== host) throw new TypeError("Chart configuration must be directly owned by Chart.")
  }
  if (datasets.length > 16 || series.length > 32) throw new RangeError("Chart supports up to 16 datasets and 32 series.")
  if (!datasets.length || !series.length) throw new TypeError("Declarative Chart requires a dataset and series.")
  for (const item of series) {
    if (item.datasetId !== undefined && !datasetIds.has(String(item.datasetId))) throw new TypeError("Unknown series dataset-id.")
    if (item.type !== "pie" && (!option.xAxis || !option.yAxis)) throw new TypeError("Cartesian series require x-axis and y-axis.")
  }
  return { option: { ...option, dataset: datasets, series }, tables, loading }
}

export function directTable(source: ChartSource): ChartTableData[] {
  return [{ name: "Chart data", ...chartTable(source, null, "auto") }]
}
