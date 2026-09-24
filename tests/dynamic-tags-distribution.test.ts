import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (file: string) => readFileSync(resolve("dist", file), "utf8")

describe("Dynamic Tags registration boundary", () => {
  it.each([
    ["esm", "tags-only"], ["esm", "tags-first"], ["esm", "input-first"],
    ["classic", "tags-only"], ["classic", "tags-first"], ["classic", "input-first"],
  ])("loads %s in %s order without an unintended constructor", (format, order) => {
    const result = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import { readFileSync } from "node:fs";
      import { JSDOM } from "jsdom";
      const { window } = new JSDOM("<!doctype html>", { url: "http://localhost/", runScripts: "outside-only" });
      const format = ${JSON.stringify(format)}, order = ${JSON.stringify(order)};
      for (const key of ["window", "document", "HTMLElement", "customElements", "CustomEvent", "MutationObserver"]) {
        globalThis[key] = key === "window" ? window : window[key];
      }
      const registrations = [];
      const define = customElements.define.bind(customElements);
      customElements.define = (name, ctor, options) => { registrations.push(name); define(name, ctor, options); };
      async function load(family) {
        if (format === "esm") return import("./dist/markup-ui-" + family + ".js");
        window.eval(readFileSync("./dist/markup-ui-" + family + ".global.js", "utf8"));
        return window[family === "dynamic-tags" ? "MarkupUIDynamicTags" : "MarkupUIDynamicInput"];
      }
      let core;
      if (format === "classic") {
        await assert.rejects(load("dynamic-tags"), /markup-ui-core.global.js/);
        assert.deepEqual(registrations, []);
        window.eval(readFileSync("./dist/markup-ui-core.global.js", "utf8"));
        core = window.MarkupUICore;
      } else core = await import("./dist/markup-ui-core.js");
      let input;
      if (order === "input-first") input = await load("dynamic-input");
      const tags = await load("dynamic-tags");
      assert.equal(customElements.get("m-dynamic-tags"), tags.DynamicTags);
      assert.ok(tags.DynamicTags.prototype instanceof core.ViewElement);
      assert.deepEqual(Object.keys(tags).sort(), ["DynamicTags", "createDynamicTags", "dynamicTagsSizes", "registerDynamicTags"]);
      if (order !== "input-first") assert.equal(customElements.get("m-dynamic-input"), undefined,
        "Dynamic Tags must not register Dynamic Input");
      if (order === "tags-first") input = await load("dynamic-input");
      if (input) {
        assert.equal(customElements.get("m-dynamic-input"), input.DynamicInput);
        assert.ok(input.DynamicInput.prototype instanceof core.ViewElement);
      }
      assert.deepEqual(registrations.sort(), input ? ["m-dynamic-input", "m-dynamic-tags"] : ["m-dynamic-tags"]);

      // Exercise the shipped helper as well as imports: the native collection owner
      // must remain present even though its unrelated element class was removed.
      const row = '<li data-dynamic-row><input type="text" readonly data-tags-value name="tags[]" aria-label="Tag"><button type="button" data-dynamic-action="remove" hidden>Remove</button></li>';
      document.body.innerHTML = '<form><fieldset data-dynamic-tags data-dynamic-input><legend>Tags</legend>'
        + '<ul data-dynamic-rows></ul><template data-dynamic-template>' + row + '</template>'
        + '<div data-tags-entry hidden><label for="draft">New tag</label><input id="draft" type="text" data-tags-editor maxlength="32">'
        + '<button type="button" data-dynamic-add hidden>Add</button></div><p data-tags-status>Ready</p></fieldset></form>';
      const root = document.querySelector("fieldset"), editor = document.querySelector("#draft");
      let cleaned = 0;
      const helper = tags.createDynamicTags(root, { duplicates: "reject", connect(row, context) { context.onCleanup(() => { cleaned++; }); } });
      editor.value = "  preserved  ";
      assert.equal(helper.commit().status, "added");
      assert.deepEqual(Array.from(helper.values), ["  preserved  "]);
      assert.deepEqual(new window.FormData(document.querySelector("form")).getAll("tags[]"), ["  preserved  "]);
      editor.value = "  preserved  ";
      assert.equal(helper.commit().reason, "duplicate");
      assert.equal(editor.value, "  preserved  ");
      if (input) assert.throws(() => input.createDynamicInput(root), /owner/);
      assert.equal(helper.remove(helper.tags[0].key), true);
      assert.equal(cleaned, 1);
      helper.disconnect();
      assert.equal(root.querySelector("[data-tags-entry]").hidden, true);
      const reconnected = tags.createDynamicTags(root);
      assert.equal(reconnected.connected, true);
      reconnected.disconnect();
      window.close();
      console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(result.trim()).toBe("passed")
  })

  it.each([".js", ".global.js"])("retains helper source but excludes registration/class code in %s", suffix => {
    const map = JSON.parse(read(`markup-ui-dynamic-tags${suffix}.map`))
    expect(map.sources).toContain("../src/components/dynamic-input/dynamic-input.ts")
    expect(map.sources).not.toContain("../src/components/dynamic-input/dynamic-input-element.ts")
    expect(map.sources).not.toContain("../src/components/dynamic-input/index.ts")
    expect(map.sources.some((file: string) => file.endsWith("/core/view-element.ts"))).toBe(false)
    const evidence = JSON.parse(readFileSync(".vite/size/build.json", "utf8"))
    const file = `dist/markup-ui-dynamic-tags${suffix}`
    const inputs = Object.keys(evidence.builds.find(build => build.file === file).metafile.outputs[file].inputs)
    expect(inputs).toContain("src/components/dynamic-input/dynamic-input.ts")
    expect(inputs).not.toContain("src/components/dynamic-input/dynamic-input-element.ts")
    expect(inputs).not.toContain("src/components/dynamic-input/index.ts")
  })

  it("keeps helper declarations on the non-registering owner and still needs only core", () => {
    expect(read("components/dynamic-tags/dynamic-tags.d.ts")).toContain("../dynamic-input/dynamic-input.js")
    expect(read("components/dynamic-tags/dynamic-tags.d.ts")).not.toContain("../dynamic-input/index.js")
    const manifest = JSON.parse(read("manifest.json"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      expect(manifest.componentPayloads["dynamic-tags"][format].dependencies).toEqual([`markup-ui-core${suffix}`])
    }
  })
})
