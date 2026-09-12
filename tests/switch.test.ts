import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Switch, registerSwitch } from "../src/components/switch/index.js"
import { ViewElement } from "../src/core/index.js"
import { CheckboxGroup } from "../src/components/checkbox/index.js"
import { bind, createStore } from "../src/state/index.js"

const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "alerts-switch") {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "switch.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id) as Switch
  root.refresh()
  return { root, control: root.native, indicator: root.querySelector<HTMLElement>("[data-switch-loading]")!,
    form: document.getElementById("settings") as HTMLFormElement }
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Switch stylesheet contract", () => {
  const css = readFileSync(join("src", "components", "switch", "switch.css"), "utf8")
  it("keeps size, square and status defaults private for author overrides", () => {
    expect(css).not.toMatch(/--m-switch-[\w-]+\s*:/)
    for (const width of [32, 40, 48]) expect(css).toMatch(new RegExp(`--_sw-width:\\s*${width}px`))
    expect(css).toMatch(/data-m-theme="?dark"?/)
    expect(css).toContain("#2a947d")
    expect(css).not.toContain("var(--m-text-primary")
    expect(css).toContain("m-switch[size=small]")
    expect(css).toContain("m-switch[square]")
    expect(css).not.toContain("[data-size")
  })
  it("paints the original binary input with a border-box-aligned thumb", () => {
    expect(css).toMatch(/:not\(:indeterminate\)\s*\{[^}]*appearance:\s*none/)
    expect(css).toMatch(/background-origin:\s*border-box/)
    expect(css).not.toMatch(/position:\s*absolute|pointer-events:\s*none|opacity:\s*0[;}]/)
  })
  it("restores native paint and full opacity in forced colors and print", () => {
    const fallback = css.split(/@media\s*\(forced-colors:\s*active\),\s*print/)[1]?.split("@media print")[0] ?? ""
    for (const declaration of ["appearance:auto", "background:none", "box-shadow:none", "accent-color:auto", "opacity:1"]) {
      expect(fallback.replace(/\s+/g, "")).toContain(declaration)
    }
    expect(fallback).toMatch(/outline:\s*2px solid Highlight/)
  })
  it("retains disabled and reduced-motion policies without animation", () => {
    expect(css).toMatch(/input:disabled\s*\{\s*opacity:\s*\.5/)
    expect(css).not.toMatch(/(?:animation|transition)(?:-[a-z]+)?\s*:/)
  })
  it("preserves visible busy boundaries, RTL placement and hidden safety", () => {
    expect(css).toMatch(/\[aria-busy="?true"?\]\s*\{[^}]*border-style:\s*dashed;[^}]*border-color:/)
    expect(css).toMatch(/:dir\(rtl\):checked\s*\{[^}]*background-position:\s*2px/)
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
  })
})

