import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { createContext, runInContext } from "node:vm"
import { describe, expect, it } from "vitest"

const read = (file: string) => readFileSync(resolve("dist", file), "utf8")

describe("Chart selected delivery", () => {
  it("loads ESM with one core and without the root facade or state binder", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import { JSDOM } from "jsdom";
      const { window } = new JSDOM("<!doctype html>", { url: "http://localhost/" });
      for (const key of ["window", "document", "HTMLElement", "customElements", "CustomEvent", "MutationObserver"]) {
        globalThis[key] = key === "window" ? window : window[key];
      }
      const core = await import("./dist/markup-ui-core.js");
      assert.equal(customElements.get("m-chart"), undefined);
      const chart = await import("./dist/markup-ui-chart.js");
      assert.ok(chart.Chart.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-chart"), chart.Chart);
      assert.equal(customElements.get("m-app"), undefined);
      assert.equal(customElements.get("m-button"), undefined);
      const adapter = await import("./dist/markup-ui-chart-renderer.js");
      assert.equal(chart.configureChartEngine, adapter.configureChartEngine);
      assert.throws(() => adapter.createChartRenderer(document.createElement("div"), "light", "svg"), /configureChartEngine/);
      const instance = {};
      chart.configureChartEngine({ init: () => instance });
      assert.equal(adapter.createChartRenderer(document.createElement("div"), "light", "svg"), instance);
      window.close();
      console.log("passed");
    `], { encoding: "utf8" })
    expect(output.trim()).toBe("passed")
    expect(read("markup-ui-chart.js")).toContain("./markup-ui-chart-renderer.js")
    expect(read("markup-ui-chart.js")).not.toContain("./markup-ui-state.js")
  })

  it("requires core and renderer for classic loading before registering", () => {
    const entries = new Map<string, unknown>()
    const context = createContext({
      HTMLElement, document, MutationObserver,
      customElements: { get: (tag: string) => entries.get(tag), define: (tag: string, ctor: unknown) => entries.set(tag, ctor) },
    })
    const chart = read("markup-ui-chart.global.js")
    expect(() => runInContext(chart, context)).toThrow("markup-ui-core.global.js")
    runInContext(read("markup-ui-core.global.js"), context)
    expect(() => runInContext(chart, context)).toThrow("markup-ui-chart-renderer.global.js")
    expect(entries.size).toBe(0)
    runInContext(read("markup-ui-chart-renderer.global.js"), context)
    runInContext(chart, context)
    expect(entries.size).toBe(10)
    expect(runInContext("MarkupUIChart.Chart.prototype instanceof MarkupUICore.ViewElement", context)).toBe(true)
    expect(entries.has("m-button")).toBe(false)
    expect(runInContext("MarkupUIChart.configureChartEngine === MarkupUIChartRenderer.configureChartEngine", context)).toBe(true)
    expect(() => runInContext('MarkupUIChartRenderer.createChartRenderer({}, "light", "svg")', context)).toThrow("configureChartEngine")
    expect(runInContext(`(() => {
      const instance = {};
      MarkupUIChart.configureChartEngine({ init: () => instance });
      return MarkupUIChartRenderer.createChartRenderer({}, "dark", "canvas") === instance;
    })()`, context)).toBe(true)
  })

  it("keeps vendor code out of every shipped browser bundle and records external costs", () => {
    for (const file of readdirSync("dist").filter(file => file.endsWith(".js.map"))) {
      const map = JSON.parse(read(file))
      expect(map.sources.some((source: string) => /node_modules\/.*(?:echarts|zrender)/.test(source))).toBe(false)
    }
    expect(existsSync("dist/chart-licenses")).toBe(false)
    expect(read("components/chart/renderer.d.ts")).not.toMatch(/from ["']echarts/)
    const manifest = JSON.parse(read("manifest.json"))
    expect(manifest.componentPayloads.chart.esm.dependencies).toEqual(["markup-ui-core.js", "markup-ui-chart-renderer.js"])
    expect(manifest.componentPayloads.chart.classic.dependencies).toEqual(["markup-ui-core.global.js", "markup-ui-chart-renderer.global.js"])
    expect(manifest.componentPayloads.chart.externalDependencies).toEqual([{
      name: "echarts", suppliedBy: "application", includedInPayloadBytes: false,
      configuration: "configureChartEngine", testedVersion: "6.1.0",
    }])
    for (const suffix of [".js", ".global.js"]) {
      expect(manifest.bundles[`markup-ui-chart-renderer${suffix}`].gzipBytes).toBeLessThan(1000)
    }
  })
})
