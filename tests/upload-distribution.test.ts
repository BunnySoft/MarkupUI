import { checkSizeRecommendation } from "../scripts/size-policy.mjs"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("selected Upload distribution", () => {
  it.each(["esm", "classic"])("upgrades portable queue options and shares core in %s", format => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import {readFileSync} from "node:fs";
      import {JSDOM} from "jsdom";
      const {window}=new JSDOM("<!doctype html><form><m-upload multiple name='files'><m-upload-trigger>Browse</m-upload-trigger><m-upload-file-list></m-upload-file-list></m-upload></form>",{url:"http://localhost/",runScripts:"outside-only",pretendToBeVisual:true});
      for(const key of ["window","document","customElements","HTMLElement","MutationObserver","CustomEvent","Event"]) globalThis[key]=key==="window"?window:window[key];
      const impl=value=>value[Object.getOwnPropertySymbols(value).find(key=>key.description==="impl")];
      window.DataTransfer=class {
        constructor(){const input=document.createElement("input"); input.type="file"; this.files=input.files; this.items={add:file=>impl(this.files).push(impl(file))};}
      };
      const errors=[]; window.addEventListener("error",event=>errors.push(event.error));
      const upload=document.querySelector("m-upload"), form=document.querySelector("form");
      let calls=0;
      upload.options={transport:()=>{calls++; return {status:"finished"}},autoUpload:true};
      upload.label="Documents";
      let api,core;
      if(${JSON.stringify(format)}==="esm"){
        api=await import("./dist/markup-ui-upload.js"); core=await import("./dist/markup-ui-core.js");
      }else{
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8")); core=window.MarkupUICore;
        window.eval(readFileSync("./dist/markup-ui-upload.global.js","utf8")); api=window.MarkupUIUpload;
      }
      assert.deepEqual(Object.keys(api).sort(),["Upload","UploadDragger","UploadFileList","UploadTrigger","registerUpload"]);
      assert.ok(upload instanceof api.Upload); assert.ok(api.Upload.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-button"),undefined); assert.equal(customElements.get("m-form"),undefined);
      assert.equal(upload.enhancementError,null); assert.equal(upload.label,"Documents");
      upload.addFiles([new window.File(["local"],"test.txt")]); await upload.whenIdle();
      assert.equal(upload.files[0].status,"finished"); assert.equal(calls,1);
      assert.equal(new window.FormData(form).get("files").name,"test.txt");
      const native=upload.native, trigger=upload.querySelector("m-upload-trigger button");
      upload.remove(); form.append(upload); await new Promise(resolve=>setTimeout(resolve,10));
      assert.equal(upload.native,native); assert.equal(upload.querySelector("m-upload-trigger button"),trigger);
      assert.equal(upload.files[0].status,"pending"); assert.equal(calls,1);
      upload.disabled=true; assert.equal(trigger.matches(":disabled"),true);
      upload.disabled=false; upload.clear(); assert.equal(native.files.length,0);
      assert.equal(upload.hasAttribute("role"),false); assert.equal(upload.hasAttribute("tabindex"),false);
      assert.deepEqual(errors,[]); window.close(); console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })

  it("keeps complete queue behavior inside the core-only delivery and its original budgets", () => {
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      expect(manifest.componentPayloads.upload[format].dependencies).toEqual([`markup-ui-core${suffix}`])
      checkSizeRecommendation(manifest.componentPayloads.upload[format].runtimeGzipBytes, 11000, "upload-distribution.test.ts: manifest.componentPayloads.upload[format].runtimeGzipBytes")
      const map = JSON.parse(readFileSync(`dist/markup-ui-upload${suffix}.map`, "utf8"))
      expect(map.sources).toContain("../src/components/upload/upload.ts")
      expect(map.sources).not.toContain("../src/components/popover/position.ts")
    }
    const declaration = readFileSync("dist/components/upload/index.d.ts", "utf8")
    expect(declaration).not.toContain("createUpload")
    expect(declaration).not.toContain("UploadController")
    const api = JSON.parse(readFileSync("demo/api/upload.json", "utf8")).elements.find((item: { type: string }) => item.type === "Upload")
    expect(api.properties.options).toBeDefined()
    expect(api.properties.fileList).toBeUndefined(); expect(api.properties.action).toBeUndefined()
  })
})