describe("canonical Switch ownership and direct API", () => {
  it("registers only its own ViewElement and rejects conflicting definitions", () => {
    expect(Switch.prototype).toBeInstanceOf(ViewElement)
    expect(customElements.get("m-switch")).toBe(Switch)
    const define = vi.fn()
    registerSwitch({ get: () => undefined, define })
    expect(define.mock.calls.map(call => call[0])).toEqual(["m-switch"])
    expect(() => registerSwitch({ get: () => HTMLElement, define })).toThrow("different")
    expect(Object.hasOwn(Switch, "tag")).toBe(true)
  })
  it("preserves input, content, listeners, checked/default and native semantics", () => {
    const { root, control } = fixture()
    const content = root.querySelector(".m-switch__state"), events = vi.fn()
    control.checked = false; control.addEventListener("change", events)
    root.refresh()
    expect(root.native).toBe(control)
    expect(root.querySelector(".m-switch__state")).toBe(content)
    expect(root.defaultChecked).toBe(true)
    root.click()
    expect(root.checked).toBe(true)
    expect(events).toHaveBeenCalledOnce()
    expect(root.hasAttribute("role")).toBe(false)
    expect(root.hasAttribute("tabindex")).toBe(false)
    expect(root.querySelectorAll("[role=switch]")).toHaveLength(1)
  })
  it("generates one native owner around existing content and applies typed defaults", () => {
    const root = document.createElement("m-switch") as Switch
    const text = document.createElement("strong"); text.textContent = "Setting"; root.append(text)
    document.body.append(root); root.refresh()
    expect(root.native.labels?.[0]?.contains(text)).toBe(true)
    expect([root.checked, root.defaultChecked, root.disabled, root.required, root.loading, root.square]).toEqual(Array(6).fill(false))
    expect([root.value, root.defaultValue, root.name, root.size, root.status, root.error]).toEqual(["on", "", "", "medium", null, null])
    root.size = "large"; root.square = true; root.status = "warning"
    expect(root.getAttribute("size")).toBe("large")
    expect(() => { root.size = "huge" as "large" }).toThrow()
    expect(() => { root.status = "success" as "error" }).toThrow()
    root.status = null; expect(root.status).toBeNull()
  })
  it("replays pre-upgrade own properties without replacing authored input or dirty state", async () => {
    const root = new Switch()
    const input = document.createElement("input"); input.type = "checkbox"; input.defaultChecked = true; input.checked = false
    root.append(input, document.createTextNode("Pre-upgrade setting"))
    for (const [key, value] of Object.entries({ checked: false, value: "before", loading: true, size: "small" })) Object.defineProperty(root, key, { configurable: true, writable: true, value })
    document.body.append(root); await flush()
    expect(root.native).toBe(input)
    expect([root.checked, root.defaultChecked, root.value, root.loading, root.size]).toEqual([false, true, "before", true, "small"])
    expect(Object.hasOwn(root, "checked")).toBe(false)
    root.remove(); document.body.append(root); await flush()
    expect(root.native).toBe(input); expect(root.checked).toBe(false)
  })
  it.each(["radio", "text", "hidden"])("rejects %s controls", type => {
    const { root, control } = fixture(); control.type = type
    expect(() => root.refresh()).toThrow("checkbox")
  })
  it("rejects duplicate native controls, wrapper roles, duplicate checked ARIA and wrong roles", () => {
    const { root, control } = fixture()
    const other = document.createElement("input"); other.type = "checkbox"; root.append(other)
    expect(() => root.refresh()).toThrow("one native")
    other.remove(); root.setAttribute("role", "switch")
    expect(() => root.refresh()).toThrow("native checkbox")
    root.removeAttribute("role"); control.setAttribute("aria-checked", "true")
    expect(() => root.refresh()).toThrow("native checkbox")
    control.removeAttribute("aria-checked"); control.setAttribute("role", "checkbox")
    expect(() => root.refresh()).toThrow("native checkbox")
    control.setAttribute("role", "switch"); root.refresh(); expect(root.error).toBeNull()
  })
  it("requires stable labels and direct noninteractive hidden decorations", () => {
    const { root, control } = fixture(), state = root.querySelector(".m-switch__state")!
    state.removeAttribute("aria-hidden"); expect(() => root.refresh()).toThrow("aria-hidden")
    state.setAttribute("aria-hidden", "true"); state.append(document.createElement("button"))
    expect(() => root.refresh()).toThrow("noninteractive"); state.querySelector("button")!.remove()
    state.id = "dynamic"; control.setAttribute("aria-labelledby", "dynamic")
    expect(() => root.refresh()).toThrow("stable")
    control.setAttribute("aria-labelledby", "alerts-label"); root.refresh()
  })
  it("rejects mixed and readonly writes without inventing binary recovery or readonly support", () => {
    const { root, control } = fixture()
    control.indeterminate = true
    expect(() => root.refresh()).toThrow("binary")
    expect(() => { root.checked = false }).toThrow("binary")
    expect(root.checked).toBe(true); expect(control.indeterminate).toBe(true)
    control.indeterminate = false; control.readOnly = true
    expect(() => root.refresh()).toThrow("readonly")
    control.readOnly = false; root.refresh(); expect(root.error).toBeNull()
  })
  it.each(["yes", 1, null, undefined])("rejects nonboolean state %j", value => {
    const { root } = fixture()
    for (const property of ["checked", "defaultChecked", "disabled", "required", "loading", "square"]) {
      expect(() => { Reflect.set(root, property, value) }).toThrow()
    }
    expect(root.checked).toBe(true)
  })
  it.each([true, 1, null, undefined])("rejects nonstring native values %j", value => {
    const { root } = fixture()
    for (const property of ["value", "defaultValue", "name"]) expect(() => Reflect.set(root, property, value)).toThrow()
  })
})

