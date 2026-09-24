import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, posix, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { gzipSync } from "node:zlib"

const sha256 = content => createHash("sha256").update(content).digest("hex")
const sorted = values => [...new Set(values)].sort()
const measurement = "Actual shipped files; gzip level 9 per file, summed once per selection; JS and CSS separate; source maps, declarations and application-supplied engines excluded from runtime totals."

export function dependencyClosure(entries, graph) {
  const visited = new Set(), visiting = new Set(), result = []
  function visit(file) {
    assert(Object.hasOwn(graph, file), `Missing dependency metadata: ${file}`)
    assert(!visiting.has(file), `Dependency cycle: ${file}`)
    if (visited.has(file)) return
    visiting.add(file)
    for (const dependency of graph[file]) visit(dependency)
    visiting.delete(file)
    visited.add(file)
    result.push(file)
  }
  for (const entry of entries) visit(entry)
  return result
}

export function sumFiles(names, files) {
  const list = sorted(names)
  return {
    files: list,
    bytes: list.reduce((sum, name) => {
      assert(files[name], `Missing measured file: ${name}`)
      return sum + files[name].bytes
    }, 0),
    gzipBytes: list.reduce((sum, name) => sum + files[name].gzipBytes, 0),
  }
}

// Classic global bridges have no emitted imports; their retained virtual inputs
// identify the same concrete runtime boundaries as the served ESM imports.
const classicBridges = Object.fromEntries(
  ["core", "state", "native-input", "native-radio", "native-select", "chart-renderer"]
    .map(name => [`markupui-${name}:${name}`, `dist/markup-ui-${name}.global.js`]),
)

export function outputDependencies(file, build) {
  const output = build.metafile.outputs[file]
  assert(output, `Missing metafile output: ${file}`)
  const dependencies = output.imports.map(item => {
    assert(item.path.startsWith("."), `Unaccounted external import in ${file}: ${item.path}`)
    return posix.normalize(posix.join(posix.dirname(file), item.path))
  })
  if (build.format === "classic") {
    for (const input of Object.keys(output.inputs)) {
      if (!input.startsWith("markupui-")) continue
      assert(classicBridges[input], `Unknown classic bridge: ${input}`)
      dependencies.push(classicBridges[input])
    }
  }
  return sorted(dependencies)
}

export function repeatedSources(entries, builds) {
  const sources = new Map()
  for (const file of entries) {
    const output = builds[file].metafile.outputs[file]
    for (const [source, { bytesInOutput }] of Object.entries(output.inputs)) {
      if (!source.startsWith("src/") || !bytesInOutput) continue
      if (!sources.has(source)) sources.set(source, [])
      sources.get(source).push({ file, bytes: bytesInOutput })
    }
  }
  return [...sources].filter(([, outputs]) => outputs.length > 1).map(([source, outputs]) => {
    const bytes = outputs.reduce((sum, output) => sum + output.bytes, 0)
    return {
      source, copies: outputs.length, bytes,
      excessBytes: bytes - Math.max(...outputs.map(output => output.bytes)),
      outputs: outputs.sort((a, b) => a.file.localeCompare(b.file)),
    }
  }).sort((a, b) => b.excessBytes - a.excessBytes || a.source.localeCompare(b.source))
}

