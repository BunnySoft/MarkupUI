// @vitest-environment node
import { execFileSync } from "node:child_process"
import { copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { describe, expect, it, vi } from "vitest"
import { checkSizeRecommendation } from "../scripts/size-policy.mjs"
import {
  baselineSnapshot, compareBaseline, createReport, dependencyClosure,
  outputDependencies, repeatedSources, sumFiles,
} from "../scripts/size-report.mjs"

describe("size accounting primitives", () => {
  it("warns above recommendations without failing, and accepts equality", () => {
    const warn = vi.fn()
    expect(checkSizeRecommendation(101, 100, "example", warn)).toEqual({
      label: "example", gzipBytes: 101, budget: 100, excessBytes: 1,
    })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("recommended 100 (+1)"))
    expect(checkSizeRecommendation(100, 100, "example", warn)).toBeNull()
    expect(checkSizeRecommendation(0, 100, "empty", warn)).toBeNull()
    expect(warn).toHaveBeenCalledOnce()
  })

  it.each([[NaN, 1], [-1, 1], [1.5, 2], [1, 0], [1, -1], [1, Infinity], [1, undefined]])(
    "still rejects invalid measurement metadata: %s / %s", (actual, budget) => {
      expect(() => checkSizeRecommendation(actual, budget, "invalid")).toThrow("Invalid size")
    },
  )

  it("walks transitive dependencies once, in dependency-first order", () => {
    const graph = { a: ["core", "shared"], b: ["shared"], shared: ["core"], core: [] }
    expect(dependencyClosure(["a", "b", "a"], graph)).toEqual(["core", "shared", "a", "b"])
    expect(() => dependencyClosure(["missing"], graph)).toThrow("Missing dependency metadata")
    expect(() => dependencyClosure(["a"], { a: ["b"], b: ["a"] })).toThrow("Dependency cycle")
  })

  it("sums separately compressed files, not repeated references or a concatenated bundle", () => {
    const files = { a: { bytes: 100, gzipBytes: 40 }, b: { bytes: 200, gzipBytes: 70 } }
    expect(sumFiles(["b", "a", "a"], files)).toEqual({ files: ["a", "b"], bytes: 300, gzipBytes: 110 })
    expect(sumFiles([], files)).toEqual({ files: [], bytes: 0, gzipBytes: 0 })
    expect(() => sumFiles(["missing"], files)).toThrow("Missing measured file")
  })

  it("reads ESM imports and retained classic bridges without using source-map presence as a dependency", () => {
    const file = "dist/entry.js"
    const output = { imports: [{ path: "./shared.js", external: true }], inputs: {} }
    expect(outputDependencies(file, { format: "esm", metafile: { outputs: { [file]: output } } })).toEqual(["dist/shared.js"])
    const classic = { imports: [], inputs: { "markupui-core:core": {}, "src/components/avatar/avatar.ts": {} } }
    expect(outputDependencies(file, { format: "classic", metafile: { outputs: { [file]: classic } } }))
      .toEqual(["dist/markup-ui-core.global.js"])
    classic.inputs["markupui-unknown:unknown"] = {}
    expect(() => outputDependencies(file, { format: "classic", metafile: { outputs: { [file]: classic } } }))
      .toThrow("Unknown classic bridge")
    output.imports[0].path = "unaccounted-vendor"
    expect(() => outputDependencies(file, { format: "esm", metafile: { outputs: { [file]: output } } }))
      .toThrow("Unaccounted external import")
  })

  it("reports retained raw source contributions, not estimated gzip savings", () => {
    const builds = Object.fromEntries([["a", 80], ["b", 20], ["c", 0]].map(([file, bytes]) => [file, {
      metafile: { outputs: { [file]: { inputs: {
        "src/shared.ts": { bytesInOutput: bytes },
        "virtual:bridge": { bytesInOutput: 100 },
      } } } },
    }]))
    expect(repeatedSources(["a", "b", "c"], builds)).toEqual([{
      source: "src/shared.ts", copies: 2, bytes: 100, excessBytes: 20,
      outputs: [{ file: "a", bytes: 80 }, { file: "b", bytes: 20 }],
    }])
  })

  it("reports growth, removed files, export removals and changed recommendations", () => {
    const before = {
      schemaVersion: 1, measurement: "test", revision: "baseline",
      files: { a: { bytes: 100, gzipBytes: 50 }, removed: { bytes: 10, gzipBytes: 10 } },
      costs: { group: { files: ["a", "removed"], bytes: 110, gzipBytes: 60 } },
      exports: { a: ["Element", "createElement"] }, budgets: { a: 60, removed: 20 },
    }
    const after = {
      ...before, files: { a: { bytes: 120, gzipBytes: 55 } },
      costs: { group: { files: ["a"], bytes: 120, gzipBytes: 55 } },
      exports: { a: ["Element"] }, budgets: { a: 70 },
    }
    const result = compareBaseline(after, before)
    expect(result.changes.map(change => [change.key, change.bytes, change.gzipBytes]))
      .toEqual([["a", 20, 5], ["removed", -10, -10], ["group", 10, -5]])
    expect(result.exportChanges).toHaveLength(1)
    expect(result.budgetChanges).toEqual([{ key: "a", before: 60, after: 70 }, { key: "removed", before: 20, after: null }])
    expect(result.equivalence).toContain("diagnostic comparison only")
    expect(() => compareBaseline(after, { ...before, measurement: "different" })).toThrow("measurement definitions")
  })
})