describe("native loading, events, forms and reset", () => {
  it("blocks activation without changing defaults, focus, submission or emitting user events", () => {
    const { root, control, indicator, form } = fixture(), events = vi.fn()
    root.addEventListener("input", events); root.addEventListener("change", events)
    root.focus(); root.loading = true; control.labels![0]!.click()
    expect(root.checked).toBe(true); expect(root.defaultChecked).toBe(true)
    expect(indicator.hidden).toBe(false)
    expect(control.getAttribute("aria-busy")).toBe("true")
    expect(control.getAttribute("aria-disabled")).toBe("true")
    expect(root.disabled).toBe(false)
    expect(document.activeElement).toBe(control)
    expect(new FormData(form).get("alerts")).toBe("enabled")
    expect(events).not.toHaveBeenCalled()
    root.loading = false; expect(document.activeElement).toBe(control)
    root.blur(); expect(document.activeElement).not.toBe(control)
  })
  it("emits native click/input/change ordering once, with no compatibility events", () => {
    const { root, control } = fixture(), events: string[] = []
    for (const type of ["click", "input", "change", "m:change", "m:switch-change"]) control.addEventListener(type, () => events.push(type))
    root.loading = true; root.click(); root.loading = false; root.click()
    expect(events).toEqual(["click", "click", "input", "change"])
    expect(root.checked).toBe(false)
  })
  it("leaves rapid loading transitions and later author cancellation to native rollback", async () => {
    const { root } = fixture()
    for (let i = 0; i < 3; i++) { root.loading = true; root.click(); root.loading = false }
    expect(root.checked).toBe(true)
    root.addEventListener("click", event => event.preventDefault(), { once: true }); root.click(); await flush()
    expect(root.checked).toBe(true)
  })
  it("respects immediate author busy/disabled changes and retains own disabled flags", () => {
    const { root, control } = fixture()
    control.setAttribute("aria-busy", "true"); control.click()
    expect(root.checked).toBe(true); expect(root.loading).toBe(true)
    root.loading = false; expect(root.loading).toBe(true)
    control.removeAttribute("aria-busy"); root.refresh(); expect(root.loading).toBe(false)
    control.setAttribute("aria-disabled", "true"); control.click(); expect(root.checked).toBe(true)
    root.loading = true; root.disabled = true; root.loading = false
    expect(root.disabled).toBe(true)
  })
  it("retains fieldset disabling and the first-legend exception without child disabled writes", async () => {
    const { root, control } = fixture("digest-switch")
    const fieldset = document.getElementById("preferences") as HTMLFieldSetElement
    fieldset.disabled = true; root.loading = true; root.loading = false; root.click()
    expect(root.checked).toBe(false); expect(root.disabled).toBe(false)
    fieldset.querySelector("legend")!.append(root); await flush()
    expect(control.matches(":disabled")).toBe(false)
    root.click(); expect(root.checked).toBe(true)
    root.loading = true; root.click(); expect(root.checked).toBe(true)
  })
  it("keeps silent checked writes separate from submission strings, dirty state and reset defaults", async () => {
    const { root, control, form } = fixture(), events = vi.fn()
    control.addEventListener("change", events); root.loading = true; root.disabled = true
    root.checked = false; root.defaultValue = "new-token"
    expect(root.value).toBe("new-token")
    expect(root.defaultChecked).toBe(true); expect(root.checked).toBe(false)
    root.disabled = false; expect(new FormData(form).has("alerts")).toBe(false)
    form.reset(); await flush()
    expect(root.checked).toBe(true); expect(new FormData(form).get("alerts")).toBe("new-token")
    expect(root.loading).toBe(true); expect(events).not.toHaveBeenCalled()
    expect(Object.hasOwn(control, "checked")).toBe(false)
  })
  it("applies host native and ARIA attributes without controlling later live checkedness", () => {
    const { root, control } = fixture()
    root.checked = false; root.setAttribute("checked", ""); root.setAttribute("name", "renamed")
    root.setAttribute("value", "updated"); root.setAttribute("aria-describedby", "help")
    expect(root.checked).toBe(false); expect(root.defaultChecked).toBe(true)
    expect(control.name).toBe("renamed"); expect(root.value).toBe("updated")
    expect(control.getAttribute("aria-describedby")).toBe("help")
    root.removeAttribute("checked"); expect(root.defaultChecked).toBe(false)
  })
  it("keeps required validity and actions on the original native owner", () => {
    const { root, form } = fixture("required-switch"), invalid = vi.fn()
    root.native.addEventListener("invalid", invalid)
    expect(root.willValidate).toBe(true); expect(root.validity.valueMissing).toBe(true)
    expect(root.checkValidity()).toBe(false); expect(invalid).toHaveBeenCalledOnce()
    root.checked = true; expect(root.reportValidity()).toBe(true)
    expect(new FormData(form).get("consent")).toBe("yes")
    root.setCustomValidity("Local error"); expect(root.validationMessage).toBe("Local error")
    root.setCustomValidity(""); expect(root.checkValidity()).toBe(true)
    root.checked = false; expect(new FormData(form).has("consent")).toBe(false)
  })
  it("follows changed defaults, cancelled resets and actual external form IDs", async () => {
    const { root, form } = fixture("external-switch")
    root.checked = false; form.reset(); await flush(); expect(root.checked).toBe(false)
    const other = document.getElementById("other-settings") as HTMLFormElement
    other.id = "renamed"; root.setAttribute("form", "renamed")
    expect(root.form).toBe(other)
    other.addEventListener("reset", event => event.preventDefault(), { once: true })
    other.reset(); await flush(); expect(root.checked).toBe(false)
    other.reset(); await flush(); expect(root.checked).toBe(true)
    root.defaultChecked = false; root.checked = true; other.reset(); await flush()
    expect(root.checked).toBe(false)
  })
})

