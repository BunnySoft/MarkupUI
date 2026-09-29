import assert from "node:assert/strict"
import { readFile, mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { build } from "esbuild"
import ts from "typescript"
import { createReport } from "./size-report.mjs"
import { corePlugin } from "./build-boundaries.mjs"

// Diagnostic builds only. No source, distribution, budgets or baseline are changed.
const root = resolve(".")
const report = await createReport(root)
const evidence = JSON.parse(await readFile(".vite/size/build.json", "utf8"))
const manifest = JSON.parse(await readFile("dist/manifest.json", "utf8"))
const candidates = [
  ["owned-writes", "src/components/popover/position.ts"],
  ["popover-position", "src/components/popover/position.ts"],
  ["popover-controller", "src/components/popover/popover.ts"],
  ["hierarchy", "src/components/tree/hierarchy.ts"],
  ["dialog-native", "src/components/dialog/native.ts"],
  ["dynamic-collection", "src/components/dynamic-input/dynamic-input.ts"],
]
const bytes = text => ({ bytes: Buffer.byteLength(text), gzipBytes: gzipSync(text, { level: 9 }).length })
const javascript = result => result.outputFiles.find(file => file.path.endsWith(".js")).text
const results = []
for (const [name, source] of candidates) {
  const content = await readFile(source, "utf8")
  const ast = ts.createSourceFile(source, content, ts.ScriptTarget.Latest, true)
  const owned = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === "ownedWrites")
  const extracted = name === "owned-writes" ? content.slice(owned.getStart(ast), owned.end) : null
  for (const format of ["esm", "classic"]) {
    const suffix = format === "esm" ? ".js" : ".global.js"
    const sharedFile = `markup-ui-experiment-${name}${suffix}`
    let sharedExports = []
    const plugin = extracting => ({
      name: "explicit-sharing-experiment",
      setup(builder) {
        builder.onResolve({ filter: /.*/ }, args => {
          const target = resolve(dirname(args.importer || resolve(root, source)), args.path)
          const candidate = !extracting && (name === "owned-writes" ? args.path === "s4-owned-writes"
            : target === resolve(root, source.replace(/\.ts$/, ".js")))
          if (!candidate) return
          if (format === "esm") return { path: `./${sharedFile}`, external: true }
          return { path: name, namespace: "experiment" }
        })
        builder.onLoad({ filter: /.*/, namespace: "experiment" }, () => ({
          contents: `const owner=globalThis.MarkupUIExperiment;if(!owner)throw new Error("Load shared runtime first.");export const {${sharedExports.join(",")}}=owner;`,
        }))
        if (!extracting && extracted) builder.onLoad({ filter: /[\\/]popover[\\/]position\.ts$/ }, () => ({
          loader: "ts", resolveDir: resolve(root, dirname(source)),
          contents: `${content.slice(0, owned.getStart(ast))}import { ownedWrites } from "s4-owned-writes";export { ownedWrites };${content.slice(owned.end)}`,
        }))
      },
    })
    const settings = {
      bundle: true, minify: true, write: false, metafile: true, legalComments: "none",
      target: "es2022", sourcemap: true, logLevel: "silent", absWorkingDir: root,
    }
    const entry = extracted ? { stdin: { contents: extracted, loader: "ts", resolveDir: resolve(root, dirname(source)), sourcefile: source } }
      : { entryPoints: [resolve(root, source)] }
    const probe = await build({ ...settings, ...entry, format: "esm", plugins: [plugin(true), corePlugin(root, "esm")], outfile: resolve(root, ".vite/size/sharing", sharedFile) })
    const output = Object.values(probe.metafile.outputs).find(item => item.entryPoint)
    assert.equal(output.imports.length, 0, "Account for new shared dependencies before evaluating this candidate.")
    sharedExports = output.exports
    const chunk = format === "esm" ? probe : await build({ ...settings, ...entry, format: "iife", globalName: "MarkupUIExperiment",
      plugins: [plugin(true), corePlugin(root, "iife")], outfile: resolve(root, ".vite/size/sharing", sharedFile) })
    const sharedSize = bytes(javascript(chunk))
    const families = []
    for (const [family, payload] of Object.entries(manifest.componentPayloads)) {
      if (!payload[format]) continue
      const file = `dist/${payload[format].file}`
      const existing = evidence.builds.find(record => record.file === file)
      if (!existing.metafile.outputs[file].inputs[source]?.bytesInOutput) continue
      const after = await build({ ...settings,
        entryPoints: [resolve(root, `src/components/${family}/${format === "esm" ? "index" : "global"}.ts`)],
        format: format === "esm" ? "esm" : "iife", plugins: [plugin(false), corePlugin(root, format === "esm" ? "esm" : "iife")],
        outfile: resolve(root, ".vite/size/sharing", payload[format].file),
      })
      const size = bytes(javascript(after))
      if (format === "esm") assert.deepEqual(
        Object.values(after.metafile.outputs).find(item => item.entryPoint).exports,
        existing.metafile.outputs[file].exports, `Experiment changed ${family} exports`)
      const dependencyFiles = payload[format].dependencies
      const runtime = size.gzipBytes + sharedSize.gzipBytes + dependencyFiles.reduce((total, path) => total + manifest.bundles[path].gzipBytes, 0)
      const before = report.costs[`${format}:${family}:runtime`]
      families.push({ family, before: before.gzipBytes, after: runtime, delta: runtime - before.gzipBytes,
        entry: size, runtimeBudget: payload[format].runtimeBudget,
        overRecommendationBytes: Math.max(0, runtime - payload[format].runtimeBudget) })
    }
    assert(families.length > 0, `No measured consumers: ${name}`)
    const totalDelta = sharedSize.gzipBytes + families.reduce((sum, item) => sum + item.entry.gzipBytes - report.costs[`${format}:${item.family}:entry`].gzipBytes, 0)
    const selections = {}
    for (const [group, selection] of Object.entries({
      grid: ["grid"], dropdown: ["dropdown"], floating: ["popover", "tooltip", "dropdown"],
      hierarchy: ["tree", "cascader", "tree-select"], collections: ["dynamic-input", "dynamic-tags"],
      dialogs: ["dialog", "modal", "drawer"],
    })) {
      const changed = families.filter(item => selection.includes(item.family))
      const files = new Set(selection.flatMap(family => report.costs[`${format}:${family}:runtime`].files))
      const before = [...files].reduce((sum, file) => sum + report.files[file].gzipBytes, 0)
      const delta = changed.length ? sharedSize.gzipBytes + changed.reduce((sum, item) =>
        sum + item.entry.gzipBytes - report.costs[`${format}:${item.family}:entry`].gzipBytes, 0) : 0
      selections[group] = { before, after: before + delta, delta }
    }
    const result = { name, source, format, sharedSize, families, selections, totalDelta,
      withinRecommendations: families.every(item => item.overRecommendationBytes === 0), combinedSaving: totalDelta < 0 }
    results.push(result)
    console.log(`${name} ${format}: ${families.length} consumers, combined ${totalDelta >= 0 ? "+" : ""}${totalDelta} gzip; above recommendations: ${families.filter(item => item.overRecommendationBytes > 0).map(item => item.family).join(", ") || "none"}`)
  }
}
await mkdir(".vite/size", { recursive: true })
await writeFile(".vite/size/sharing.json", JSON.stringify({ budgetPolicy: "advisory", measurement: "In-memory source builds with the production core bridges and source-map comments; maps excluded; explicit shared boundaries; not shipped or behavior-accepted.", results }, null, 2) + "\n")
