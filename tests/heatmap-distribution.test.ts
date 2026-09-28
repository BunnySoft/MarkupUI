import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("selected Heatmap distribution", () => {
  it.each(["esm", "classic"])("maps pre-upgrade date data and preserves shared identity in %s", format => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict"; import {readFileSync} from "node:fs"; import {JSDOM} from "jsdom";
      const {window}=new JSDOM("<!doctype html><m-heatmap label='Activity'></m-heatmap>",{url:"http://localhost/",runScripts:"outside-only",pretendToBeVisual:true});
      for(const key of ["window","document","customElements","HTMLElement","MutationObserver","CustomEvent","Event"]) globalThis[key]=key==="window"?window:window[key];
      const errors=[]; window.addEventListener("error",event=>errors.push(event.error));
      const element=document.querySelector("m-heatmap");
      element.settings={domain:[-1,2],colorTheme:"blue",describe:()=>{
        assert.throws(()=>{element.data=[]},/reenter/); return "Activity";
      }};
      element.data=[{date:"2024-02-28",value:0},{date:"2024-03-01",value:4}];
      let api,core;
      if(${JSON.stringify(format)}==="esm"){
        api=await import("./dist/markup-ui-heatmap.js"); core=await import("./dist/markup-ui-core.js");
      }else{
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8")); core=window.MarkupUICore;
        window.eval(readFileSync("./dist/markup-ui-heatmap.global.js","utf8")); api=window.MarkupUIHeatmap;
      }
      assert.deepEqual(Object.keys(api).sort(),["Heatmap","buildHeatmap","heatmapLevel","registerHeatmap"]);
      assert.ok(element instanceof api.Heatmap); assert.ok(api.Heatmap.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-calendar"),undefined); assert.equal(customElements.get("m-chart"),undefined);
      element.settings={describe:null};
      assert.equal(element.state.cells,3); assert.equal(element.state.missingCount,1);
      assert.equal(element.model.cells.find(cell=>cell?.date==="2024-03-01").clamped,"high");
      element.explore("2024-02-29"); const table=element.native;
      element.remove(); document.body.append(element);
      assert.equal(element.native,table); assert.equal(element.state.currentDate,"2024-02-29");
      element.focus(); const button=document.activeElement;
      element.settings={loading:true}; assert.equal(document.activeElement,button);
      assert.equal(table.getAttribute("aria-busy"),"true");
      const model=element.model; assert.throws(()=>element.data=[{date:"2024-02-30"}]); assert.equal(element.model,model);
      assert.deepEqual(errors,[]); window.close(); console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })
  it("ships only core plus complete local behavior, with no Calendar registration", () => {
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      expect(manifest.componentPayloads.heatmap[format].dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(manifest.componentPayloads.heatmap[format].runtimeGzipBytes).toBeLessThanOrEqual(10500)
      const map = JSON.parse(readFileSync(`dist/markup-ui-heatmap${suffix}.map`, "utf8"))
      expect(map.sources).toContain("../src/components/heatmap/heatmap.ts")
      expect(map.sources).not.toContain("../src/components/calendar/calendar-element.ts")
    }
    const declaration = readFileSync("dist/components/heatmap/index.d.ts", "utf8")
    expect(declaration).not.toContain("createHeatmap")
    expect(declaration).not.toContain("HeatmapController")
  })
})