describe("lifecycle, ownership and state binding", () => {
  it("preserves same-value author overrides on busy cleanup", async () => {
    const { root, control, indicator } = fixture()
    root.loading = true
    control.setAttribute("aria-disabled", "true"); control.setAttribute("aria-busy", "true")
    indicator.hidden = true; indicator.hidden = false
    await flush(); root.checked = false; root.remove()
    expect(root.checked).toBe(false)
    expect(control.getAttribute("aria-busy")).toBe("true")
    expect(control.getAttribute("aria-disabled")).toBe("true")
    expect(indicator.hidden).toBe(false)
  })
  it("releases busy resources on disconnect but keeps disconnected writes and reconnect intent", async () => {
    const { root, control, indicator } = fixture(), parent = root.parentNode!, events = vi.fn()
    control.addEventListener("change", events); root.loading = true; root.remove(); await flush()
    expect(control.hasAttribute("aria-busy")).toBe(false); expect(indicator.hidden).toBe(true)
    expect(control.value).toBe("enabled"); expect(control.getAttribute("aria-describedby")).toBe("alerts-help")
    root.checked = false; root.value = "detached"; parent.append(root); await flush()
    expect(root.native).toBe(control); expect(root.checked).toBe(false); expect(root.loading).toBe(true)
    expect(indicator.hidden).toBe(false)
    root.loading = false; root.click(); expect(events).toHaveBeenCalledOnce()
    expect(root.querySelectorAll("input")).toHaveLength(1)
  })
  it("reports late invalid anatomy once and recovers after explicit correction", async () => {
    const { root, control } = fixture(), errors = vi.fn()
    root.addEventListener("m:switch-error", errors); control.readOnly = true; await flush()
    expect(errors).toHaveBeenCalledOnce(); expect(root.error).toContain("readonly")
    control.readOnly = false; root.refresh(); expect(root.error).toBeNull()
  })
  it("adopts late authored controls, decorations and labels without replacing their state or listeners", async () => {
    const root = document.createElement("m-switch") as Switch
    const label = document.createElement("span"); label.textContent = "Late setting"; root.append(label)
    document.body.append(root); root.refresh()
    const generated = root.native, input = document.createElement("input"), events = vi.fn()
    input.type = "checkbox"; input.defaultChecked = true; input.checked = false; input.value = "late"
    input.addEventListener("change", events); root.append(input); root.refresh()
    expect(root.native).toBe(input); expect(root.checked).toBe(false); expect(root.defaultChecked).toBe(true)
    expect(root.value).toBe("late"); expect(root.contains(label)).toBe(true); expect(root.contains(generated)).toBe(false)
    input.focus()
    const indicator = document.createElement("span")
    indicator.setAttribute("data-switch-loading", ""); indicator.setAttribute("aria-hidden", "true"); indicator.hidden = true
    root.append(indicator); await flush(); root.loading = true
    expect(document.activeElement).toBe(input); expect(indicator.hidden).toBe(false)
    root.loading = false; input.click(); expect(events).toHaveBeenCalledOnce()
  })
  it("adopts a late complete label/control without keeping an empty generated wrapper", () => {
    const root = new Switch(); root.textContent = "Surviving content"
    document.body.append(root); root.refresh(); const generated = root.native
    generated.focus()
    const label = document.createElement("label"), input = document.createElement("input")
    input.type = "checkbox"; label.append(input, " Authored label"); root.append(label); root.refresh()
    expect(root.native).toBe(input); expect(document.activeElement).toBe(input)
    expect(root.querySelectorAll("label")).toHaveLength(1); expect(root.contains(label)).toBe(true)
    expect(root.textContent).toContain("Surviving content")
  })
  it("does not let CheckboxGroup claim or block Switch even with an authored checkbox marker", () => {
    const { root, control } = fixture()
    const group = document.createElement("m-checkbox-group") as CheckboxGroup
    group.innerHTML = "<fieldset><legend>Choices</legend></fieldset>"
    group.max = 0; group.querySelector("fieldset")!.append(root); control.setAttribute("data-checkbox", "")
    document.body.append(group); group.refresh()
    expect(group.value).toEqual([]); expect(group.error).toBeNull()
    root.click(); expect(root.checked).toBe(false); root.click(); expect(root.checked).toBe(true)
    expect(group.value).toEqual([])
  })
  it("keeps boolean m-bind semantics and explicit native string value binding", () => {
    const { root } = fixture()
    root.setAttribute("m-bind", "enabled")
    const store = createStore({ enabled: false, token: "first" }), dispose = bind(root, store)
    expect(root.checked).toBe(false); root.click(); expect(store.get("enabled")).toBe(true)
    store.set("enabled", false); expect(root.checked).toBe(false); dispose()
    root.setAttribute("m-bind", "token"); root.setAttribute("m-bind-property", "value")
    const stop = bind(root, store)
    expect(root.value).toBe("first"); root.value = "second"; root.click()
    expect(store.get("token")).toBe("second"); stop()
  })
})

