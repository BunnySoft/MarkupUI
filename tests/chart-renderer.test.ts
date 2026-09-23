// @vitest-environment node
import { describe, expect, it } from "vitest"
import "../src/components/chart/renderer.js"
import { init } from "echarts/core"

describe("actual optional ECharts renderer", () => {
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
