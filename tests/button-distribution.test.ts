import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { createContext, runInContext } from "node:vm"
import { describe, expect, it, vi } from "vitest"

describe("Button shared-core distribution", () => {
  it("requires classic core before registering only its own family", () => {
    const component = readFileSync("dist\\markup-ui-button.global.js", "utf8")
    const define = vi.fn()
    expect(() => runInContext(component, createContext({
      HTMLElement, customElements: { get: vi.fn(), define },
    }))).toThrow("Load compatible markup-ui-core.global.js")
    expect(define).not.toHaveBeenCalled()
    const entries = new Map<string, unknown>()
    const context = createContext({
      HTMLElement,
      customElements: {
        get: (name: string) => entries.get(name),
        define: (name: string, constructor: unknown) => { entries.set(name, constructor) },
      },
    })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    expect(entries.size).toBe(0)
    runInContext(component, context)
    expect([...entries.keys()]).toEqual(["m-button", "m-button-group"])
    expect(runInContext("MarkupUIButton.Button.prototype instanceof MarkupUICore.ViewElement", context)).toBe(true)
    expect(runInContext("MarkupUIButton.ButtonGroup.prototype instanceof MarkupUICore.ViewElement", context)).toBe(true)
    expect(runInContext("Object.keys(MarkupUIButton).sort().join(',')", context)).toBe("Button,ButtonGroup,registerButton")
    expect(runInContext("'meta' in MarkupUIButton.Button", context)).toBe(false)
    expect(component).not.toContain("__decorate")
    expect(() => runInContext(component, context)).toThrow()
  })

  it("externalizes ESM core and excludes other constructors from both component outputs", () => {
    expect(readFileSync("dist\\markup-ui-button.js", "utf8")).toContain("./markup-ui-core.js")
    for (const suffix of [".js", ".global.js"]) {
      const map = JSON.parse(readFileSync(`dist\\markup-ui-button${suffix}.map`, "utf8"))
      expect(map.sources.filter((source: string) => source.includes("/src/"))
        .every((source: string) => source.includes("/src/components/button/"))).toBe(true)
    }
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./button"]).toEqual({
      types: "./dist/components/button/index.d.ts", import: "./dist/markup-ui-button.js",
    })
  })

  it.each([["esm", ".js"], ["classic", ".global.js"]])("accounts for the %s core and Button against approved ceilings", (mode, suffix) => {
    const file = `markup-ui-button${suffix}`
    const core = `markup-ui-core${suffix}`
    const measure = (name: string) => gzipSync(readFileSync(`dist\\${name}`), { level: 9 }).length
    const runtime = measure(core) + measure(file)
    expect.soft(measure(core)).toBeLessThanOrEqual(4000)
    expect.soft(measure(file)).toBeLessThanOrEqual(6000)
    expect.soft(runtime).toBeLessThanOrEqual(9500)
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    expect(manifest.componentPayloads.button[mode!]).toMatchObject({
      file, dependencies: [core], runtimeGzipBytes: runtime, runtimeBudget: 9500,
      totalGzipBytes: runtime + measure("markup-ui-button.css"),
    })
  })
})

describe("Button CSS distribution", () => {
  it("ships the whitespace-only transform and accounts for its actual payload", () => {
    const expected = execFileSync(process.execPath, ["-e", `
      const fs = require("node:fs"), { transformSync } = require("esbuild");
      process.stdout.write(transformSync(fs.readFileSync("src/components/button/button.css", "utf8"), {
        loader: "css", minifyWhitespace: true, minifySyntax: false, legalComments: "none"
      }).code);
    `], { encoding: "utf8" })
    const actual = readFileSync("dist/markup-ui-button.css")
    const gzipBytes = gzipSync(actual, { level: 9 }).length
    expect(actual.toString()).toBe(expected)
    expect(gzipBytes).toBeLessThanOrEqual(2500)
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    expect(manifest.bundles["markup-ui-button.css"]).toEqual({
      bytes: actual.length, gzipBytes, budget: 2500,
    })
  })

  it("does not normalize unrelated standalone CSS", () => {
    expect(readFileSync("dist/markup-ui-avatar.css", "utf8"))
      .toBe(readFileSync("src/components/avatar/avatar.css", "utf8"))
  })
})
