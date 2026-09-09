import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createSwitch } from "../src/components/switch/index.js"
import type { SwitchController, SwitchOptions } from "../src/components/switch/index.js"

const helpers: SwitchController[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "alerts-switch", options: SwitchOptions = {}) {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "switch.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id)!
  const helper = createSwitch(root, options); helpers.push(helper)
  return { root, helper, control: helper.control,
    indicator: root.querySelector<HTMLElement>("[data-switch-loading]")!,
    form: document.getElementById("settings") as HTMLFormElement }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("native Switch anatomy and binary state", () => {
  it("preserves the actual input, name, content, listeners, checked/default and ARIA", () => {
    const { root, helper, control } = fixture()
    helper.disconnect()
    const content = root.querySelector(".mui-switch__state")
    control.checked = false
    const before = control.outerHTML, listener = vi.fn()
    control.addEventListener("change", listener)
    const enhanced = createSwitch(root); helpers.push(enhanced)
    expect(enhanced.control).toBe(control)
    expect(root.querySelector(".mui-switch__state")).toBe(content)
    expect(control.outerHTML).toBe(before)
    expect(control.defaultChecked).toBe(true)
    expect(control.checked).toBe(false)
    root.click()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(root.hasAttribute("role")).toBe(false)
    expect(root.hasAttribute("tabindex")).toBe(false)
    expect(root.querySelectorAll("input")).toHaveLength(1)
  })
  it("leaves the legacy switch registry unchanged", () => {
    const before = customElements.get("mui-switch")
    fixture()
    expect(customElements.get("mui-switch")).toBe(before)
  })
  it("rejects duplicate and cross-module owners; disposal permits recreation", async () => {
    const { root, helper } = fixture()
    expect(() => createSwitch(root)).toThrow("owner")
    vi.resetModules()
    const other = await import("../src/components/switch/index.js")
    expect(() => other.createSwitch(root)).toThrow("owner")
    helper.disconnect(); helper.disconnect()
    helpers.push(other.createSwitch(root))
  })
  it.each(["radio", "text", "hidden"])("rejects %s controls", type => {
    const { root, helper, control } = fixture()
    helper.disconnect(); control.type = type
    expect(() => createSwitch(root)).toThrow("checkbox")
  })
  it("rejects duplicate aria-checked, missing switch role and wrapper roles", () => {
    const { root, helper, control } = fixture()
    helper.disconnect()
    control.setAttribute("aria-checked", "true")
    expect(() => createSwitch(root)).toThrow("aria-checked")
    control.removeAttribute("aria-checked"); control.removeAttribute("role")
    expect(() => createSwitch(root)).toThrow("role=switch")
    control.setAttribute("role", "switch"); root.setAttribute("role", "switch")
    expect(() => createSwitch(root)).toThrow("wrapper")
  })
  it("requires a stable accessible name separate from on/off decorations", () => {
    const { root, helper, control } = fixture()
    helper.disconnect()
    control.removeAttribute("aria-labelledby")
    expect(() => createSwitch(root)).toThrow("stable")
    const dynamic = root.querySelector(".mui-switch__on")!
    dynamic.id = "unstable-name"; control.setAttribute("aria-labelledby", dynamic.id)
    expect(() => createSwitch(root)).toThrow("stable")
  })
  it("rejects exposed or interactive visual decorations", () => {
    const { root, helper } = fixture()
    helper.disconnect()
    const state = root.querySelector(".mui-switch__state")!
    state.removeAttribute("aria-hidden")
    expect(() => createSwitch(root)).toThrow("aria-hidden")
    state.setAttribute("aria-hidden", "true")
    state.append(document.createElement("button"))
    expect(() => createSwitch(root)).toThrow("noninteractive")
  })
  it("rejects initial mixed state without silently rewriting it", () => {
    const { root, helper, control } = fixture()
    helper.disconnect(); control.indeterminate = true
    expect(() => createSwitch(root)).toThrow("binary")
    expect(control.indeterminate).toBe(true)
  })
  it("reports mixed property writes on refresh and permits explicit binary recovery", () => {
    const { helper, control } = fixture()
    control.indeterminate = true
    expect(() => helper.refresh()).toThrow("binary")
    expect(() => helper.setChecked(false)).toThrow("binary")
    expect(control.checked).toBe(true)
    control.indeterminate = false; helper.refresh()
    expect(helper.error).toBeNull()
  })
  it("rejects checkbox readonly instead of silently claiming native readonly behavior", () => {
    const { helper, control } = fixture()
    control.readOnly = true
    expect(() => helper.refresh()).toThrow("readonly")
    control.readOnly = false; helper.refresh()
    expect(helper.error).toBeNull()
  })
  it.each([{ loading: 1 }, { loading: undefined }, { value: true }, { checkedValue: "yes" }])("rejects unsupported options %j", options => {
    const { root, helper } = fixture()
    helper.disconnect()
    expect(() => createSwitch(root, options as SwitchOptions)).toThrow("loading")
  })
})

describe("loading uses native pre-activation rollback", () => {
  it("blocks native label toggles without changing checkedness/defaults or dispatching events", async () => {
    const { root, helper, control, indicator } = fixture()
    const events = vi.fn(); control.addEventListener("input", events); control.addEventListener("change", events)
    helper.setLoading(true)
    expect(indicator.hidden).toBe(false)
    expect(control.getAttribute("aria-busy")).toBe("true")
    expect(control.getAttribute("aria-disabled")).toBe("true")
    root.click(); await flush()
    expect(control.checked).toBe(true)
    expect(control.defaultChecked).toBe(true)
    expect(control.disabled).toBe(false)
    expect(events).not.toHaveBeenCalled()
  })
  it("keeps the focused native control present and submitted while busy", () => {
    const { helper, control, form } = fixture()
    control.focus(); helper.setLoading(true)
    expect(document.activeElement).toBe(control)
    expect(control.hidden).toBe(false)
    expect(control.disabled).toBe(false)
    expect(new FormData(form).getAll("alerts")).toEqual(["enabled"])
    helper.setLoading(false)
    expect(document.activeElement).toBe(control)
  })
  it("emits only the native input/change once after an accepted activation", async () => {
    const { root, helper, control } = fixture()
    const events: string[] = []
    for (const type of ["input", "change", "mui:change", "mui:switch-change"]) root.addEventListener(type, () => events.push(type))
    helper.setLoading(true); control.click()
    helper.setLoading(false); control.click(); await flush()
    expect(control.checked).toBe(false)
    expect(events).toEqual(["input", "change"])
  })
  it("handles rapid loading transitions and late author cancellation", async () => {
    const { root, helper, control } = fixture()
    for (let i = 0; i < 3; i++) { helper.setLoading(true); control.click(); helper.setLoading(false) }
    expect(control.checked).toBe(true)
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    control.click(); await flush()
    expect(control.checked).toBe(true)
  })
  it("respects immediate author busy/disabled writes before the observer runs", () => {
    const { helper, control } = fixture()
    control.setAttribute("aria-busy", "true"); control.click()
    expect(control.checked).toBe(true)
    helper.refresh(); expect(helper.loading).toBe(true)
    helper.setLoading(false); expect(helper.loading).toBe(true)
    control.removeAttribute("aria-busy"); helper.refresh()
    expect(helper.loading).toBe(false)
    control.setAttribute("aria-disabled", "true"); control.click()
    expect(control.checked).toBe(true)
  })
  it("preserves authored native disabled changes while loading is released", () => {
    const { helper, control } = fixture()
    helper.setLoading(true); control.disabled = true
    helper.setLoading(false)
    expect(control.disabled).toBe(true)
    control.click()
    expect(control.checked).toBe(true)
  })
  it("keeps inherited fieldset disabling native and never rewrites the child disabled property", () => {
    const { helper, control } = fixture("digest-switch")
    const fieldset = document.getElementById("preferences") as HTMLFieldSetElement
    fieldset.disabled = true; helper.setLoading(true); helper.setLoading(false)
    control.click()
    expect(control.checked).toBe(false)
    expect(control.disabled).toBe(false)
    fieldset.disabled = false; control.click()
    expect(control.checked).toBe(true)
  })
  it("supports the native first-legend fieldset exception", async () => {
    const { root, control, helper } = fixture("digest-switch")
    const fieldset = document.getElementById("preferences") as HTMLFieldSetElement
    fieldset.querySelector("legend")!.append(root); fieldset.disabled = true
    await flush()
    expect(control.matches(":disabled")).toBe(false)
    control.click(); expect(control.checked).toBe(true)
    helper.setLoading(true); control.click(); expect(control.checked).toBe(true)
  })
})

describe("checked/defaultChecked are not value/defaultValue", () => {
  it("keeps submission strings independent of current/reset booleans", async () => {
    const { helper, control, form } = fixture()
    helper.setChecked(false)
    control.defaultValue = "new-token"
    expect(control.value).toBe("new-token")
    expect(control.defaultChecked).toBe(true)
    expect(control.checked).toBe(false)
    expect(new FormData(form).has("alerts")).toBe(false)
    form.reset(); await flush()
    expect(control.checked).toBe(true)
    expect(new FormData(form).getAll("alerts")).toEqual(["new-token"])
  })
  it("permits silent programmatic checked changes while busy or disabled", () => {
    const { helper, control } = fixture()
    const events = vi.fn(); control.addEventListener("input", events); control.addEventListener("change", events)
    helper.setLoading(true); control.disabled = true
    helper.setChecked(false); helper.refresh()
    expect(control.checked).toBe(false)
    expect(control.defaultChecked).toBe(true)
    expect(events).not.toHaveBeenCalled()
  })
  it.each(["yes", 1, null, undefined])("rejects nonboolean state %j", value => {
    const { helper, control } = fixture()
    expect(() => helper.setChecked(value as boolean)).toThrow("boolean")
    expect(() => helper.setLoading(value as boolean)).toThrow("boolean")
    expect(control.checked).toBe(true)
  })
  it("does not observe .checked with property interception or fabricate user events", async () => {
    const { helper, control } = fixture()
    const event = vi.fn(); control.addEventListener("change", event)
    control.checked = false; await flush(); helper.refresh()
    expect(control.checked).toBe(false)
    expect(event).not.toHaveBeenCalled()
    expect(Object.hasOwn(control, "checked")).toBe(false)
  })
  it("retains native required validity and submits no unchecked token", () => {
    const { helper, control, form } = fixture("required-switch")
    expect(control.validity.valueMissing).toBe(true)
    helper.setChecked(true)
    expect(control.validity.valueMissing).toBe(false)
    expect(new FormData(form).getAll("consent")).toEqual(["yes"])
    helper.setChecked(false)
    expect(new FormData(form).has("consent")).toBe(false)
  })
})

describe("reset, external ownership and reversible busy state", () => {
  it("uses post-native reset and changed defaultChecked, without ending an owned loading request", async () => {
    const { helper, control, form, indicator } = fixture()
    control.defaultChecked = false; helper.setChecked(true); helper.setLoading(true)
    const events = vi.fn(); control.addEventListener("change", events)
    form.reset(); await flush()
    expect(control.checked).toBe(false)
    expect(helper.loading).toBe(true)
    expect(indicator.hidden).toBe(false)
    expect(events).not.toHaveBeenCalled()
  })
  it("does not implement a cancelled reset", async () => {
    const { helper, control, form } = fixture()
    helper.setChecked(false)
    form.addEventListener("reset", e => e.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(control.checked).toBe(false)
  })
  it("follows actual external form ownership and changed form IDs", async () => {
    const { helper, control, form } = fixture("external-switch")
    helper.setChecked(false); form.reset(); await flush()
    expect(control.checked).toBe(false)
    const other = document.getElementById("other-settings") as HTMLFormElement
    other.id = "renamed"; control.setAttribute("form", "renamed")
    other.reset(); await flush()
    expect(control.checked).toBe(true)
  })
  it("restores only owned attributes, including same-value author overrides", async () => {
    const { helper, control, indicator } = fixture()
    helper.setLoading(true)
    control.setAttribute("aria-disabled", "true")
    control.setAttribute("aria-busy", "true")
    indicator.hidden = true
    indicator.hidden = false
    await flush()
    helper.setChecked(false); helper.disconnect()
    expect(control.checked).toBe(false)
    expect(control.getAttribute("aria-busy")).toBe("true")
    expect(control.getAttribute("aria-disabled")).toBe("true")
    expect(indicator.hidden).toBe(false)
  })
  it("restores initial hidden/busy state without changing names, values, role or descriptions", () => {
    const { helper, control, indicator } = fixture()
    helper.setLoading(true); helper.disconnect()
    expect(indicator.hidden).toBe(true)
    expect(control.hasAttribute("aria-busy")).toBe(false)
    expect(control.hasAttribute("aria-disabled")).toBe(false)
    expect(control.getAttribute("role")).toBe("switch")
    expect(control.getAttribute("aria-describedby")).toBe("alerts-help")
    expect(control.value).toBe("enabled")
    expect(control.name).toBe("alerts")
  })
  it("reports late invalid anatomy, then recovers after author correction", async () => {
    const { root, helper, control } = fixture()
    const errors = vi.fn(); root.addEventListener("mui:switch-error", errors)
    control.readOnly = true; await flush()
    expect(errors).toHaveBeenCalledTimes(1)
    expect(helper.error).toMatch("readonly")
    control.readOnly = false; helper.refresh()
    expect(helper.error).toBeNull()
  })
  it("disconnects removed roots and restores busy state without touching native checkedness", async () => {
    const { root, helper, control, indicator } = fixture()
    helper.setLoading(true); root.remove(); await flush()
    expect(helper.connected).toBe(false)
    expect(control.checked).toBe(true)
    expect(control.hasAttribute("aria-busy")).toBe(false)
    expect(indicator.hidden).toBe(true)
    expect(() => helper.setLoading(false)).toThrow("disconnected")
    expect(() => helper.setChecked(false)).toThrow("disconnected")
  })
})