describe("built distribution size evidence", () => {
  it("accounts for every selected file, size recommendations, and optional host dependencies", async () => {
    const report = await createReport(resolve("."))
    const baseline = JSON.parse(await readFile("docs/architecture/size-baseline.json", "utf8"))
    expect(report.families).toHaveLength(89)
    expect(report.budgetPolicy).toBe("advisory")
    expect(baseline.costs["esm:selection:all"].gzipBytes).toBe(414065)
    expect(baseline.costs["classic:selection:all"].gzipBytes).toBe(427555)
    for (const format of ["esm", "classic"]) {
      const all = report.costs[`${format}:selection:all`]
      expect(all.files).toHaveLength(94)
      expect(all.files.every(file => file.endsWith(".js") && !file.includes("vendor"))).toBe(true)
      let bytes = 0, gzipBytes = 0
      for (const file of all.files) {
        const content = await readFile(file)
        bytes += content.length
        gzipBytes += gzipSync(content, { level: 9 }).length
      }
      expect(all.bytes).toBe(bytes)
      expect(all.gzipBytes).toBe(gzipBytes)
      const related = report.costs[`${format}:selection:dynamic-collections`]
      expect(related.files).toHaveLength(3)
      expect(related.gzipBytes).toBeLessThan(
        report.costs[`${format}:dynamic-input:runtime`].gzipBytes + report.costs[`${format}:dynamic-tags:runtime`].gzipBytes,
      )
      expect(report.formats[format].repeatedSources.some(item => item.source === "src/components/popover/position.ts")).toBe(true)
      expect(report.formats[format].largestEntries[0].family).toBe("dropdown")
    }
    expect(report.hostDependencies["dist/markup-ui-widgets.js"]).toEqual(["dist/markup-ui.js"])
    expect(report.costs["optional:widgets:runtime"].files).toEqual([
      "dist/markup-ui-core.js", "dist/markup-ui-state.js", "dist/markup-ui-widgets.js", "dist/markup-ui.js",
    ])
    expect(report.externalEngines.chart[0]).toMatchObject({ name: "echarts", includedInPayloadBytes: false })
    expect(report.externalEngines.demo.esm.gzipBytes).toBeGreaterThan(100000)
    expect(report.costs["css:selection:all"].files.every(file => file.endsWith(".css"))).toBe(true)
    expect(report.files["dist/markup-ui.js"].minified).toBe(false)
    const comparison = compareBaseline(report, baselineSnapshot(report))
    expect(comparison.budgetChanges).toEqual([])
    expect(comparison.exportChanges).toEqual([])
    expect(comparison.changes).toEqual([])
    expect(baselineSnapshot(report)).not.toHaveProperty("formats")
  })

  it("rejects stale manifest and same-length changed output instead of reporting old metadata", async () => {
    const directory = await mkdtemp(resolve(tmpdir(), "markupui-size-test-"))
    try {
      await mkdir(resolve(directory, "dist"))
      await mkdir(resolve(directory, ".vite/size"), { recursive: true })
      const manifest = await readFile("dist/manifest.json")
      const evidence = JSON.parse(await readFile(".vite/size/build.json", "utf8"))
      await writeFile(resolve(directory, ".vite/size/build.json"), JSON.stringify(evidence))
      await writeFile(resolve(directory, "dist/manifest.json"), "{}")
      await expect(createReport(directory)).rejects.toThrow("Stale manifest evidence")
      await writeFile(resolve(directory, "dist/manifest.json"), manifest)
      const first = evidence.builds[0].file
      await mkdir(dirname(resolve(directory, first)), { recursive: true })
      const content = Buffer.from(await readFile(first))
      content[0] ^= 1
      await writeFile(resolve(directory, first), content)
      await expect(createReport(directory)).rejects.toThrow("Stale build evidence")
    } finally { await rm(directory, { recursive: true, force: true }) }
  })

  it("reports exceeded file, CSS, component and optional runtime recommendations without rejecting valid evidence", async () => {
    const directory = await mkdtemp(resolve(tmpdir(), "markupui-size-advisory-"))
    try {
      const report = await createReport(resolve("."))
      await Promise.all(Object.keys(report.files).map(async file => {
        await mkdir(dirname(resolve(directory, file)), { recursive: true })
        await copyFile(file, resolve(directory, file))
      }))
      const manifest = JSON.parse(await readFile("dist/manifest.json", "utf8"))
      manifest.bundles["markup-ui-grid.js"].budget = 1
      manifest.bundles["markup-ui-grid.css"].budget = 1
      manifest.componentPayloads.grid.esm.runtimeBudget = 1
      manifest.entryPayloads["root-classic"].runtimeBudget = 1
      const content = JSON.stringify(manifest)
      const evidence = JSON.parse(await readFile(".vite/size/build.json", "utf8"))
      evidence.manifestSha256 = createHash("sha256").update(content).digest("hex")
      await mkdir(resolve(directory, ".vite/size"), { recursive: true })
      await writeFile(resolve(directory, "dist/manifest.json"), content)
      await writeFile(resolve(directory, ".vite/size/build.json"), JSON.stringify(evidence))
      const result = await createReport(directory)
      const labels = ["file:dist/markup-ui-grid.js", "file:dist/markup-ui-grid.css", "esm:grid:runtime", "optional:root-classic:runtime"]
      expect(result.sizeWarnings.filter(warning => labels.includes(warning.label))).toHaveLength(4)
      expect(result.sizeWarnings.every(warning => warning.excessBytes === warning.gzipBytes - warning.budget)).toBe(true)
      expect(result.costs).toEqual(report.costs)
    } finally { await rm(directory, { recursive: true, force: true }) }
  }, 15_000)

  it("produces a deterministic report against an unchanged baseline", async () => {
    const directory = await mkdtemp(resolve(tmpdir(), "markupui-size-cli-"))
    try {
      const output = resolve(directory, "report.json")
      const baselinePath = resolve(directory, "baseline.json")
      const baseline = baselineSnapshot(await createReport(resolve(".")))
      await writeFile(baselinePath, JSON.stringify(baseline))
      const run = () => execFileSync(process.execPath, ["scripts/size-report.mjs", "--check-regressions",
        "--baseline", baselinePath, "--output", output], { encoding: "utf8", stdio: "pipe" })
      expect(run()).toContain("89 families, 94 JS files")
      const first = await readFile(output, "utf8")
      run()
      expect(await readFile(output, "utf8")).toBe(first)
    } finally { await rm(directory, { recursive: true, force: true }) }
  })

  it.each(["Payload regression", "Export surface changed"])(
    "rejects CLI baseline changes: %s", async message => {
      const directory = await mkdtemp(resolve(tmpdir(), "markupui-size-cli-"))
      try {
        const output = resolve(directory, "report.json"), baselinePath = resolve(directory, "baseline.json")
        const baseline = baselineSnapshot(await createReport(resolve(".")))
        const file = "dist/markup-ui-grid.js"
        if (message === "Payload regression") baseline.files[file].bytes--
        else baseline.exports[file].push("removedFactory")
        await writeFile(baselinePath, JSON.stringify(baseline))
        expect(execFileSync(process.execPath, ["scripts/size-report.mjs",
          "--baseline", baselinePath, "--output", output], { encoding: "utf8", stdio: "pipe" }))
          .toContain("Report:")
        expect(() => execFileSync(process.execPath, ["scripts/size-report.mjs", "--check-regressions",
          "--baseline", baselinePath, "--output", output], { encoding: "utf8", stdio: "pipe" })).toThrow(message)
      } finally { await rm(directory, { recursive: true, force: true }) }
    },
  )

  it("allows recommendation adjustments even in opt-in baseline checking", async () => {
    const directory = await mkdtemp(resolve(tmpdir(), "markupui-size-recommendations-"))
    try {
      const output = resolve(directory, "report.json"), baselinePath = resolve(directory, "baseline.json")
      const baseline = baselineSnapshot(await createReport(resolve(".")))
      baseline.budgets["file:dist/markup-ui-grid.js"] = 1
      baseline.budgets["file:dist/no-longer-shipped.js"] = 100
      await writeFile(baselinePath, JSON.stringify(baseline))
      const stdout = execFileSync(process.execPath, ["scripts/size-report.mjs", "--check-regressions",
        "--baseline", baselinePath, "--output", output], { encoding: "utf8", stdio: "pipe" })
      expect(stdout).toContain("2 changed since baseline (advisory)")
      const result = JSON.parse(await readFile(output, "utf8"))
      expect(result.comparison.budgetChanges).toHaveLength(2)
    } finally { await rm(directory, { recursive: true, force: true }) }
  })
})
