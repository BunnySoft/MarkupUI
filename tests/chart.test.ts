import { afterEach, describe, expect, it, vi } from "vitest"
const renderer = vi.hoisted(() => ({
  instances: [] as Array<{ setOption: ReturnType<typeof vi.fn>; resize: ReturnType<typeof vi.fn>; dispose: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn> }>,
  create: vi.fn(),
}))
vi.mock("../src/components/chart/renderer.js", () => ({
  configureChartEngine: vi.fn(),
  createChartRenderer: (...args: unknown[]) => {
    renderer.create(...args)
    const instance = { setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn(), on: vi.fn() }
    renderer.instances.push(instance)
    return instance
  },
}))
import { Chart, ChartDataset, ChartSeries } from "../src/components/chart/index.js"
import { chartConfiguration } from "../src/components/chart/options.js"

const markup = `<m-chart-title text="Sales"></m-chart-title><m-chart-tooltip trigger="axis"></m-chart-tooltip>
  <m-chart-legend></m-chart-legend>
  <m-chart-dataset id="sales" source='[{"month":"January","sales":120},{"month":"February","sales":180}]'></m-chart-dataset>
  <m-chart-x-axis type="category"></m-chart-x-axis><m-chart-y-axis type="value"></m-chart-y-axis>
  <m-chart-series type="bar" name="Sales" dataset-id="sales"><m-chart-encode x="month" y="sales"></m-chart-encode><m-chart-label show position="top"></m-chart-label></m-chart-series>`
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
function chart(visible = true): Chart {
  const host = new Chart()
  host.setAttribute("aria-label", "Monthly sales")
  host.innerHTML = markup
  Object.defineProperty(host.native, "clientWidth", { configurable: true, value: visible ? 640 : 0 })
  Object.defineProperty(host.native, "clientHeight", { configurable: true, value: 320 })
  document.body.append(host)
  return host
}
afterEach(() => { document.body.replaceChildren(); renderer.instances.length = 0; renderer.create.mockClear(); vi.unstubAllGlobals() })

describe("Chart ECharts-shaped configuration", () => {
  it("maps title, tooltip, legend, dataset, axes, series, encode and label explicitly", () => {
    const host = chart()
    expect(chartConfiguration(host).option).toMatchObject({
      title: { text: "Sales" }, tooltip: { trigger: "axis", renderMode: "richText" }, legend: { show: true },
      dataset: [{ id: "sales", source: [{ month: "January", sales: 120 }, { month: "February", sales: 180 }] }],
      xAxis: { type: "category" }, yAxis: { type: "value" },
      series: [{ type: "bar", name: "Sales", datasetId: "sales", encode: { x: "month", y: "sales" }, label: { show: true, position: "top" } }],
    })
  })

  it.each(["bar", "line", "pie", "scatter"] as const)("maps first-batch %s series and validates variants", type => {
    const host = chart()
    const series = host.querySelector<ChartSeries>("m-chart-series")!
    series.type = type
    if (type === "line") { series.areaStyle = {}; series.smooth = true }
    if (type === "bar") series.stack = "total"
    if (type === "pie") series.radius = ["40%", "70%"]
    expect((chartConfiguration(host).option.series as Array<{ type: string }>)[0]!.type).toBe(type)
    expect(() => { series.type = "gauge" as never }).toThrow()
  })

  it("rejects unsupported options and invalid companion cardinalities instead of ignoring them", () => {
    const host = chart()
    const series = host.querySelector("m-chart-series")!
    series.setAttribute("formatter", "alert(1)")
    expect(() => chartConfiguration(host)).toThrow("Unsupported")
    series.removeAttribute("formatter")
    series.append(series.firstElementChild!.cloneNode(true))
    expect(() => chartConfiguration(host)).toThrow("one scalar")
  })

  it("isolates nested charts and rejects indirectly owned configuration", () => {
    const outer = chart(), inner = chart()
    outer.append(inner)
    expect((chartConfiguration(outer).option.series as unknown[])).toHaveLength(1)
    const wrapper = document.createElement("m-box")
    wrapper.append(outer.querySelector("m-chart-series")!)
    outer.append(wrapper)
    expect(() => chartConfiguration(outer)).toThrow("directly")
  })
})

