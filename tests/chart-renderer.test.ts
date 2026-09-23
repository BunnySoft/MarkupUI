// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { init } from "../demo/chart-engine.js"

describe("application-supplied ECharts renderer", () => {
  it("requires explicit setup, validates it and forwards instance creation", async () => {
    vi.resetModules()
    const { configureChartEngine, createChartRenderer } = await import("../src/components/chart/renderer.js")
    const element = {} as HTMLElement
    const instance = { setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn(), on: vi.fn() }
    const engine = { init: vi.fn(function (this: unknown) { expect(this).toBe(engine); return instance }) }
    vi.stubGlobal("echarts", engine)
    try {
      expect(() => createChartRenderer(element, "light", "svg")).toThrow("configureChartEngine")
      for (const invalid of [null, undefined, {}, { init: 1 }]) {
        expect(() => configureChartEngine(invalid as never)).toThrow("init()")
      }
      configureChartEngine(engine)
      expect(createChartRenderer(element, "dark", "canvas")).toBe(instance)
      expect(engine.init).toHaveBeenCalledWith(element, "dark", { renderer: "canvas" })
      expect(() => configureChartEngine({} as never)).toThrow()
      expect(createChartRenderer(element, "light", "svg")).toBe(instance)
    } finally { vi.unstubAllGlobals() }
  })

  it.each(["bar", "line", "pie", "scatter"])("renders nonempty %s geometry with the selected modules", type => {
    const renderer = init(null, null, { renderer: "svg", ssr: true, width: 640, height: 360 })
    try {
      renderer.setOption({
        animation: false,
        dataset: { source: [["month", "sales"], ["January", 120], ["February", 180]] },
        ...(type === "pie" ? {} : { xAxis: { type: "category" }, yAxis: { type: "value" } }),
        series: [{ type, ...(type === "pie" ? { encode: { itemName: "month", value: "sales" }, radius: ["35%", "70%"] } : { encode: { x: "month", y: "sales" } }), ...(type === "line" ? { areaStyle: {} } : {}) }],
      })
      const svg = renderer.renderToSVGString()
      expect(svg).toContain("<svg")
      expect(svg).toContain("<path")
      expect(svg.length).toBeGreaterThan(1000)
      expect(svg).not.toMatch(/\bNaN\b|\bInfinity\b/)
    } finally { renderer.dispose() }
    expect(renderer.isDisposed()).toBe(true)
  })
})
