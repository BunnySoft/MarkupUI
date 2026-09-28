import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("Tree selected controller delivery", () => {
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
      let api, core;
      if (${JSON.stringify(format)} === "esm") {
        core = await import("./dist/markup-ui-core.js");
        api = await import("./dist/markup-ui-tree.js");
      } else {
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8"));
        core = window.MarkupUICore;
        window.eval(readFileSync("./dist/markup-ui-tree.global.js","utf8"));
        api = window.MarkupUITree;
      }
      assert.deepEqual(registrations, ["m-tree","m-tree-node"]);
      assert.ok(api.Tree.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-cascader"), undefined);
      assert.equal(customElements.get("m-tree-select"), undefined);
      document.body.innerHTML = '<section class="m-tree" data-tree aria-label="Files"><ul data-tree-list><li data-tree-key="a"><div data-tree-row><button type="button" data-tree-label data-tree-select>A</button></div><details data-tree-branch data-tree-lazy><summary>Children</summary><ul data-tree-list></ul></details></li><li data-tree-key="b"><div data-tree-row><button type="button" data-tree-label data-tree-select>B</button></div></li></ul></section>';
      const root = document.querySelector("section");
      const RuntimePromise = ${JSON.stringify(format)} === "esm" ? Promise : window.Promise;
      let rejectLoad, signal;
      const tree = api.createTree(root, {multiple:true, load:(_, context) => {
        signal = context.signal;
        return new RuntimePromise((_, reject) => { rejectLoad = reject; });
      }});
      const a = tree.nodes[0].label, b = tree.nodes[1].label;
      let selected = 0;
      root.addEventListener("m:tree-select", () => selected++);
      a.click(); b.click();
      await wait(20);
      assert.deepEqual(Array.from(tree.selectedKeys), ["a","b"]);
      assert.equal(selected, 2);
      const pending = tree.expand("a");
      const settled = pending.then(value => ({value}), error => ({error}));
      await wait(20);
      b.click();
      tree.setSelectedKeys(["a"]);
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
      tree.disconnect();
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
})
