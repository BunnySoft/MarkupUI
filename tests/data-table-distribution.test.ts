import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("selected Data Table distribution", () => {
  it.each(["esm", "classic"])("maps pre-upgrade schema/data and native forms in %s", format => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict"; import {readFileSync} from "node:fs"; import {JSDOM} from "jsdom";
      const {window}=new JSDOM("<!doctype html><form><m-data-table></m-data-table></form>",{url:"http://localhost/",runScripts:"outside-only",pretendToBeVisual:true});
      for(const key of ["window","document","customElements","HTMLElement","MutationObserver","CustomEvent","Event"]) globalThis[key]=key==="window"?window:window[key];
      const errors=[]; window.addEventListener("error",event=>errors.push(event.error));
      const element=document.querySelector("m-data-table"),form=document.querySelector("form");
      element.options={columns:[{key:"score",label:"Score",sort:"number"}],pageSizes:[1,2],pageSize:1,selection:{name:"keys",scope:"page"},
        summaries:[{key:"total",scope:"all",value:rows=>{assert.throws(()=>{element.data=[]},/preparation|reenter/);return String(rows.length)}}]};
      element.data=[{key:"a",values:[10]},{key:"b",values:[2],checked:true}];
      let api,core;
      if(${JSON.stringify(format)}==="esm"){
        api=await import("./dist/markup-ui-data-table.js"); core=await import("./dist/markup-ui-core.js");
      }else{
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8")); core=window.MarkupUICore;
        window.eval(readFileSync("./dist/markup-ui-data-table.global.js","utf8")); api=window.MarkupUIDataTable;
      }
      assert.deepEqual(Object.keys(api).sort(),["DataTable","dataTableSizes","registerDataTable"]);
      assert.ok(element instanceof api.DataTable); assert.ok(api.DataTable.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-table"),undefined); assert.equal(customElements.get("m-checkbox"),undefined);
      assert.deepEqual(Array.from(new window.FormData(form).getAll("keys")),["b"]);
      const table=element.native,row=table.tBodies[0].rows[0];
      element.set({sort:{key:"score",order:"ascending"}}); assert.deepEqual(Array.from(element.state.visibleKeys),["b"]);
      element.data=[{key:"a",values:[4]},{key:"b",values:[2],checked:true},{key:"c",values:[7]}];
      assert.equal(table.querySelector('[data-data-key="a"]'),row);
      const before=element.data; assert.throws(()=>element.data=[{key:"a",values:[NaN]}]); assert.equal(element.data,before);
      element.checkedKeys=["a"];element.remove();form.append(element);
      assert.equal(element.native,table);assert.deepEqual(Array.from(element.state.visibleKeys),["b"]);
      form.reset();await new Promise(resolve=>setTimeout(resolve,10));
      assert.deepEqual(Array.from(element.checkedKeys),["b"]);assert.equal(element.state.sort,null);
      assert.deepEqual(Array.from(element.state.visibleKeys),["a"]);
      assert.deepEqual(errors,[]);window.close();console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })
  it("retains core-only delivery, composed CSS and the original budgets", () => {
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      expect(manifest.componentPayloads["data-table"][format].dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(manifest.componentPayloads["data-table"][format].runtimeGzipBytes).toBeLessThanOrEqual(10000)
      expect(manifest.componentPayloads["data-table"][format].gzipBytes).toBeLessThanOrEqual(9000)
      const map = JSON.parse(readFileSync(`dist/markup-ui-data-table${suffix}.map`, "utf8"))
      expect(map.sources).not.toContain("../src/components/table/table.ts")
      expect(map.sources).not.toContain("../src/components/checkbox/checkbox.ts")
    }
    const declaration = readFileSync("dist/components/data-table/index.d.ts", "utf8")
    expect(declaration).not.toContain("createDataTable")
    expect(declaration).not.toContain("DataTableController")
    expect(readFileSync("demo/api/data-table.json", "utf8")).not.toContain('"pagination"')
  })
})
