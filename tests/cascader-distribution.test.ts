import { checkSizeRecommendation } from "../scripts/size-policy.mjs"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("selected Cascader distribution", () => {
  it.each(["esm", "classic"])("upgrades portable data and preserves native defaults in %s", format => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import {readFileSync} from "node:fs";
      import {JSDOM} from "jsdom";
      const {window} = new JSDOM("<!doctype html><form><m-cascader name='path' required clearable></m-cascader></form>", {url:"http://localhost/",runScripts:"outside-only",pretendToBeVisual:true});
      for(const key of ["window","document","customElements","HTMLElement","MutationObserver","CustomEvent","Event"]) globalThis[key] = key === "window" ? window : window[key];
      const errors=[]; window.addEventListener("error",event=>errors.push(event.error));
      const element=document.querySelector("m-cascader"), form=document.querySelector("form");
      const authored=document.createElement("m-cascader");
      authored.setAttribute("value","child"); authored.setAttribute("default-value","other");
      authored.setAttribute("options",JSON.stringify([{value:"child",label:"Child"},{value:"other",label:"Other"}]));
      document.body.append(authored);
      element.options=[{value:"parent",label:"Parent",children:[{value:"child",label:"Child"}]},{value:"other",label:"Other"}];
      element.defaultValue="child"; element.value="other";
      let api,core;
      if(${JSON.stringify(format)}==="esm"){
        api=await import("./dist/markup-ui-cascader.js"); core=await import("./dist/markup-ui-core.js");
      } else {
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8")); core=window.MarkupUICore;
        window.eval(readFileSync("./dist/markup-ui-cascader.global.js","utf8")); api=window.MarkupUICascader;
      }
      assert.deepEqual(Object.keys(api).sort(),["Cascader","registerCascader"]);
      assert.ok(element instanceof api.Cascader); assert.ok(api.Cascader.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-tree"),undefined); assert.equal(customElements.get("m-tree-select"),undefined); assert.equal(customElements.get("m-select"),undefined);
      assert.equal(element.value,"other"); assert.equal(element.defaultValue,"child");
      assert.equal(authored.connected,true); assert.equal(authored.value,"child"); assert.equal(authored.defaultValue,"other");
      const control=element.controls[0]; element.remove(); form.append(element);
      assert.equal(element.controls[0],control); assert.equal(element.value,"other");
      form.reset(); await new Promise(resolve=>setTimeout(resolve,20));
      assert.deepEqual(Array.from(element.path),["parent","child"]); assert.equal(form.checkValidity(),true);
      element.path=["parent"]; assert.equal(element.value,null); assert.equal(form.checkValidity(),false);
      element.value="child"; assert.deepEqual(Array.from(new window.FormData(form).getAll("path")),["parent","child"]);
      assert.equal(element.hasAttribute("tabindex"),false); assert.equal(element.hasAttribute("role"),false);
      assert.deepEqual(errors,[]); window.close(); console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })
  it("keeps core-only dependencies and no live Tree controller or registration", () => {
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      expect(manifest.componentPayloads.cascader[format].dependencies).toEqual([`markup-ui-core${suffix}`])
      checkSizeRecommendation(manifest.componentPayloads.cascader[format].runtimeGzipBytes, 12000, "cascader-distribution.test.ts: manifest.componentPayloads.cascader[format].runtimeGzipBytes")
      const map = JSON.parse(readFileSync(`dist/markup-ui-cascader${suffix}.map`, "utf8"))
      expect(map.sources).toContain("../src/components/tree/hierarchy.ts")
      expect(map.sources).not.toContain("../src/components/tree/tree.ts")
      expect(map.sources).not.toContain("../src/components/tree/tree-element.ts")
    }
    const declaration = readFileSync("dist/components/cascader/index.d.ts", "utf8")
    expect(declaration).not.toContain("createCascader")
    const api = JSON.parse(readFileSync("demo/api/cascader.json", "utf8")).elements.find((item: { type: string }) => item.type === "Cascader")
    expect(api.properties.path).toBeDefined(); expect(api.properties.options).toBeDefined()
    expect(api.properties.expandTrigger).toBeUndefined()
  })
  it("rejects a competing registered constructor", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict"; import {JSDOM} from "jsdom";
      const {window}=new JSDOM("<!doctype html>");
      globalThis.HTMLElement=window.HTMLElement; globalThis.customElements=window.customElements;
      customElements.define("m-cascader",class extends HTMLElement{});
      await assert.rejects(import("./dist/markup-ui-cascader.js"),/different implementation/);
      window.close(); console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })
})
