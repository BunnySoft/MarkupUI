import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("Tree selected element delivery", () => {
  it.each(["esm", "classic"])("preserves selection and failed-load ordering in %s", format => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import {readFileSync} from "node:fs";
      import {setTimeout as wait} from "node:timers/promises";
      import {JSDOM} from "jsdom";
      const {window} = new JSDOM("<!doctype html>", {url:"http://localhost/", runScripts:"outside-only"});
      for (const name of ["window","document","HTMLElement","customElements","CustomEvent","MutationObserver"]) globalThis[name] = name === "window" ? window : window[name];
      const registrations = [];
      const define = customElements.define.bind(customElements);
      customElements.define = (name, constructor, options) => { registrations.push(name); define(name, constructor, options); };
      const errors = [];
      window.addEventListener("error", event => errors.push(event.error));
      document.body.innerHTML = '<m-tree selectable checkable><m-tree-node value="early" title="Early"></m-tree-node></m-tree>';
      const early = document.querySelector("m-tree");
      early.selectedKeys = ["early"];
      early.querySelector("m-tree-node").checked = true;
      let api, core;
      if (${JSON.stringify(format)} === "esm") {
        api = await import("./dist/markup-ui-tree.js");
        core = await import("./dist/markup-ui-core.js");
      } else {
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8"));
        core = window.MarkupUICore;
        window.eval(readFileSync("./dist/markup-ui-tree.global.js","utf8"));
        api = window.MarkupUITree;
      }
      assert.deepEqual(registrations, ["m-tree-node","m-tree"]);
      assert.ok(api.Tree.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-cascader"), undefined);
      assert.equal(customElements.get("m-tree-select"), undefined);
      assert.equal(api.createTree, undefined);
      assert.deepEqual(Object.keys(api).sort(), ["Tree", "TreeNode", "registerTree"]);
      assert.deepEqual(Array.from(early.selectedKeys), ["early"]);
      assert.deepEqual(Array.from(early.checkedKeys), ["early"]);
      assert.deepEqual(errors, []);
      document.body.innerHTML = '<m-tree selectable multiple aria-label="Files"><m-tree-node value="a" title="A" lazy></m-tree-node><m-tree-node value="b" title="B"></m-tree-node></m-tree>';
      const tree = document.querySelector("m-tree"), root = tree.querySelector("[data-tree]");
      const RuntimePromise = ${JSON.stringify(format)} === "esm" ? Promise : window.Promise;
      let rejectLoad, signal;
      tree.load = (_, context) => {
        signal = context.signal;
        return new RuntimePromise((_, reject) => { rejectLoad = reject; });
      };
      const a = tree.nodes[0].label, b = tree.nodes[1].label;
      let selected = 0;
      tree.addEventListener("m:tree-select", () => selected++);
      a.click(); b.click();
      await wait(20);
      assert.deepEqual(Array.from(tree.selectedKeys), ["a","b"]);
      assert.equal(selected, 2);
      const pending = tree.expand("a");
      const settled = pending.then(value => ({value}), error => ({error}));
      await wait(20);
      b.click();
      tree.selectedKeys = ["a"];
      await wait(20);
      assert.deepEqual(Array.from(tree.selectedKeys), ["a"]);
      assert.equal(selected, 2);
      assert.equal(signal.aborted, false);
      assert.deepEqual(Array.from(tree.loadingKeys), ["a"]);
      rejectLoad(new Error("Loader failed"));
      root.setAttribute("role","tree");
      const result = await Promise.race([settled, wait(100).then(() => "unsettled")]);
      assert.notEqual(result, "unsettled");
      assert.equal(result.error?.name, "AggregateError");
      assert.equal(result.error.errors[0].message, "Loader failed");
      assert.equal(tree.connected, false);
      assert.deepEqual(Array.from(tree.loadingKeys), []);
      tree.remove();
      window.close();
      console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })

  it("retains core-only dependencies without sharing Tree registration with its hierarchy consumers", () => {
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      expect(manifest.componentPayloads.tree[format].dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(manifest.componentPayloads.tree[format].runtimeGzipBytes).toBeLessThanOrEqual(12000)
      for (const family of ["cascader", "tree-select"]) {
        const map = JSON.parse(readFileSync(`dist/markup-ui-${family}${suffix}.map`, "utf8"))
        expect(map.sources).toContain("../src/components/tree/hierarchy.ts")
        expect(map.sources).not.toContain("../src/components/tree/tree.ts")
        expect(map.sources).not.toContain("../src/components/tree/tree-element.ts")
      }
    }
  })

  it.each(["m-tree", "m-tree-node"])("rejects a conflicting %s before registering the other tag", tag => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import {JSDOM} from "jsdom";
      const {window} = new JSDOM("<!doctype html>");
      for (const name of ["HTMLElement","customElements","CustomEvent","MutationObserver"]) globalThis[name] = window[name];
      customElements.define(${JSON.stringify(tag)}, class extends HTMLElement {});
      await assert.rejects(import("./dist/markup-ui-tree.js"), /different implementation/);
      assert.equal(customElements.get(${JSON.stringify(tag === "m-tree" ? "m-tree-node" : "m-tree")}), undefined);
      window.close(); console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })

  it("documents the canonical element without its internal renderer or old factory", () => {
    const api = JSON.parse(readFileSync("demo/api/tree.json", "utf8"))
    const tree = api.elements.find((element: { type: string }) => element.type === "Tree")
    const node = api.elements.find((element: { type: string }) => element.type === "TreeNode")
    expect(tree.properties.selectedKeys).toBeDefined()
    expect(tree.properties.value).toBeUndefined()
    expect(JSON.stringify(node.actions)).not.toContain('"render"')
    const entry = readFileSync("dist/components/tree/index.d.ts", "utf8")
    expect(entry).not.toContain("createTree")
    expect(entry).not.toContain("TreeController")
    expect(entry).toContain("TreeItem")
  })
})