export async function createReport(root) {
  const manifestContent = await readFile(resolve(root, "dist/manifest.json"))
  const manifest = JSON.parse(manifestContent)
  const evidence = JSON.parse(await readFile(resolve(root, ".vite/size/build.json"), "utf8"))
  assert.equal(evidence.schemaVersion, 1, "Unsupported build evidence; rebuild")
  assert.equal(evidence.manifestSha256, sha256(manifestContent), "Stale manifest evidence; rebuild")
  const builds = Object.fromEntries(evidence.builds.map(build => [build.file, build]))
  const files = {}, graph = {}, exports = {}
  for (const build of evidence.builds) {
    const content = await readFile(resolve(root, build.file))
    assert.equal(sha256(content), build.sha256, `Stale build evidence: ${build.file}; rebuild`)
    assert.equal(content.length, build.metafile.outputs[build.file]?.bytes, `Metafile byte mismatch: ${build.file}`)
    files[build.file] = {
      bytes: content.length, gzipBytes: gzipSync(content, { level: 9 }).length,
      minified: build.minified, sha256: build.sha256,
    }
    graph[build.file] = outputDependencies(build.file, build)
    if (build.format === "esm") exports[build.file] = sorted(build.metafile.outputs[build.file].exports)
  }
  // These plugins accept the root API in install(api), not via a JavaScript import.
  const hostDependencies = {}
  for (const name of ["advanced", "widgets"]) {
    const payload = manifest.entryPayloads[name]
    const file = `dist/${payload.file}`
    hostDependencies[file] = [`dist/${manifest.entryPayloads.root.file}`]
    graph[file] = sorted([...graph[file], ...hostDependencies[file]])
  }
  const budgets = {}
  for (const [name, expected] of Object.entries(manifest.bundles)) {
    const file = `dist/${name}`
    if (!files[file]) {
      assert(name.endsWith(".css"), `Missing JavaScript build evidence: ${file}`)
      const content = await readFile(resolve(root, file))
      files[file] = { bytes: content.length, gzipBytes: gzipSync(content, { level: 9 }).length, sha256: sha256(content) }
    }
    assert.equal(files[file].bytes, expected.bytes, `Manifest bytes differ: ${file}`)
    assert.equal(files[file].gzipBytes, expected.gzipBytes, `Manifest gzip differs: ${file}`)
    budgets[`file:${file}`] = expected.budget
    assert(files[file].gzipBytes <= expected.budget, `Payload ceiling exceeded: ${file}`)
  }
  const costs = {}, formats = {}
  function payloadCost(key, payload) {
    const file = `dist/${payload.file}`
    const runtime = sumFiles(dependencyClosure([file], graph), files)
    assert.deepEqual(runtime.files, sorted([file, ...payload.dependencies.map(name => `dist/${name}`)]),
      `Manifest dependency closure differs: ${key}`)
    assert.equal(runtime.gzipBytes, payload.runtimeGzipBytes, `Manifest runtime differs: ${key}`)
    assert.equal(files[file].gzipBytes, payload.gzipBytes, `Manifest entry differs: ${key}`)
    costs[`${key}:entry`] = sumFiles([file], files)
    costs[`${key}:runtime`] = runtime
    if (payload.runtimeBudget !== undefined) {
      budgets[`${key}:runtime`] = payload.runtimeBudget
      assert(runtime.gzipBytes <= payload.runtimeBudget, `Runtime ceiling exceeded: ${key}`)
    }
    return file
  }
  const families = Object.keys(manifest.componentPayloads).filter(name => manifest.componentPayloads[name].esm).sort()
  for (const format of ["esm", "classic"]) {
    const entries = {}
    for (const family of families) {
      const payload = manifest.componentPayloads[family]
      entries[family] = payloadCost(`${format}:${family}`, payload[format])
      assert(builds[entries[family]].minified, `Non-minified component: ${family}`)
      costs[`css:${family}`] = sumFiles([`dist/${payload.css}`], files)
      assert.equal(payload.cssGzipBytes, costs[`css:${family}`].gzipBytes, `Manifest CSS differs: ${family}`)
      assert.equal(payload[format].totalGzipBytes,
        costs[`${format}:${family}:runtime`].gzipBytes + costs[`css:${family}`].gzipBytes,
        `Manifest JS + CSS differs: ${family}`)
    }
    const selections = {
      small: ["grid"],
      complex: ["dropdown"],
      "dynamic-collections": ["dynamic-input", "dynamic-tags"],
      hierarchy: ["tree", "cascader", "tree-select"],
      floating: ["popover", "tooltip", "dropdown"],
      all: families,
    }
    for (const [name, selection] of Object.entries(selections)) {
      costs[`${format}:selection:${name}`] = sumFiles(dependencyClosure(selection.map(family => entries[family]), graph), files)
      costs[`css:selection:${name}`] = sumFiles(selection.map(family => `dist/${manifest.componentPayloads[family].css}`), files)
    }
    const ranking = families.map(family => ({
      family, ...costs[`${format}:${family}:entry`],
      ownSourceBytes: Object.entries(builds[entries[family]].metafile.outputs[entries[family]].inputs)
        .filter(([source]) => source.startsWith(`src/components/${family}/`))
        .reduce((sum, [, input]) => sum + input.bytesInOutput, 0),
    })).sort((a, b) => b.gzipBytes - a.gzipBytes || a.family.localeCompare(b.family))
    formats[format] = {
      selections, largestEntries: ranking,
      largestOwnImplementations: [...ranking].sort((a, b) => b.ownSourceBytes - a.ownSourceBytes || a.family.localeCompare(b.family)),
      repeatedSources: repeatedSources(Object.values(entries), builds),
    }
  }
  for (const [name, payload] of Object.entries(manifest.entryPayloads)) {
    payloadCost(`optional:${name}`, payload)
    costs[`optional:${name}:css`] = sumFiles(payload.css.map(file => `dist/${file}`), files)
    assert.equal(costs[`optional:${name}:css`].gzipBytes, payload.cssGzipBytes, `Optional CSS differs: ${name}`)
    assert.equal(costs[`optional:${name}:runtime`].gzipBytes + payload.cssGzipBytes, payload.totalGzipBytes,
      `Optional JS + CSS differs: ${name}`)
  }
  const externalEngines = {
    chart: manifest.componentPayloads.chart.externalDependencies,
    note: "Application-required engine is excluded above. These are the built demo's selected ECharts modules, not a universal engine cost.",
    demo: Object.fromEntries(evidence.builds.filter(build => build.file.startsWith("demo/vendor/"))
      .map(build => [build.format, sumFiles([build.file], files)])),
  }
  return {
    schemaVersion: 1, measurement, packageVersion: manifest.version,
    environment: evidence.environment, revision: evidence.revision,
    families, files, graph, hostDependencies, exports, budgets, costs, formats, externalEngines,
    attributionNote: "esbuild bytesInOutput are raw source contributions, excluding some output overhead. Excess over the largest copy is diagnostic, NOT removable gzip bytes or evidence of equivalent behavior.",
  }
}