describe("Switch selected delivery and source API", () => {
  it("documents the complete direct API without a factory, false native defaults or runtime metadata", () => {
    const api = JSON.parse(readFileSync("demo\\api\\switch.json", "utf8"))
    const element = api.elements[0]
    expect(element.type).toBe("Switch")
    expect(Object.keys(element.properties)).toEqual(expect.arrayContaining(["native", "checked", "defaultChecked", "value", "defaultValue", "loading", "error", "form", "validity"]))
    expect(Object.values(element.events).map((event: unknown) => (event as { web: string }).web)).toEqual(expect.arrayContaining(["input", "change", "invalid", "m:switch-error"]))
    const source = readFileSync("src\\components\\switch\\switch.ts", "utf8")
    expect(source).not.toContain("createSwitch")
    expect(source).not.toContain("native-input")
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    expect(JSON.stringify(manifest)).toContain("markup-ui-switch.js")
    const esm = readFileSync("dist\\markup-ui-switch.js", "utf8")
    expect(esm).toContain("./markup-ui-core.js")
    expect(esm).not.toContain("native-radio")
  })
  it("accounts for core, both runtime formats and CSS without changing approved per-file ceilings", () => {
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./switch"]).toEqual({
      types: "./dist/components/switch/index.d.ts", import: "./dist/markup-ui-switch.js",
    })
    expect(pkg.exports["./switch/style.css"]).toBe("./dist/markup-ui-switch.css")
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]] as const) {
      const payload = manifest.componentPayloads.switch[format]
      const file = manifest.bundles[`markup-ui-switch${suffix}`], core = manifest.bundles[`markup-ui-core${suffix}`]
      expect(payload.dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(file.budget).toBe(3500); expect(file.gzipBytes).toBeLessThanOrEqual(file.budget)
      expect(payload.runtimeBudget).toBe(4500)
      expect(payload.runtimeGzipBytes).toBe(file.gzipBytes + core.gzipBytes)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + manifest.bundles["markup-ui-switch.css"].gzipBytes)
    }
    expect(manifest.bundles["markup-ui-switch.css"].budget).toBe(1250)
  })
})
