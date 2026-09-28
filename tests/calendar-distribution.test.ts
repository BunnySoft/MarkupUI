import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (file: string) => readFileSync(resolve("dist", file), "utf8")

describe("Calendar selected delivery", () => {
  it.each(["esm", "classic"])("uses one canonical owner in %s, with pre-upgrade properties and no sibling registration", format => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import {readFileSync} from "node:fs";
      import {JSDOM} from "jsdom";
      const {window} = new JSDOM("<!doctype html>", {url:"http://localhost/", runScripts:"outside-only"});
      for (const key of ["window","document","HTMLElement","customElements","CustomEvent","MutationObserver"]) globalThis[key] = key === "window" ? window : window[key];
      const registrations = [];
      const define = customElements.define.bind(customElements);
      customElements.define = (name, constructor, options) => { registrations.push(name); define(name, constructor, options); };
      const element = document.createElement("m-calendar");
      element.value = "2024-05";
      element.mode = "year";
      element.todayValue = "2024-05-10";
      document.body.append(element);
      let core, api;
      if (${JSON.stringify(format)} === "esm") {
        core = await import("./dist/markup-ui-core.js");
        api = await import("./dist/markup-ui-calendar.js");
      } else {
        assert.throws(() => window.eval(readFileSync("./dist/markup-ui-calendar.global.js","utf8")), /markup-ui-core.global.js/);
        assert.deepEqual(registrations, []);
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8"));
        core = window.MarkupUICore;
        window.eval(readFileSync("./dist/markup-ui-calendar.global.js","utf8"));
        api = window.MarkupUICalendar;
      }
      assert.deepEqual(Object.keys(api).sort(), ["Calendar","calendarModes","registerCalendar"]);
      assert.deepEqual(registrations, ["m-calendar"]);
      assert.ok(api.Calendar.prototype instanceof core.ViewElement);
      assert.equal(customElements.get("m-date-picker"), undefined);
      assert.equal(customElements.get("m-popover"), undefined);
      assert.equal(element.value, "2024-05");
      assert.equal(element.mode, "year");
      assert.equal(element.querySelectorAll("[data-calendar-day]").length, 12);
      assert.equal(Object.hasOwn(element,"value"), false);
      const table = element.table;
      let changed = 0;
      element.addEventListener("m:change", () => changed++);
      element.querySelector('[data-calendar-date="2024-08"]').click();
      assert.equal(element.value,"2024-08");
      assert.equal(changed,1);
      element.mode = "month";
      assert.equal(element.querySelectorAll("[data-calendar-day]").length,42);
      element.configure({min:"2024-08-10",max:"2024-08-20",getDayContent:value=>value==="2024-08-15"?"<b>Safe</b>":""});
      assert.equal(element.select("2024-08-09"),false);
      assert.equal(element.select("2024-08-15"),true);
      assert.equal(element.querySelector("b"),null);
      const button = element.querySelector('[data-calendar-date="2024-08-15"]');
      button.focus();
      button.dispatchEvent(new window.KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true}));
      assert.equal(element.state.focusedDate,"2024-08-16");
      assert.equal(document.activeElement.dataset.calendarDate,"2024-08-16");
      element.remove();
      assert.equal(element.connected,false);
      document.body.append(element);
      assert.equal(element.table,table);
      assert.equal(element.value,"2024-08-15");
      assert.equal(element.querySelectorAll("[data-calendar-controls]").length,1);
      element.querySelector('[data-calendar-date="2024-08-17"]').click();
      assert.equal(changed,3);
      element.remove();
      window.close();
      console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })

  it.each(["esm", "classic"])("rejects foreign Calendar registration in %s", format => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import assert from "node:assert/strict";
      import {readFileSync} from "node:fs";
      import {JSDOM} from "jsdom";
      const {window} = new JSDOM("<!doctype html>",{runScripts:"outside-only"});
      globalThis.HTMLElement=window.HTMLElement;
      globalThis.customElements=window.customElements;
      class Foreign extends HTMLElement {}
      customElements.define("m-calendar",Foreign);
      if (${JSON.stringify(format)} === "esm") {
        await assert.rejects(import("./dist/markup-ui-calendar.js"),/different implementation/);
      } else {
        window.eval(readFileSync("./dist/markup-ui-core.global.js","utf8"));
        assert.throws(()=>window.eval(readFileSync("./dist/markup-ui-calendar.global.js","utf8")),/different implementation/);
      }
      assert.equal(customElements.get("m-calendar"),Foreign);
      window.close();
      console.log("passed");
    `], { encoding: "utf8", stdio: "pipe", timeout: 15000 })
    expect(output.trim()).toBe("passed")
  })

  it("keeps mandatory behavior inside Calendar and imports only core", () => {
    const manifest = JSON.parse(read("manifest.json"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      expect(manifest.componentPayloads.calendar[format].dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(manifest.componentPayloads.calendar[format].runtimeGzipBytes).toBeLessThanOrEqual(11000)
      const map = JSON.parse(read(`markup-ui-calendar${suffix}.map`))
      expect(map.sources).toContain("../src/components/calendar/calendar.ts")
      expect(map.sources).toContain("../src/components/calendar/calendar-element.ts")
      expect(map.sources).toContain("../src/components/calendar/date.ts")
      expect(map.sources).not.toContain("../src/components/date-picker/native.ts")
      expect(map.sources).not.toContain("../src/components/date-picker/index.ts")
      expect(map.sources).not.toContain("../src/components/popover/index.ts")
      expect(map.sources).not.toContain("../src/core/view-element.ts")
    }
    expect(read("components/calendar/index.d.ts")).not.toMatch(/createCalendar|CalendarController|CalendarOptions/)
    const html = readFileSync("demo/components/calendar.html", "utf8")
    expect(html).not.toContain("createCalendar")
    const document = new DOMParser().parseFromString(html, "text/html")
    expect([...document.querySelectorAll("[data-demo-preview] *")].every(node => node.localName.startsWith("m-"))).toBe(true)
    const api = JSON.parse(readFileSync("demo/api/calendar.json", "utf8")).elements[0]
    expect(Object.keys(api.properties)).toEqual(expect.arrayContaining([
      "value", "defaultValue", "panel", "mode", "todayValue", "min", "max", "firstDayOfWeek", "disabled", "isDateDisabled", "getDayContent",
    ]))
    expect(api.properties.todayValue.description).toContain("Web attribute: today")
    expect(api.events.map(event => event.web).sort()).toEqual(["m:calendar-error", "m:calendar-panel-change", "m:change"])
  })
})