export function baselineSnapshot(report) {
  const { schemaVersion, measurement, packageVersion, environment, revision, families, files, graph, hostDependencies, exports, budgets, costs, externalEngines } = report
  return { schemaVersion, measurement, packageVersion, environment, revision, families, files, graph, hostDependencies, exports, budgets, costs, externalEngines }
}

export function compareBaseline(report, baseline) {
  assert.equal(baseline.schemaVersion, report.schemaVersion, "Incompatible baseline schema")
  assert.equal(baseline.measurement, report.measurement, "Incompatible measurement definitions")
  const changes = []
  for (const scope of ["files", "costs"]) {
    for (const key of sorted([...Object.keys(baseline[scope]), ...Object.keys(report[scope])])) {
      const before = baseline[scope][key], after = report[scope][key]
      if (before?.bytes === after?.bytes && before?.gzipBytes === after?.gzipBytes
        && JSON.stringify(before?.files) === JSON.stringify(after?.files)) continue
      changes.push({
        scope, key, before: before ?? null, after: after ?? null,
        bytes: (after?.bytes ?? 0) - (before?.bytes ?? 0),
        gzipBytes: (after?.gzipBytes ?? 0) - (before?.gzipBytes ?? 0),
      })
    }
  }
  const exportChanges = sorted([...Object.keys(baseline.exports), ...Object.keys(report.exports)])
    .filter(file => JSON.stringify(baseline.exports[file]) !== JSON.stringify(report.exports[file]))
    .map(file => ({ file, before: baseline.exports[file] ?? [], after: report.exports[file] ?? [] }))
  const budgetChanges = sorted([...Object.keys(baseline.budgets), ...Object.keys(report.budgets)])
    .filter(key => baseline.budgets[key] !== report.budgets[key])
    .map(key => ({ key, before: baseline.budgets[key] ?? null, after: report.budgets[key] ?? null }))
  return {
    baselineRevision: baseline.revision, changes, exportChanges, budgetChanges,
    equivalence: exportChanges.length ? "Exports changed: diagnostic comparison only; reconcile contracts before claiming savings."
      : "Export names preserved; behavior still requires tests.",
  }
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
  const { values } = parseArgs({ options: {
    baseline: { type: "string", default: "docs/architecture/size-baseline.json" },
    output: { type: "string", default: ".vite/size/report.json" },
    "write-baseline": { type: "boolean", default: false },
    "check-regressions": { type: "boolean", default: false },
  } })
  const report = await createReport(root)
  const baselinePath = resolve(root, values.baseline)
  if (values["write-baseline"]) {
    assert(!values["check-regressions"], "Do not reset the baseline while checking regressions")
    await mkdir(dirname(baselinePath), { recursive: true })
    await writeFile(baselinePath, `${JSON.stringify(baselineSnapshot(report), null, 2)}\n`)
  }
  report.comparison = compareBaseline(report, JSON.parse(await readFile(baselinePath, "utf8")))
  const output = resolve(root, values.output)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
  for (const format of ["esm", "classic"]) {
    const all = report.costs[`${format}:selection:all`]
    console.log(`${format}: ${report.families.length} families, ${all.files.length} JS files, ${all.bytes} minified bytes, ${all.gzipBytes} gzip bytes`)
    console.log(`Largest entries (gzip): ${report.formats[format].largestEntries.slice(0, 5).map(item => `${item.family} ${item.gzipBytes}`).join(", ")}`)
  }
  const increases = report.comparison.changes.filter(change => change.bytes > 0 || change.gzipBytes > 0)
  console.log(`Baseline: ${report.comparison.changes.length} size/file-list changes, ${increases.length} increases, ${report.comparison.exportChanges.length} export changes`)
  console.log(`Report: ${output}`)
  const raisedBudgets = report.comparison.budgetChanges.filter(change =>
    change.before !== null && (change.after === null || change.after > change.before))
  assert.equal(raisedBudgets.length, 0, "Existing payload ceilings were raised or removed; see report")
  if (values["check-regressions"]) {
    assert.equal(increases.length, 0, "Payload regression against baseline; see report")
    assert.equal(report.comparison.exportChanges.length, 0, "Export surface changed; comparison is diagnostic only")
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
