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
  + `import { If } from "@dataengine/markup-ui/box"; const condition = new If(); condition.focusTarget = "edit"; const inert: HTMLTemplateElement = condition.native;\n`
  + `import { Transfer, type TransferOption, type TransferState } from "@dataengine/markup-ui/transfer";\n`
  + `const transfer = new Transfer(); const transferData: readonly TransferOption[] = [{ value: "a", label: "Alpha" }]; transfer.options = transferData; transfer.value = ["a"]; transfer.defaultValue = ["a"]; transfer.required = true; transfer.name = "members"; const members: readonly string[] = transfer.value; const transferState: TransferState = transfer.state;\n`
  + `import { TimePicker, type TimePickerState } from "@dataengine/markup-ui/time-picker"; const time = new TimePicker(); time.value = "09:30"; time.defaultValue = "08:00"; const timeText: string = time.value; const timeState: TimePickerState = time.state;\n`
  + `import { InputOtp, type InputOtpSchema } from "@dataengine/markup-ui/input-otp"; const otp = new InputOtp(); otp.characters = "digits"; otp.value = "1234"; otp.defaultValue = ""; const otpText: string = otp.value; const otpSchema: InputOtpSchema = { length: 4, characters: "digits" };\n`
  + `import { Mention, type MentionConfiguration } from "@dataengine/markup-ui/mention"; const mention = new Mention(); const mentionSettings: MentionConfiguration = { prefix: ["@"], options: [{ value: "ada", label: "Ada" }] }; mention.configure(mentionSettings); mention.value = "@ada"; const mentionText: string = mention.value;\n`
  + `import { AutoComplete, type AutoCompleteSuggestion } from "@dataengine/markup-ui/auto-complete"; const auto = new AutoComplete(); const suggestions: readonly AutoCompleteSuggestion[] = [{ value: "Alpha", label: "Alpha" }]; auto.options = suggestions; auto.defaultValue = "Alpha"; auto.value = ""; const autoText: string = auto.value;\n`
  + `import { Rate } from "@dataengine/markup-ui/rate"; const rate = new Rate(); rate.count = 12; rate.allowHalf = true; rate.value = 3.5; rate.defaultValue = null; const score: number | null = rate.value; const cleared: boolean = rate.clear();\n`
  + `import { Slider, type SliderValue, type SliderDefaultValue, type SliderStep } from "@dataengine/markup-ui/slider"; const slider = new Slider(); slider.range = true; slider.value = [20, 80]; const sliderValue: SliderValue = slider.value; const sliderDefault: SliderDefaultValue = slider.defaultValue; const sliderStep: SliderStep = "any"; slider.step = sliderStep;\n`
  + `import { DatePicker, type DatePickerValue, type DatePickerElementConfiguration } from "@dataengine/markup-ui/date-picker"; const date = new DatePicker(); date.type = "year"; date.value = 2026; const dateValue: DatePickerValue | null = date.value; const dateConfiguration: DatePickerElementConfiguration = { type: "quarter", value: "2026-Q4", defaultValue: "" }; date.configure(dateConfiguration);\n`
  + `import { ColorPicker, type ColorMode, type ColorPickerOptions } from "@dataengine/markup-ui/color-picker"; const color = new ColorPicker(); const colorMode: ColorMode = "hsl"; const colorSettings: ColorPickerOptions = { modes: ["hex", "rgb", colorMode], showAlpha: true, value: "rgba(255, 0, 0, 0.5)" }; color.configure(colorSettings); const colorText: string = color.value; const colorRepresentation: string = color.formattedValue;\n`
  + `import { NumberAnimation } from "@dataengine/markup-ui/number-animation"; const animation = new NumberAnimation(); animation.play(); animation.pause(); animation.resume(); animation.reset();\n`
  + `import { TreeSelect, type TreeSelectValue } from "@dataengine/markup-ui/tree-select"; const tree = new TreeSelect(); tree.multiple = true; tree.value = ["a"]; tree.defaultValue = ["a"]; const treeValue: TreeSelectValue = tree.value;\n`
  + `import { Chart, ChartEncode } from "@dataengine/markup-ui/chart"; const chart = new Chart(); chart.option = { series: [{ type: "pie" }] }; const encode = new ChartEncode(); encode.x = ["month", 0];\n`)
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
const errors = [];
window.addEventListener("error", event => { errors.push(event.error ?? new Error(event.message)); event.preventDefault(); });
const apiWorkspace = document.createElement("m-box");
document.body.append(apiWorkspace);
const mount = (tag, configure) => {
  const element = document.createElement(tag);
  configure?.(element);
  apiWorkspace.append(element);
  return element;
};
const transfer = mount("m-transfer", element => {
  element.options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
  element.defaultValue = ["a"];
});
let membershipEvents = 0;
transfer.addEventListener("m:change", () => membershipEvents++);
transfer.value = ["b"];
assert.deepEqual(transfer.value, ["b"]);
assert.equal(transfer.native.querySelector("[data-transfer-target]").options[0].value, "b");
assert.equal(membershipEvents, 0);
const transferNative = transfer.native;
transfer.remove(); apiWorkspace.append(transfer);
assert.equal(transfer.native, transferNative);
assert.deepEqual(transfer.defaultValue, ["a"]);
transfer.reset();
assert.deepEqual(transfer.value, ["a"]);
const time = mount("m-time-picker", element => element.setAttribute("value", "09:30"));
time.value = "10:45";
assert.equal(time.native.value, "10:45");
assert.equal(time.defaultValue, "09:30");
assert.equal(time.getAttribute("value"), "09:30");
const otp = mount("m-input-otp", element => { element.length = 4; element.characters = "digits"; });
let complete;
otp.addEventListener("m:input-otp-complete", event => { complete = event.detail; });
otp.value = "1234";
assert.equal(otp.native.value, "1234");
assert.equal(complete, undefined);
otp.value = "123";
otp.native.value = "1234";
otp.native.dispatchEvent(new Event("input", { bubbles: true }));
await new Promise(resolve => setTimeout(resolve, 0));
assert.deepEqual(complete, { length: 4, characters: "digits" });
const mention = mount("m-mention");
mention.value = "@ada";
assert.equal(mention.native.value, "@ada");
assert.equal(mention.defaultValue, "");
const auto = mount("m-auto-complete", element => { element.options = ["Alpha", "Beta"]; });
auto.value = "Alpha";
assert.equal(auto.native.value, "Alpha");
assert.equal(auto.defaultValue, "");
const rate = mount("m-rate", element => { element.count = 12; element.allowHalf = true; element.value = 3.5; });
assert.equal(rate.value, 3.5);
assert.equal(rate.native.querySelector('input[type="radio"]:checked').value, "3.5");
assert.equal(rate.clear(), true);
assert.equal(rate.value, null);
const slider = mount("m-slider", element => { element.range = true; element.value = [20, 80]; });
assert.deepEqual(slider.value, [20, 80]);
assert.deepEqual(slider.native.map(input => input.valueAsNumber), [20, 80]);
const year = mount("m-date-picker", element => { element.type = "year"; element.value = 2026; });
assert.equal(year.value, 2026);
assert.equal(year.native[0].value, "2026");
year.configure({ type: "quarter", value: "2026-Q4", defaultValue: "2026-Q1" });
assert.equal(year.value, "2026-Q4");
assert.equal(year.native[0].value, "2026-Q4");
const dateRange = mount("m-date-picker", element => { element.type = "daterange"; element.value = ["2026-10-01", ""]; });
assert.deepEqual(dateRange.value, ["2026-10-01", ""]);
assert.equal(dateRange.native.length, 2);
const color = mount("m-color-picker", element => { element.showAlpha = true; element.value = "rgba(255, 0, 0, 0.5)"; });
assert.equal(color.value, "rgba(255, 0, 0, 0.5)");
assert.equal(color.alphaControl.value, "0.5");
color.mode = "hsl";
assert.match(color.formattedValue, /^hsla?\\(/);
assert.equal(color.value, "rgba(255, 0, 0, 0.5)");
const tree = document.createElement("m-tree-select");
tree.multiple = true;
tree.options = [{ value: "a", label: "Alpha" }];
tree.value = ["a"];
tree.defaultValue = ["a"];
assert.throws(() => { tree.value = new Array(1); }, TypeError);
assert.throws(() => { tree.defaultValue = new Array(1); }, TypeError);
assert.deepEqual(tree.value, ["a"]);
assert.deepEqual(tree.defaultValue, ["a"]);
const encode = document.createElement("m-chart-encode");
encode.x = ["month"];
assert.throws(() => { encode.x = new Array(1); }, TypeError);
assert.deepEqual(encode.x, ["month"]);
const directChart = document.createElement("m-chart");
const directOption = { series: [{ type: "pie" }] };
directChart.option = directOption;
assert.throws(() => { directChart.option = { series: new Array(1) }; }, TypeError);
assert.equal(directChart.option, directOption);
apiWorkspace.viewStyle = { direction: "row", gap: 2.5 };
assert.equal(apiWorkspace.hasAttribute("direction"), false);
assert.equal(apiWorkspace.viewStyle.gap, "2.5px");
apiWorkspace.remove(); document.body.append(apiWorkspace);
assert.equal(apiWorkspace.viewStyle.gap, "2.5px");
apiWorkspace.remove();
await new Promise(resolve => setTimeout(resolve, 0));
assert.deepEqual(errors, []);
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
