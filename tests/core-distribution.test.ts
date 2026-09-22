import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { createContext, runInContext } from "node:vm"
import { gzipSync } from "node:zlib"
import { describe, expect, it, vi } from "vitest"
import { m } from "../src/index.js"
import { ViewElement } from "../src/core/index.js"
import { advancedPlugin } from "../src/plugins/advanced.js"
import { widgetsPlugin } from "../src/plugins/widgets.js"

const read = (name: string) => readFileSync(resolve("dist", name), "utf8")

describe("root shared-core distribution", () => {
  it.each(["markup-ui.js", "markup-ui.min.js"])("shares served ESM identity through %s", file => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import { JSDOM } from "jsdom";
      const { window } = new JSDOM("<!doctype html>", { url: "http://localhost/" });
      for (const name of ["window", "document", "HTMLElement", "customElements", "CustomEvent", "MutationObserver"]) {
        globalThis[name] = name === "window" ? window : window[name];
      }
      const core = await import("./dist/markup-ui-core.js");
      const root = await import("./dist/${file}");
      const button = await import("./dist/markup-ui-button.js");
      assert.equal(root.ViewElement, core.ViewElement);
      assert.equal(root.m.elements.Base, core.ViewElement);
      assert.equal("MElement" in root, false);
      assert.ok(button.Button.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-button"), button.Button);
      class Extension extends root.m.elements.Base { static tag = "m-distribution-extension"; }
      root.registerElement(Extension.tag, Extension);
      core.ViewElement.register([Extension]);
      assert.equal(customElements.get(Extension.tag), Extension);
      assert.equal(customElements.get("m-select"), undefined);
      const { advancedPlugin } = await import("./dist/markup-ui-advanced.js");
      const { widgetsPlugin } = await import("./dist/markup-ui-widgets.js");
      advancedPlugin.install(root.m);
      widgetsPlugin.install(root.m);
      for (const [family, name] of [
        ["date-picker", "DatePicker"], ["time-picker", "TimePicker"], ["upload", "Upload"],
        ["breadcrumb", "Breadcrumb"], ["timeline", "Timeline"], ["color-picker", "ColorPicker"],
        ["transfer", "Transfer"], ["cascader", "Cascader"], ["virtual-list", "VirtualList"],
      ]) {
        assert.equal(customElements.get("m-" + family), undefined);
        const component = await import("./dist/markup-ui-" + family + ".js");
        assert.equal(customElements.get("m-" + family), component[name]);
        assert.ok(component[name].prototype instanceof core.ViewElement);
      }
      window.close();
      console.log("shared");
    `], { cwd: resolve("."), encoding: "utf8" })
    expect(output.trim()).toBe("shared")
    expect(read(file)).toContain("./markup-ui-core.js")
    const map = JSON.parse(read(`${file}.map`))
    expect(map.sources.some((source: string) => /core\/view-element\.ts$/.test(source))).toBe(false)
  })

  it.each(["root-first", "component-first"])("shares classic identity with %s", order => {
    const entries = new Map<string, CustomElementConstructor>()
    const define = vi.fn((name: string, constructor: CustomElementConstructor) => entries.set(name, constructor))
    const context = createContext({
      HTMLElement, document,
      customElements: { get: (name: string) => entries.get(name), define },
    })
    context.window = context
    expect(() => runInContext(read("markup-ui.global.js"), context)).toThrow("Load compatible markup-ui-core.global.js")
    expect(define).not.toHaveBeenCalled()
    runInContext(read("markup-ui-core.global.js"), context)
    const scripts = ["markup-ui.global.js", "markup-ui-button.global.js"]
    if (order === "component-first") scripts.reverse()
    for (const script of scripts) runInContext(read(script), context)
    expect(runInContext("m.elements.Base === MarkupUICore.ViewElement", context)).toBe(true)
    expect(runInContext("MarkupUIButton.Button.prototype instanceof m.elements.Base", context)).toBe(true)
    expect(entries.has("m-select")).toBe(false)
    expect(() => runInContext(read("markup-ui.global.js"), context)).toThrow("different implementation")
    const map = JSON.parse(read("markup-ui.global.js.map"))
    expect(map.sources.some((source: string) => /core\/view-element\.ts$/.test(source))).toBe(false)
  })

  it("accounts for every root/plugin dependency and selected stylesheet", () => {
    const manifest = JSON.parse(read("manifest.json"))
    const measure = (file: string) => gzipSync(readFileSync(resolve("dist", file)), { level: 9 }).length
    expect(manifest.entryPayloads.root.dependencies).toEqual(["markup-ui-core.js"])
    expect(manifest.entryPayloads["root-classic"].dependencies).toEqual(["markup-ui-core.global.js"])
    for (const payload of Object.values(manifest.entryPayloads) as Array<{
      file: string; dependencies: string[]; runtimeGzipBytes: number; runtimeBudget?: number; css: string[]; totalGzipBytes: number
    }>) {
      const runtime = [payload.file, ...payload.dependencies].reduce((total, file) => total + measure(file), 0)
      expect(payload.runtimeGzipBytes).toBe(runtime)
      expect(payload.totalGzipBytes).toBe(runtime + payload.css.reduce((total, file) => total + measure(file), 0))
      if (payload.runtimeBudget !== undefined) expect(runtime).toBeLessThanOrEqual(payload.runtimeBudget)
    }
    for (const name of ["advanced", "widgets"]) {
      expect(manifest.entryPayloads[name].dependencies).toEqual(["markup-ui.js", "markup-ui-core.js"])
      const map = JSON.parse(read(`markup-ui-${name}.js.map`))
      expect(map.sources.every((source: string) => !source.includes("/components/") && !source.includes("/core/"))).toBe(true)
    }
  })

  it("ships no replaced base or orphaned competing component modules", () => {
    for (const path of ["core/element", "components/content", "components/forms", "components/navigation", "components/overlays"]) {
      expect(existsSync(resolve("src", `${path}.ts`))).toBe(false)
      expect(existsSync(resolve("dist", `${path}.js`))).toBe(false)
      expect(existsSync(resolve("dist", `${path}.d.ts`))).toBe(false)
    }
    for (const path of readdirSync(resolve("src"), { recursive: true }).map(String).filter(path => path.endsWith(".ts"))) {
      expect(readFileSync(resolve("src", path), "utf8")).not.toMatch(/\bMElement\b/)
    }
  })

  it("enforces exact dependency-inclusive budgets for every component in both formats", () => {
    const manifest = JSON.parse(read("manifest.json"))
    const measure = (file: string) => gzipSync(readFileSync(resolve("dist", file)), { level: 9 }).length
    for (const [name, payload] of Object.entries(manifest.componentPayloads) as Array<[string, {
      css: string
      esm?: { file: string; dependencies: string[]; runtimeGzipBytes: number; runtimeBudget: number; totalGzipBytes: number }
      classic?: { file: string; dependencies: string[]; runtimeGzipBytes: number; runtimeBudget: number; totalGzipBytes: number }
    }]>) {
      for (const mode of ["esm", "classic"] as const) {
        const entry = payload[mode]
        if (!entry) continue
        const runtime = [entry.file, ...entry.dependencies].reduce((total, file) => total + measure(file), 0)
        expect(entry.runtimeGzipBytes, `${name} ${mode}`).toBe(runtime)
        expect(entry.totalGzipBytes, `${name} ${mode}`).toBe(runtime + measure(payload.css))
        if (entry.dependencies.length) expect(runtime, `${name} ${mode}`).toBeLessThanOrEqual(entry.runtimeBudget)
      }
    }
  })
})

describe("optional plugin registration boundaries", () => {
  it.each([
    [advancedPlugin, ["m-data-column", "m-data-grid"], "m-advanced-styles"],
    [widgetsPlugin, ["m-rating"], "m-widgets-styles"],
  ] as const)("registers only retained tags for $0.name and preflights conflicts", (plugin, names, styleId) => {
    const entries = new Map<string, CustomElementConstructor>()
    const registry = { get: (name: string) => entries.get(name), define: (name: string, constructor: CustomElementConstructor) => { entries.set(name, constructor) } }
    class PluginBase extends ViewElement {
      public static override register(elements: Parameters<typeof ViewElement.register>[0]): void {
        ViewElement.register(elements, registry)
      }
    }
    const api = { ...m, elements: { ...m.elements, Base: PluginBase } } as typeof m
    plugin.install(api)
    expect([...entries.keys()]).toEqual(names)
    for (const constructor of entries.values()) expect(constructor.prototype).toBeInstanceOf(ViewElement)
    document.getElementById(styleId)?.remove()
    entries.clear()
    entries.set(names.at(-1)!, class extends HTMLElement {})
    expect(() => plugin.install(api)).toThrow("different implementation")
    expect([...entries.keys()]).toEqual([names.at(-1)])
    expect(document.getElementById(styleId)).toBeNull()
  })
})
