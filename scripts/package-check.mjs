import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtemp, mkdir, readFile, writeFile, access } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const output = resolve(root, ".vite/package")
await mkdir(output, { recursive: true })
const consumer = await mkdtemp(resolve(tmpdir(), "markupui-consumer-"))
const npm = (args, cwd) => execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
  cwd, encoding: "utf8", shell: process.platform === "win32", windowsHide: true, timeout: 120_000,
})
const argument = value => process.platform === "win32" ? `"${value}"` : value
const [packed] = JSON.parse(npm(["pack", "--ignore-scripts", "--json", "--pack-destination", argument(output)], root))
const tarball = resolve(output, packed.filename)
await writeFile(resolve(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }))
npm(["install", argument(tarball), "--ignore-scripts", "--offline", "--no-audit", "--no-fund"], consumer)
const installed = resolve(consumer, "node_modules/@dataengine/markup-ui")
const pkg = JSON.parse(await readFile(resolve(installed, "package.json"), "utf8"))
const entries = []
for (const [key, entry] of Object.entries(pkg.exports)) {
  for (const target of typeof entry === "string" ? [entry] : Object.values(entry)) await access(resolve(installed, target))
  if (typeof entry === "object" && entry.import) entries.push(key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`)
}
assert(!pkg.dependencies || !Object.keys(pkg.dependencies).length, "Unexpected mandatory runtime dependencies")
assert(!packed.files.some(file => /(?:chart-licenses|demo\/vendor|node_modules\/(?:echarts|zrender))/.test(file.path)), "Packed vendor assets")
await assert.rejects(access(resolve(consumer, "node_modules/echarts")))
await writeFile(resolve(consumer, "types.ts"), entries.map((entry, index) => `import type * as Entry${index} from ${JSON.stringify(entry)};`).join("\n")
  + `\nexport type Entries = [${entries.map((_, index) => `typeof Entry${index}`).join(",")}];\n`)
await writeFile(resolve(consumer, "tsconfig.json"), JSON.stringify({
  compilerOptions: { module: "NodeNext", moduleResolution: "NodeNext", target: "ES2022", lib: ["ES2022", "DOM", "DOM.Iterable"], strict: true, noEmit: true, types: [] },
  files: ["types.ts"],
}))
execFileSync(process.execPath, [resolve(root, "node_modules/typescript/bin/tsc"), "-p", resolve(consumer, "tsconfig.json")], { encoding: "utf8", stdio: "pipe", timeout: 60_000 })
const jsdom = pathToFileURL(resolve(root, "node_modules/jsdom/lib/api.js")).href
await writeFile(resolve(consumer, "runtime.mjs"), `
import assert from "node:assert/strict";
import { JSDOM } from ${JSON.stringify(jsdom)};
const { window } = new JSDOM("<!doctype html>", { url: "http://localhost/", pretendToBeVisual: true });
for (const key of ["window", "document", "customElements", "MutationObserver", "CustomEvent", "Event", "Element", "Node", "DocumentFragment", "DOMParser", ...Object.getOwnPropertyNames(window).filter(key => /^(?:HTML|SVG).*Element$/.test(key))]) {
  globalThis[key] = key === "window" ? window : window[key];
}
for (const key of ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) globalThis[key] = window[key].bind(window);
const core = await import("@dataengine/markup-ui/core");
assert.equal(customElements.get("m-chart"), undefined);
for (const entry of ${JSON.stringify(entries)}) {
  const api = await import(entry);
  if (entry !== "@dataengine/markup-ui" && !["state", "query", "advanced", "widgets"].includes(entry.split("/").at(-1))) {
    assert.equal(Object.keys(api).some(name => /^M[A-Z][a-z]/.test(name)), false, entry + " exports a compatibility alias");
  }
}
const root = await import("@dataengine/markup-ui");
const chart = await import("@dataengine/markup-ui/chart");
assert.equal(root.ViewElement, core.ViewElement);
assert.ok(chart.Chart.prototype instanceof core.ViewElement);
assert.equal(customElements.get("m-chart"), chart.Chart);
assert.equal(typeof chart.configureChartEngine, "function");
assert.throws(() => chart.configureChartEngine({}), /init/);
chart.configureChartEngine({ init() { throw new Error("Not rendered by import"); } });
assert.equal("MElement" in root, false);
window.close();
console.log("Packed runtime imports passed");
`)
const runtime = execFileSync(process.execPath, [resolve(consumer, "runtime.mjs")], { cwd: consumer, encoding: "utf8", timeout: 60_000 })
const result = { date: new Date().toISOString(), tarball, consumer, entries: entries.length, files: packed.files.length, size: packed.size, types: "passed", runtime: runtime.trim() }
await writeFile(resolve(output, "results.json"), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
