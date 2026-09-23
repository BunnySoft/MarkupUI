import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync } from "node:fs"
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
  })

  it("keeps vendor code out of core, wrapper and unrelated components and ships licenses", () => {
    for (const entry of ["core", "button", "chart"]) {
      const map = JSON.parse(read(`markup-ui-${entry}.js.map`))
      expect(map.sources.some((source: string) => /node_modules\/.*(?:echarts|zrender)/.test(source))).toBe(false)
    }
    const map = JSON.parse(read("markup-ui-chart-renderer.js.map"))
    expect(map.sources.some((source: string) => source.includes("echarts"))).toBe(true)
    expect(readdirSync(resolve("dist/chart-licenses")).sort()).toEqual([
      "echarts-LICENSE", "echarts-NOTICE", "tslib-CopyrightNotice.txt", "tslib-LICENSE.txt", "zrender-LICENSE",
    ])
    const manifest = JSON.parse(read("manifest.json"))
    expect(manifest.componentPayloads.chart.esm.dependencies).toEqual(["markup-ui-core.js", "markup-ui-chart-renderer.js"])
    expect(manifest.componentPayloads.chart.classic.dependencies).toEqual(["markup-ui-core.global.js", "markup-ui-chart-renderer.global.js"])
  })
})