describe("Chart renderer lifecycle and fallback", () => {
  it("ignores interaction callbacks from disposed or replaced renderers", async () => {
    const host = chart(), selected = vi.fn()
    host.addEventListener("m:chart-select", selected)
    await flush()
    const oldClick = renderer.instances[0]!.on.mock.calls.find(call => call[0] === "click")![1]
    host.remove()
    oldClick({ dataIndex: 0 })
    expect(selected).not.toHaveBeenCalled()
    document.body.append(host)
    await flush()
    oldClick({ dataIndex: 0 })
    expect(selected).not.toHaveBeenCalled()
    renderer.instances.at(-1)!.on.mock.calls.find(call => call[0] === "click")![1]({ dataIndex: 1 })
    expect(selected).toHaveBeenCalledOnce()
  })

  it("replays pre-upgrade direct configuration before rendering", async () => {
    const host = document.createElement("m-late-chart") as Chart
    host.option = { series: [{ type: "pie", data: [{ name: "A", value: 1 }] }] }
    host.tableSource = [{ name: "A", value: 1 }]
    host.theme = "dark"
    host.setAttribute("aria-label", "Late chart")
    document.body.append(host)
    customElements.define("m-late-chart", class extends Chart {})
    Object.defineProperty(host.native, "clientWidth", { value: 600 })
    Object.defineProperty(host.native, "clientHeight", { value: 320 })
    await flush()
    expect(host.state).toBe("ready")
    expect(Object.hasOwn(host, "option")).toBe(false)
    expect(renderer.create).toHaveBeenCalledWith(host.native, "dark", "svg")
  })

  it("releases resize observation and overrides trusted animation for reduced motion", async () => {
    const disconnect = vi.fn(), observe = vi.fn()
    vi.stubGlobal("ResizeObserver", class { observe = observe; disconnect = disconnect })
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })))
    const host = new Chart()
    host.setAttribute("aria-label", "Motion")
    host.option = { animation: true, series: [{ type: "pie", data: [1] }] }
    host.tableSource = [[1]]
    Object.defineProperty(host.native, "clientWidth", { value: 600 })
    Object.defineProperty(host.native, "clientHeight", { value: 320 })
    document.body.append(host)
    await flush()
    expect(observe).toHaveBeenCalledWith(host.native)
    expect(renderer.instances[0]!.setOption.mock.lastCall![0].animation).toBe(false)
    host.remove()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(renderer.instances[0]!.dispose).toHaveBeenCalledOnce()
  })

  it("emits selection only for renderer interaction with declared flags", async () => {
    const host = chart(), listener = vi.fn()
    host.addEventListener("m:chart-select", listener)
    await flush()
    expect(listener).not.toHaveBeenCalled()
    const click = renderer.instances[0]!.on.mock.calls.find(call => call[0] === "click")![1]
    click({ seriesIndex: 0, dataIndex: 1, name: "February", value: 180 })
    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0]![0]).toMatchObject({
      bubbles: true, cancelable: false, composed: false,
      detail: { seriesIndex: 0, dataIndex: 1, name: "February", value: 180 },
    })
  })

  it("rejects in-place invalid data on refresh and recovers after correction", async () => {
    const host = chart(), dataset = host.querySelector<ChartDataset>("m-chart-dataset")!
    dataset.clearSource()
    const rows = [[1, 2]]
    dataset.source = rows
    await flush()
    const instance = renderer.instances[0]!
    rows[0]![1] = Infinity
    dataset.refresh()
    await flush()
    expect(host.state).toBe("error")
    expect(instance.dispose).toHaveBeenCalledOnce()
    expect(host.querySelectorAll("tbody tr")).toHaveLength(0)
    rows[0]![1] = 3
    dataset.refresh()
    await flush()
    expect(host.state).toBe("ready")
  })

  it("initializes once, replaces options on removal, and preserves authored nodes and listeners", async () => {
    const host = chart(), dataset = host.querySelector<ChartDataset>("m-chart-dataset")!
    const listener = vi.fn()
    dataset.addEventListener("test", listener)
    await flush()
    expect(host.state).toBe("ready")
    expect(renderer.instances).toHaveLength(1)
    const instance = renderer.instances[0]!
    expect(instance.setOption).toHaveBeenLastCalledWith(expect.any(Object), { notMerge: true, lazyUpdate: false })
    const second = host.querySelector("m-chart-series")!.cloneNode(true)
    host.append(second)
    await flush()
    expect(instance.setOption.mock.lastCall![0].series).toHaveLength(2)
    second.remove()
    await flush()
    expect(instance.setOption.mock.lastCall![0].series).toHaveLength(1)
    expect(host.querySelector("m-chart-dataset")).toBe(dataset)
    dataset.dispatchEvent(new Event("test"))
    expect(listener).toHaveBeenCalledOnce()
  })

  it("waits for a usable size and recovers through resize", async () => {
    const host = chart(false)
    await flush()
    expect(host.state).toBe("waiting")
    expect(renderer.instances).toHaveLength(0)
    Object.defineProperty(host.native, "clientWidth", { value: 600 })
    host.resize()
    expect(host.state).toBe("ready")
    expect(renderer.instances).toHaveLength(1)
  })

  it("disposes on disconnect and theme changes, reconnects from current configuration", async () => {
    const host = chart()
    await flush()
    const first = renderer.instances[0]!
    host.theme = "dark"
    await flush()
    expect(first.dispose).toHaveBeenCalledOnce()
    const second = renderer.instances[1]!
    host.remove()
    expect(second.dispose).toHaveBeenCalledOnce()
    document.body.append(host)
    await flush()
    expect(renderer.instances).toHaveLength(3)
    expect(host.state).toBe("ready")
  })

  it("provides a literal paginated table, with empty/error states and required naming", async () => {
    const host = chart()
    const dataset = host.querySelector<ChartDataset>("m-chart-dataset")!
    dataset.clearSource()
    dataset.source = Array.from({ length: 125 }, (_, index) => ({ name: `<img ${index}>`, sales: index }))
    await flush()
    expect(host.querySelectorAll("tbody tr")).toHaveLength(50)
    expect(host.querySelector("tbody")!.textContent).toContain("<img 0>")
    expect(host.querySelector("img")).toBeNull()
    host.querySelector<HTMLButtonElement>('button[aria-label="Next data page"]')!.click()
    expect(host.querySelector("tbody")!.textContent).toContain("<img 50>")
    dataset.source = []
    await flush()
    expect(host.state).toBe("empty")
    host.removeAttribute("aria-label")
    await flush()
    expect(host.state).toBe("error")
    expect(host.error?.message).toContain("accessible name")
  })

  it("keeps direct option ownership exclusive and requires an accessible source", async () => {
    const host = chart()
    expect(() => { host.option = { series: [{ type: "bar" }] } }).toThrow("conflict")
    host.querySelectorAll(":scope > m-chart-title,:scope > m-chart-tooltip,:scope > m-chart-legend,:scope > m-chart-dataset,:scope > m-chart-x-axis,:scope > m-chart-y-axis,:scope > m-chart-series").forEach(node => node.remove())
    host.option = { series: [{ type: "pie", data: [1, 2] }] }
    await flush()
    expect(host.error?.message).toContain("tableSource")
    host.tableSource = [["A", 1], ["B", 2]]
    await flush()
    expect(host.state).toBe("ready")
    expect(() => { host.option = { series: [{ type: "gauge" }] } }).toThrow("first-batch")
  })
})
