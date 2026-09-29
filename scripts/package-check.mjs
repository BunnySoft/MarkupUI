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
  + `\nexport type Entries = [${entries.map((_, index) => `typeof Entry${index}`).join(",")}];\n`
  + `import { bind, createStore, type BindingOptions } from "@dataengine/markup-ui/state";\n`
  + `const options: BindingOptions = { templates: new Map([["row", document.createElement("template")]]), focusFallback: ({ active, removed }) => document.createElement("button") };\n`
  + `bind(document.createElement("div"), createStore(), options).refresh();\n`
  + `import { installActions, registerAction } from "@dataengine/markup-ui";\n`
  + `const actionRoot = document.createElement("div"); const binding = bind(actionRoot, createStore());\n`
  + `const argument: unknown = binding.read(actionRoot, "value"); const sameStore = binding.store;\n`
  + `registerAction("typed", ({ arguments: args, parameters, store }) => { const value: unknown = args.key; });\n`
  + `installActions(actionRoot, binding)();\n`
  + `import { List, ListTemplate } from "@dataengine/markup-ui/list";\n`
  + `const list = new List(); const region = new ListTemplate(); region.focusOnRemove = true; region.label = "Tasks";\n`
  + `const source: HTMLTemplateElement = region.native; const items: readonly import("@dataengine/markup-ui/list").ListItem[] = list.items;\n`
  + `import { If } from "@dataengine/markup-ui/box"; const condition = new If(); condition.focusTarget = "edit"; const inert: HTMLTemplateElement = condition.native;\n`)
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
for (const key of ["window", "document", "customElements", "MutationObserver", "CustomEvent", "Event", "Element", "Node", "Document", "DocumentFragment", "DOMParser", ...Object.getOwnPropertyNames(window).filter(key => /^(?:HTML|SVG).*Element$/.test(key))]) {
  globalThis[key] = key === "window" ? window : window[key];
}
for (const key of ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) globalThis[key] = window[key].bind(window);
const core = await import("@dataengine/markup-ui/core");
assert.equal(customElements.get("m-chart"), undefined);
const aggregate = process.argv.includes("--all");
for (const entry of (aggregate ? ["@dataengine/markup-ui/all"] : ${JSON.stringify(entries)}.filter(entry => !entry.endsWith("/all")))) {
  const api = await import(entry);
  if (entry !== "@dataengine/markup-ui" && !["state", "query", "advanced", "widgets"].includes(entry.split("/").at(-1))) {
    assert.equal(Object.keys(api).some(name => /^M[A-Z][a-z]/.test(name)), false, entry + " exports a compatibility alias");
  }
}
const all = aggregate ? await import("@dataengine/markup-ui/all") : null;
const root = aggregate ? null : await import("@dataengine/markup-ui");
const chart = aggregate ? all.chart : await import("@dataengine/markup-ui/chart");
if (aggregate) {
  assert.equal(Object.keys(all).length, 89);
  for (const family of Object.values(all)) for (const exported of Object.values(family)) {
    if (typeof exported === "function" && Object.hasOwn(exported, "tag")) {
      assert.equal(customElements.get(exported.tag), exported);
      assert.ok(exported.prototype instanceof core.ViewElement);
    }
  }
  await assert.rejects(import("@dataengine/markup-ui/grid"), /different implementation|already defined/);
} else assert.equal(root.ViewElement, core.ViewElement);
assert.ok(chart.Chart.prototype instanceof core.ViewElement);
assert.equal(customElements.get("m-chart"), chart.Chart);
assert.equal(typeof chart.configureChartEngine, "function");
assert.throws(() => chart.configureChartEngine({}), /init/);
chart.configureChartEngine({ init() { throw new Error("Not rendered by import"); } });
if (root) assert.equal("MElement" in root, false);
const state = await import("@dataengine/markup-ui/state");
const conditional = document.createElement("m-box");
conditional.innerHTML = '<m-button id="packed-return">Edit</m-button><m-if data-if="visible" focus-target="packed-return"><m-input data-model-value="title" data-model-event="input" data-model-target="native"></m-input></m-if>';
document.body.append(conditional);
const conditionalStore = state.createStore({ visible: true, title: "Packed condition" });
let conditionBinding = state.bind(conditional, conditionalStore);
const conditionalField = conditional.querySelector("m-input");
assert.equal(conditionalField.value, "Packed condition");
conditionBinding();
conditionBinding = state.bind(conditional, conditionalStore);
assert.equal(conditional.querySelector("m-input"), conditionalField);
conditionalField.focus();
conditionalStore.set("visible", false);
assert.equal(document.activeElement, conditional.querySelector("button"));
assert.equal(conditional.querySelector("m-input"), null);
conditionBinding();
conditional.remove();
const editor = document.createElement("div");
editor.innerHTML = '<template data-each="rows" data-each-key="id"><input data-model-value="$item.name" data-model-event="input"></template>';
document.body.append(editor);
const store = state.createStore({ rows: [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }] });
let stop = state.bind(editor, store);
const first = editor.querySelector("input");
store.set("rows", [...store.get("rows")].reverse());
assert.equal(editor.querySelectorAll("input")[1], first);
stop();
stop = state.bind(editor, store);
assert.equal(editor.querySelectorAll("input").length, 2);
first.value = "Packed edit";
first.dispatchEvent(new Event("input"));
assert.equal(store.get("rows.1.name"), "Packed edit");
stop();
editor.remove();
const list = document.createElement("m-list");
list.innerHTML = '<m-list-template data-each="rows" data-each-key="id" focus-on-remove label="Packed list"><m-list-item><m-input data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></m-list-item></m-list-template>';
document.body.append(list);
stop = state.bind(list, store);
const item = list.items[0];
const control = item.querySelector("m-input").native;
assert.equal(item.parentElement.localName, "li");
assert.equal(item.hasAttribute("role"), false);
store.set("rows", [...store.get("rows")].reverse());
assert.equal(list.items[1], item);
control.value = "Portable packed edit";
control.dispatchEvent(new Event("input", { bubbles: true }));
assert.equal(store.get("rows.1.name"), "Portable packed edit");
control.focus();
store.set("rows", []);
assert.equal(document.activeElement, list.itemsContainer);
stop();
list.remove();
const references = document.createElement("div");
references.innerHTML = '<m-list><m-list-template data-each="rows" data-each-key="id" data-template="#row"></m-list-template></m-list><template id="row"><m-list-item><m-label data-bind-html-for="$item.field" data-bind-text="$item.name"></m-label><m-input data-bind-id="$item.field" data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input></m-list-item></template><template data-each="rows" data-each-key="id" data-template="field"></template>';
const fieldSource = document.createElement("template");
fieldSource.innerHTML = '<input data-model-value="$item.name" data-model-event="input">';
const sourceOptions = { templates: new Map([["field", fieldSource]]) };
document.body.append(references);
store.set("rows", [{ id: "a", name: "Reusable", field: "packed-field-a" }]);
stop = state.bind(references, store, sourceOptions);
await Promise.resolve();
const referencedField = references.querySelector("m-input");
assert.equal(referencedField.value, "Reusable");
assert.equal(referencedField.id, "packed-field-a");
assert.equal(references.querySelector("m-label").control, referencedField.native);
assert.equal(references.querySelector("m-list-item").parentElement.localName, "li");
referencedField.native.value = "Reference edit";
referencedField.native.dispatchEvent(new Event("input", { bubbles: true }));
assert.equal(store.get("rows.0.name"), "Reference edit");
assert.equal(references.lastElementChild.previousElementSibling.value, "Reference edit");
stop();
stop = state.bind(references, store, sourceOptions);
await Promise.resolve();
assert.equal(references.querySelector("m-input"), referencedField);
assert.equal(references.querySelector("m-label").control, referencedField.native);
assert.equal(references.querySelector("#row").content.querySelector("m-input").hasAttribute("value"), false);
assert.equal(stop.store, store);
assert.equal(stop.read(referencedField, "$key"), "a");
stop();
references.remove();
if (root) {
  const actions = document.createElement("div");
  actions.innerHTML = '<template data-each="rows" data-each-key="id"><m-button m-action="packed-action" m-arg-key="$key" m-arg-index="$index" m-param-mode="save">Save</m-button></template>';
  document.body.append(actions);
  store.set("rows", [{ id: "a" }, { id: "b" }]);
  stop = state.bind(actions, store);
  let captured;
  root.registerAction("packed-action", context => { captured = context; });
  const disposeActions = root.installActions(actions, stop);
  const first = actions.querySelector("m-button");
  store.set("rows", [...store.get("rows")].reverse());
  first.querySelector("button").click();
  assert.equal(captured.store, store);
  assert.deepEqual(captured.arguments, { key: "a", index: 1 });
  assert.deepEqual(captured.parameters, { mode: "save" });
  disposeActions();
  stop();
  assert.throws(() => stop.read(first, "$key"), /disposed/);
  actions.remove();
}
window.close();
console.log(aggregate ? "Packed aggregate runtime imports passed" : "Packed modular runtime imports passed");
`)
const runtime = [[], ["--all"]].map(args => execFileSync(process.execPath, [resolve(consumer, "runtime.mjs"), ...args], { cwd: consumer, encoding: "utf8", timeout: 60_000 })).join("")
const result = { date: new Date().toISOString(), tarball, consumer, entries: entries.length, files: packed.files.length, size: packed.size, types: "passed", runtime: runtime.trim() }
await writeFile(resolve(output, "results.json"), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
