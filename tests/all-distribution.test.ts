// @vitest-environment node
import { checkSizeRecommendation } from "../scripts/size-policy.mjs"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { createContext, runInContext } from "node:vm"
import { gzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"

const read = (name: string) => readFileSync(`dist/${name}`, "utf8")
const manifest = JSON.parse(read("manifest.json"))
const families: string[] = Object.keys(manifest.componentPayloads).filter(name => manifest.componentPayloads[name].esm).sort()
const namespace = (name: string) => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
function realm() {
  const registry = new Map<string, unknown>()
  const context = createContext({ HTMLElement: class {}, customElements: {
    get: (tag: string) => registry.get(tag),
    define: (tag: string, constructor: unknown) => { if (registry.has(tag)) throw new Error("Duplicate tag"); registry.set(tag, constructor) },
  } })
  const load = (name: string) => runInContext(read(`markup-ui-${name}.global.js`), context)
  return { registry, context, load }
}

describe("optional all-components delivery", () => {
  it("keeps both full closures, CSS and application-owned engines explicit", () => {
    expect(families).toHaveLength(89)
    for (const [key, suffix] of [["all", ".js"], ["all-classic", ".global.js"]]) {
      const payload = manifest.entryPayloads[key!]
      expect(payload.families).toEqual(families)
      expect(payload.tags.every((tag: unknown) => typeof tag === "string" && tag.startsWith("m-"))).toBe(true)
      expect(payload.dependencies).toEqual([`markup-ui-core${suffix}`, `markup-ui-chart-renderer${suffix}`])
      const total = [payload.file, ...payload.dependencies].reduce((sum: number, file: string) => sum + gzipSync(read(file), { level: 9 }).length, 0)
      expect(payload.runtimeGzipBytes).toBe(total)
      checkSizeRecommendation(total, payload.runtimeBudget, "all-distribution.test.ts: total")
      expect(payload.externalDependencies).toEqual(manifest.componentPayloads.chart.externalDependencies)
      const map = JSON.parse(read(`${payload.file}.map`))
      expect(map.sources.some((source: string) => /node_modules|core\/view-element|chart\/renderer/.test(source))).toBe(false)
      expect(map.sources).toContain("../src/components/native-select.ts")
      expect(map.sources).toContain("../src/components/dynamic-input/dynamic-input.ts")
      expect(new Set(map.sources).size).toBe(map.sources.length)
    }
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./all"]).toEqual({ types: "./dist/all.d.ts", import: "./dist/markup-ui-all.js" })
    expect(pkg.exports["./all/style.css"]).toBe("./dist/markup-ui-all.css")
    expect(read("all.d.ts").match(/export \* as /g)).toHaveLength(89)
  })

  it("preflights dependencies and registers every classic class with the shared base", () => {
    const { registry, context, load } = realm()
    expect(() => load("all")).toThrow("Load core and chart-renderer")
    expect(registry.size).toBe(0)
    load("core")
    expect(() => load("all")).toThrow("chart-renderer")
    expect(registry.size).toBe(0)
    load("chart-renderer"); load("all")
    expect([...registry.keys()].sort()).toEqual(manifest.entryPayloads.all.tags)
    expect(runInContext("Object.keys(MarkupUIAll).sort()", context)).toEqual(families.map(namespace).sort())
    expect(runInContext("Object.values(MarkupUIAll).flatMap(Object.values).filter(value=>typeof value==='function'&&Object.hasOwn(value,'tag')).every(type=>type.prototype instanceof MarkupUICore.ViewElement)", context)).toBe(true)
    expect(runInContext("MarkupUIAll.chart.configureChartEngine === MarkupUIChartRenderer.configureChartEngine", context)).toBe(true)
    expect(() => load("all")).toThrow("cannot mix")
  })

  it.each(families)("rejects classic mixing in either order for %s without partial registration", family => {
    const selected = realm()
    selected.load("core"); selected.load("chart-renderer")
    for (const dependency of manifest.componentPayloads[family].classic.dependencies) {
      if (!["markup-ui-core.global.js", "markup-ui-chart-renderer.global.js"].includes(dependency)) {
        runInContext(read(dependency), selected.context)
      }
    }
    selected.load(family)
    const before = [...selected.registry]
    expect(() => selected.load("all")).toThrow("cannot mix")
    expect([...selected.registry]).toEqual(before)
    const aggregate = realm()
    aggregate.load("core"); aggregate.load("chart-renderer"); aggregate.load("all")
    for (const dependency of manifest.componentPayloads[family].classic.dependencies) {
      if (!["markup-ui-core.global.js", "markup-ui-chart-renderer.global.js"].includes(dependency)) runInContext(read(dependency), aggregate.context)
    }
    expect(() => aggregate.load(family)).toThrow(/different implementation|already defined/)
    expect([...aggregate.registry.keys()].sort()).toEqual(manifest.entryPayloads.all.tags)
  })

  it.each(["all-first", "selected-first"])("preserves ESM identity and rejects %s mixing", order => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";import {JSDOM} from "jsdom";
      const {window}=new JSDOM("<!doctype html>",{url:"http://localhost/"});
      for(const key of ["window","document","HTMLElement","customElements","CustomEvent","MutationObserver"])globalThis[key]=key==="window"?window:window[key];
      const core=await import("./dist/markup-ui-core.js");
      if(${JSON.stringify(order)}==="selected-first"){
        const grid=await import("./dist/markup-ui-grid.js");
        await assert.rejects(import("./dist/markup-ui-all.js"),/cannot mix/);
        assert.equal(customElements.get("m-grid"),grid.Grid);assert.equal(customElements.get("m-button"),undefined);
      }else{
        const all=await import("./dist/markup-ui-all.js");
        const renderer=await import("./dist/markup-ui-chart-renderer.js");
        assert.equal(Object.keys(all).length,89);assert.equal(all.chart.configureChartEngine,renderer.configureChartEngine);
        assert.ok(all.button.Button.prototype instanceof core.ViewElement);
        const root=await import("./dist/markup-ui.js");assert.equal(root.ViewElement,core.ViewElement);
        assert.equal(customElements.get("m-data-table"),all.dataTable.DataTable);
        assert.equal(await import("./dist/markup-ui-all.js"),all);
        await assert.rejects(import("./dist/markup-ui-grid.js"),/different implementation|already defined/);
      }
      window.close();console.log("passed");
    `], { encoding: "utf8", timeout: 20_000 })
    expect(output.trim()).toBe("passed")
  })
})
