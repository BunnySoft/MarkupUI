import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("selected Tree Select distribution", () => {
  it.each(["esm", "classic"])("maps pre-upgrade data and native defaults in %s", format => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict"; import {readFileSync} from "node:fs"; import {JSDOM} from "jsdom";
      const {window}=new JSDOM("<!doctype html><form><m-tree-select></m-tree-select></form>",{url:"http://localhost/",runScripts:"outside-only",pretendToBeVisual:true});
      for(const key of ["window","document","customElements","HTMLElement","MutationObserver","CustomEvent","Event"]) globalThis[key]=key==="window"?window:window[key];
      const errors=[]; window.addEventListener("error",event=>errors.push(event.error));
      const element=document.querySelector("m-tree-select"), form=document.querySelector("form");
      element.multiple=true; element.filterable=true; element.name="files"; element.clearable=true;
      element.options=[{value:"docs",label:"Documents",children:[{value:"readme",label:"README"},{value:"notes",label:"Notes"}]}];
      element.defaultValue=["readme"]; element.value=["notes"];
      let api,core;
      if(${JSON.stringify(format)}==="esm"){
        api=await import("./dist/markup-ui-tree-select.js"); core=await import("./dist/markup-ui-core.js");
      }else{
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8")); core=window.MarkupUICore;
        window.eval(readFileSync("./dist/markup-ui-native-select.global.js","utf8"));
        window.eval(readFileSync("./dist/markup-ui-tree-select.global.js","utf8")); api=window.MarkupUITreeSelect;
      }
      assert.deepEqual(Object.keys(api).sort(),["TreeSelect","registerTreeSelect"]);
      assert.ok(element instanceof api.TreeSelect); assert.ok(api.TreeSelect.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-tree"),undefined); assert.equal(customElements.get("m-select"),undefined);
      assert.deepEqual(Array.from(element.value),["notes"]);
      assert.deepEqual(Array.from(new window.FormData(form).getAll("files")),["notes"]);
      form.reset(); element.querySelector("[data-tree-select-clear]").click();
      await new Promise(resolve=>setTimeout(resolve,30)); assert.deepEqual(Array.from(element.value),[]);
      element.value=["notes"];
      const control=element.native, notes=control.querySelector('option[value="notes"]');
      element.focus(); element.options=[{value:"docs",label:"Manuals",children:[{value:"notes",label:"Notes"}]}];
      assert.equal(document.activeElement,control); assert.equal(control.querySelector('option[value="notes"]'),notes);
      assert.deepEqual(Array.from(element.state.unavailableDefaultKeys),["readme"]);
      element.remove(); form.append(element); assert.equal(element.native,control);
      assert.deepEqual(Array.from(element.state.unavailableDefaultKeys),["readme"]);
      form.reset(); await new Promise(resolve=>setTimeout(resolve,30)); assert.deepEqual(Array.from(element.value),[]);
      element.value=["notes"]; const events=[]; element.addEventListener("m:tree-select-change",event=>events.push(event));
      assert.equal(element.clear(),true); assert.equal(events.length,1); assert.equal(events[0].target,element);
      assert.deepEqual(errors,[]); window.close(); console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })
  it("ships only its existing core/native-select dependencies and no passive tree round trip", () => {
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      expect(manifest.componentPayloads["tree-select"][format].dependencies).toEqual([`markup-ui-core${suffix}`, `markup-ui-native-select${suffix}`])
      expect(manifest.componentPayloads["tree-select"][format].runtimeGzipBytes).toBeLessThanOrEqual(13000)
      const map = JSON.parse(readFileSync(`dist/markup-ui-tree-select${suffix}.map`, "utf8"))
      expect(map.sources).not.toContain("../src/components/tree/hierarchy.ts")
      expect(map.sources).not.toContain("../src/components/tree/source.ts")
      expect(map.sources).not.toContain("../src/components/tree/tree-element.ts")
    }
    const declaration = readFileSync("dist/components/tree-select/index.d.ts", "utf8")
    expect(declaration).not.toContain("createTreeSelect")
    expect(declaration).not.toContain("TreeSelectController")
    const api = readFileSync("demo/api/tree-select.json", "utf8")
    expect(api).toContain('"options"'); expect(api).not.toContain('"checkable"')
  })
})
