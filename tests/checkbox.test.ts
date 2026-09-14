import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Checkbox, CheckboxGroup, registerCheckbox } from "../src/components/checkbox/index.js"
import * as api from "../src/components/checkbox/index.js"
import { ViewElement } from "../src/core/index.js"

const flush = () => new Promise(resolve => setTimeout(resolve, 15))
async function fixture(id = "topics") {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "checkbox.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  await flush()
  const root = document.getElementById(id) as CheckboxGroup
  const field = (id: string) => document.getElementById(id) as HTMLInputElement
  return { root, field, form: document.getElementById("choices-form") as HTMLFormElement }
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Checkbox stylesheet contract", () => {
  const css = readFileSync(join("src", "components", "checkbox", "checkbox.css"), "utf8")
  it("keeps geometry and inherited author tokens", () => {
    expect(css).not.toMatch(/--m-checkbox-[\w-]+\s*:/)
    for (const size of [14, 16, 18]) expect(css).toMatch(new RegExp(`--_m-checkbox-size:\\s*${size}px`))
    expect(css).toMatch(/data-m-theme="?dark"?/)
    expect(css).toMatch(/vertical-align:\s*top/)
    expect(css).toContain(":has(> input:disabled)")
    expect(css).not.toMatch(/:has\([^)]*aria-disabled/)
  })
  it("retains native appearance, keyboard focus, forced colors and hidden safety", () => {
    expect(css).toContain("accent-color:")
    expect(css).not.toMatch(/appearance\s*:|::before|::after|url\(|opacity:\s*0|pointer-events:\s*none/)
    expect(css).toMatch(/:focus-visible\s*\{[^}]*box-shadow:/)
    expect(css).toMatch(/@media\s*\(forced-colors:\s*active\)/)
    expect(css).toMatch(/outline:\s*2px solid Highlight/)
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
  })
})

describe("canonical Checkbox", () => {
  it("has own tags, shared ViewElement identity and no public controller API", () => {
    expect(Checkbox.prototype).toBeInstanceOf(ViewElement)
    expect(CheckboxGroup.prototype).toBeInstanceOf(ViewElement)
    expect(Object.hasOwn(Checkbox, "tag")).toBe(true)
    expect(Object.hasOwn(CheckboxGroup, "tag")).toBe(true)
    expect(customElements.get("m-checkbox")).toBe(Checkbox)
    expect(customElements.get("m-checkbox-group")).toBe(CheckboxGroup)
    expect(Object.keys(api).sort()).toEqual(["Checkbox", "CheckboxGroup", "registerCheckbox"])
    const define = vi.fn()
    expect(() => registerCheckbox({ get: name => name === "m-checkbox-group" ? class extends HTMLElement {} : undefined, define })).toThrow("different")
    expect(define).not.toHaveBeenCalled()
  })
  it("generates complete documentation without inventing native/group defaults", () => {
    const { elements } = JSON.parse(readFileSync(join("demo", "api", "checkbox.json"), "utf8"))
    const box = elements.find((element: { type: string }) => element.type === "Checkbox")
    const group = elements.find((element: { type: string }) => element.type === "CheckboxGroup")
    for (const property of ["native", "checked", "defaultChecked", "indeterminate", "value", "name", "disabled", "required", "form", "validity", "validationMessage", "willValidate", "size"]) expect(box.properties).toHaveProperty(property)
    expect(box.actions).toEqual(expect.arrayContaining(["focus", "blur", "click", "checkValidity", "reportValidity", "setCustomValidity", "refresh"]))
    expect(box.events.map((event: { web: string }) => event.web)).toEqual(["input", "change", "invalid"])
    expect(group.properties.value).not.toHaveProperty("default")
    expect(group.properties.native.attribute).toBeNull()
    expect(group.properties.min.default).toBe(0); expect(group.properties.max.default).toBeNull()
    expect(group.events.find((event: { web: string }) => event.web === "m:checkbox-group-change").detail).toEqual({ values: "string[]", value: "string", actionType: '"check" | "uncheck"' })
  })
  it("generates one native label/input around surviving phrasing and preserves resets", async () => {
    document.body.innerHTML = '<form><m-checkbox checked name="choice" value="yes"><span>Choose</span></m-checkbox></form>'
    const box = document.querySelector<Checkbox>("m-checkbox")!, span = box.querySelector("span")!
    const listener = vi.fn(); span.addEventListener("click", listener)
    await flush()
    expect(box.native.labels![0]!.contains(span)).toBe(true)
    expect(box.value).toBe("yes")
    expect([box.checked, box.defaultChecked, box.indeterminate, box.disabled, box.required]).toEqual([true, true, false, false, false])
    box.checked = false; box.indeterminate = true
    expect(box.defaultChecked).toBe(true)
    document.querySelector("form")!.reset()
    expect([box.checked, box.indeterminate]).toEqual([true, true])
    span.click()
    expect(listener).toHaveBeenCalledOnce()
    expect(box.querySelectorAll("input")).toHaveLength(1)
    expect(box.hasAttribute("tabindex") || box.hasAttribute("role")).toBe(false)
  })
  it("uses native absence defaults and native methods", async () => {
    const box = new Checkbox(); box.textContent = "Check"; document.body.append(box); await flush()
    expect([box.value, box.name, box.checked, box.defaultChecked, box.indeterminate, box.required, box.disabled, box.form]).toEqual(["on", "", false, false, false, false, false, null])
    expect(box.size).toBe("medium")
    box.required = true
    expect(box.validity.valueMissing).toBe(true)
    expect(box.willValidate).toBe(true)
    expect(box.checkValidity()).toBe(false)
    box.focus(); expect(document.activeElement).toBe(box.native)
    box.blur(); expect(document.activeElement).not.toBe(box.native)
    box.click(); expect(box.checked).toBe(true)
    box.setCustomValidity("Review")
    expect(box.validationMessage).toBe("Review")
    box.setCustomValidity(""); expect(box.reportValidity()).toBe(true)
  })
  it("adopts late phrasing into its generated label without cloning", async () => {
    const box = new Checkbox(); box.textContent = "Initial"; document.body.append(box); await flush()
    const span = document.createElement("span"), clicked = vi.fn(); span.textContent = "Late"; span.addEventListener("click", clicked)
    box.append(span); await flush()
    expect(box.native.labels![0]!.contains(span)).toBe(true)
    span.click(); expect(box.checked).toBe(true); expect(clicked).toHaveBeenCalledOnce()
  })
  it("preserves authored controls, labels, nodes, listeners and live native writes", async () => {
    const { field } = await fixture()
    const alpha = field("alpha"), box = alpha.closest<Checkbox>("m-checkbox")!, label = alpha.labels![0]!, span = label.querySelector("span")
    const changed = vi.fn(); alpha.addEventListener("change", changed)
    alpha.checked = false; alpha.indeterminate = true; alpha.value = "changed"; alpha.name = "native-name"
    box.size = "large"; box.refresh()
    expect(box.native).toBe(alpha)
    expect(alpha.labels![0]).toBe(label)
    expect(label.querySelector("span")).toBe(span)
    expect([box.checked, box.defaultChecked, box.indeterminate, box.value, box.name]).toEqual([false, true, true, "changed", "native-name"])
    box.click(); expect(changed).toHaveBeenCalledOnce()
    expect(alpha.hasAttribute("aria-checked")).toBe(false)
  })
  it("forwards only changed host attributes, not stale state on refresh/reconnect", async () => {
    const { field } = await fixture()
    const box = field("alpha").closest<Checkbox>("m-checkbox")!, parent = box.parentNode!
    box.setAttribute("name", "host")
    box.native.name = "native"; box.checked = false; box.defaultChecked = false
    box.remove(); parent.append(box); await flush()
    expect([box.name, box.checked, box.defaultChecked]).toEqual(["native", false, false])
    box.setAttribute("name", "new"); expect(box.name).toBe("new")
    box.setAttribute("checked", ""); expect(box.defaultChecked).toBe(true)
    expect(box.checked).toBe(false)
  })
  it.each(["checked", "defaultChecked", "indeterminate", "disabled", "required", "value", "name", "size"])("rejects invalid %s writes before mutations", async property => {
    const { field } = await fixture()
    const box = field("alpha").closest<Checkbox>("m-checkbox")!, before = box.outerHTML
    expect(() => Reflect.set(box, property, 12)).toThrow()
    expect(box.outerHTML).toBe(before)
    expect(box.checked).toBe(true)
  })
  it("replays pre-upgrade fields once and preserves their native defaults", async () => {
    const box = new Checkbox()
    box.innerHTML = '<label><input type="checkbox" checked value="native"><span>Late</span></label>'
    for (const [key, value] of Object.entries({ checked: false, indeterminate: true, value: "assigned", name: "late" })) Object.defineProperty(box, key, { value, writable: true, configurable: true })
    document.body.append(box)
    await flush()
    expect([box.checked, box.defaultChecked, box.indeterminate, box.value, box.name]).toEqual([false, true, true, "assigned", "late"])
    box.remove(); document.body.append(box); await flush()
    expect(box.querySelectorAll("input")).toHaveLength(1)
  })
})

describe("CheckboxGroup live ownership", () => {
  it("starts from prechecked native members and preserves nested ownership", async () => {
    const { root, field } = await fixture("delivery")
    const nested = document.getElementById("nested") as CheckboxGroup
    expect([root.value, root.min, root.max, root.withinLimits, root.status, root.size]).toEqual([["mail", "external"], 0, null, true, null, "small"])
    expect(nested.value).toEqual([])
    field("nested-mail").click(); expect(nested.value).toEqual(["mail"])
    expect(root.value).toEqual(["mail", "external"])
  })
  it("adopts generated-fieldset late members and preserves fieldset/legend identity", async () => {
    const root = new CheckboxGroup()
    root.innerHTML = "<legend>Generated</legend><m-checkbox value='a' checked>A</m-checkbox>"
    document.body.append(root); await flush()
    const fieldset = root.native, legend = fieldset.querySelector("legend")
    const late = new Checkbox(); late.value = "b"; late.checked = true; late.append("B")
    root.append(late); await flush()
    expect(root.value).toEqual(["a", "b"])
    expect(root.native).toBe(fieldset); expect(fieldset.querySelector("legend")).toBe(legend)
    expect(late.parentNode).toBe(fieldset)
  })
  it("hands moving members between nearest groups without stale ownership or ARIA", async () => {
    const { root, field } = await fixture()
    const nested = document.getElementById("nested") as CheckboxGroup
    const beta = field("beta").closest<Checkbox>("m-checkbox")!, inner = field("nested-mail").closest<Checkbox>("m-checkbox")!
    beta.checked = true
    nested.native.append(beta); await flush()
    expect(root.value).toEqual(["alpha"]); expect(nested.value).toEqual(["beta"])
    expect([root.error, nested.error]).toEqual([null, null])
    root.native.append(inner); await flush()
    expect([root.error, nested.error]).toEqual([null, null])
    inner.click(); expect(root.value).toEqual(["alpha", "mail"])
  })
  it("retains authored native presentation resources through host changes and reconnect", async () => {
    const { root, field } = await fixture()
    const box = field("alpha").closest<Checkbox>("m-checkbox")!, label = field("alpha").labels![0]!
    label.dataset.size = "large"; root.native.dataset.status = "warning"; root.native.dataset.size = "small"
    box.size = "small"; root.status = "error"; root.size = "large"; root.refresh()
    box.removeAttribute("size"); root.status = null; root.removeAttribute("size"); root.refresh()
    expect(label.dataset.size).toBe("large")
    expect([root.native.dataset.status, root.native.dataset.size]).toEqual(["warning", "small"])
  })
  it("rejects duplicate submission keys and checked writes in invalid groups before mutation", async () => {
    const { root, field } = await fixture()
    const box = field("beta").closest<Checkbox>("m-checkbox")!
    expect(() => { box.value = "alpha" }).toThrow("unique")
    expect(box.value).toBe("beta")
    field("beta").value = "alpha"
    expect(() => { box.checked = true }).toThrow("unique")
    expect(box.checked).toBe(false)
    field("beta").value = "beta"; root.refresh()
  })
  it("rejects invalid native structure, values and names without replacing nodes", async () => {
    const { root, field } = await fixture()
    const alpha = field("alpha"), legend = root.native.querySelector("legend")!
    legend.textContent = ""
    expect(() => root.refresh()).toThrow("legend"); legend.textContent = "Topics"
    alpha.type = "radio"; expect(() => root.refresh()).toThrow("checkbox"); alpha.type = "checkbox"
    field("beta").value = "alpha"; expect(() => root.refresh()).toThrow("unique")
    field("beta").removeAttribute("value"); expect(() => root.refresh()).toThrow("explicit")
    field("beta").value = "beta"; root.refresh()
    expect(field("alpha")).toBe(alpha)
  })
  it("supports native marked members with real labels and rejects an unlabelled one", async () => {
    const { root } = await fixture()
    root.native.insertAdjacentHTML("beforeend", '<input data-checkbox type="checkbox" value="unlabelled">')
    expect(() => root.refresh()).toThrow("label")
    root.native.lastElementChild!.remove()
  })
  it("writes silently without changing defaults/mixed and returns current DOM order", async () => {
    const { root, field } = await fixture()
    const events = vi.fn()
    for (const type of ["input", "change", "m:checkbox-group-change"]) root.addEventListener(type, events)
    field("beta").indeterminate = true; field("beta").value = "1"
    root.value = ["1", "alpha"]
    expect(root.value).toEqual(["alpha", "1"])
    expect([field("alpha").defaultChecked, field("beta").defaultChecked, field("beta").indeterminate]).toEqual([true, false, true])
    root.refresh(); await flush(); expect(events).not.toHaveBeenCalled()
  })
  it.each([["missing"], ["alpha", "alpha"], [1], [null], null])("rejects invalid selection atomically: %j", async keys => {
    const { root, field } = await fixture()
    const before = root.outerHTML
    expect(() => { root.value = keys as unknown as string[] }).toThrow()
    expect(field("alpha").checked).toBe(true); expect(field("beta").checked).toBe(false)
    expect(root.outerHTML).toBe(before)
  })
  it("includes disabled checked members in selection, not FormData", async () => {
    const { root, field, form } = await fixture()
    root.value = ["alpha", "locked"]; field("beta").click()
    expect(root.value).toEqual(["alpha", "locked"])
    expect(new FormData(form).getAll("topics")).toEqual(["alpha"])
    expect(field("alpha").disabled).toBe(false)
  })
  it("does not equate mixed with a submitted third value", async () => {
    const { field, form } = await fixture()
    field("mixed").indeterminate = true
    expect(new FormData(form).get("mixed")).toBe("checked-mixed")
    field("mixed").checked = false
    expect(field("mixed").indeterminate).toBe(true)
    expect(new FormData(form).has("mixed")).toBe(false)
  })
  it("observes late, reordered and removed members and explicit native value changes", async () => {
    const { root, field } = await fixture()
    const items = document.getElementById("topic-items")!
    items.append((document.getElementById("topic-template") as HTMLTemplateElement).content.cloneNode(true))
    await flush(); root.value = ["alpha", "delta"]
    items.prepend(field("delta").closest("m-checkbox")!); await flush()
    expect(root.value).toEqual(["delta", "alpha"])
    field("alpha").closest("m-checkbox")!.remove()
    field("beta").value = "new-beta"; await flush()
    expect(root.value).toEqual(["delta"])
    expect(() => { root.value = ["beta"] }).toThrow("unknown")
    items.replaceChildren(); await flush()
    expect(root.value).toEqual([]); expect(root.withinLimits).toBe(false)
    root.value = []; expect(root.querySelectorAll("input")).toHaveLength(0)
  })
  it("reads direct unrefreshed checked writes but updates derived ARIA only on refresh", async () => {
    const { root, field } = await fixture()
    field("beta").checked = true; await flush()
    expect(field("gamma").getAttribute("aria-disabled")).toBeNull()
    expect(root.value).toEqual(["alpha", "beta"])
    root.refresh(); expect(field("gamma").getAttribute("aria-disabled")).toBe("true")
  })
  it("replays pre-upgrade group selection rather than resetting prechecked children", async () => {
    const root = new CheckboxGroup()
    root.innerHTML = '<fieldset><legend>Late</legend><label><input data-checkbox type="checkbox" value="a" checked>A</label><label><input data-checkbox type="checkbox" value="b">B</label></fieldset>'
    for (const [key, value] of Object.entries({ value: ["b"], min: 0, max: 2 })) Object.defineProperty(root, key, { value, writable: true, configurable: true })
    document.body.append(root)
    await flush()
    expect(root.max).toBe(2)
    expect(root.value).toEqual(["b"])
    expect(root.native.querySelector("input")!.defaultChecked).toBe(true)
  })
})

describe("native activation and constraints", () => {
  it("cancels forbidden min/max activation with native mixed rollback and no extra events", async () => {
    const { root, field } = await fixture()
    const events = vi.fn()
    for (const type of ["input", "change", "m:checkbox-group-change"]) root.addEventListener(type, events)
    field("alpha").indeterminate = true; field("alpha").click(); await flush()
    expect([field("alpha").checked, field("alpha").indeterminate]).toEqual([true, true])
    expect(events).not.toHaveBeenCalled()
    root.value = ["alpha", "beta"]; field("gamma").indeterminate = true; field("gamma").click(); await flush()
    expect([field("gamma").checked, field("gamma").indeterminate]).toEqual([false, true])
    expect(events).not.toHaveBeenCalled()
  })
  it("uses native label activation once, with input/change before the group notification", async () => {
    const { root, field } = await fixture()
    const events: string[] = [], detail = vi.fn()
    field("beta").addEventListener("input", () => events.push("input"))
    field("beta").addEventListener("change", () => events.push("change"))
    root.addEventListener("m:checkbox-group-change", event => { events.push("group"); detail((event as CustomEvent).detail) })
    field("beta").labels![0]!.click(); await flush()
    expect(events).toEqual(["input", "change", "group"])
    expect(detail).toHaveBeenCalledWith({ values: ["alpha", "beta"], value: "beta", actionType: "check" })
  })
  it("honors later author cancellation and reads pre-activated live state", async () => {
    const { root, field } = await fixture()
    field("beta").indeterminate = true
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    field("beta").click(); await flush()
    expect([field("beta").checked, field("beta").indeterminate]).toEqual([false, true])
    field("beta").checked = true; field("gamma").click()
    expect(field("gamma").checked).toBe(false)
  })
  it("permits out-of-bounds writes and subsequent repair without native validation changes", async () => {
    const { root, field } = await fixture()
    root.value = []; expect(root.withinLimits).toBe(false)
    expect(field("alpha").required).toBe(false)
    field("alpha").click(); expect(root.withinLimits).toBe(true)
    root.value = ["alpha", "beta", "gamma"]; field("alpha").click()
    expect(root.value).toEqual(["beta", "gamma"]); expect(root.withinLimits).toBe(true)
    root.setLimits({ min: 0, max: 0 }); root.value = []; field("alpha").click()
    expect(field("alpha").checked).toBe(false)
    root.max = null; field("alpha").click(); expect(field("alpha").checked).toBe(true)
  })
  it.each([{ min: -1 }, { max: -1 }, { min: 3, max: 2 }, { max: 1.5 }, { min: NaN }, { max: Infinity }, { min: undefined }, { bogus: true }])("validates limits atomically: %j", async options => {
    const { root } = await fixture(), before = root.outerHTML
    expect(() => root.setLimits(options)).toThrow()
    expect([root.min, root.max]).toEqual([1, 2]); expect(root.outerHTML).toBe(before)
  })
})

describe("reset, fieldsets and disposal", () => {
  it("refreshes after native reset and respects cancellation and mixed presentation", async () => {
    const { root, field, form } = await fixture()
    root.value = ["beta"]; field("alpha").defaultChecked = false; field("gamma").defaultChecked = true
    field("alpha").indeterminate = true
    const events = vi.fn(); root.addEventListener("m:checkbox-group-change", events)
    form.reset(); await flush()
    expect(root.value).toEqual(["gamma"])
    expect(field("gamma").getAttribute("aria-disabled")).toBe("true")
    expect(field("alpha").indeterminate).toBe(true); expect(events).not.toHaveBeenCalled()
    root.value = ["beta"]; form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush(); expect(root.value).toEqual(["beta"])
  })
  it("follows external form ownership and changed IDs", async () => {
    const { root, field, form } = await fixture("delivery")
    root.value = []; form.reset(); await flush()
    expect(root.value).toEqual(["mail"])
    const other = document.getElementById("other-form") as HTMLFormElement
    other.id = "renamed"; field("external-choice").setAttribute("form", "renamed"); other.reset(); await flush()
    expect(root.value).toEqual(["mail", "external"])
  })
  it("preserves disabled fieldsets and the first-legend exception", async () => {
    const { root, field } = await fixture()
    root.disabled = true; field("beta").click()
    expect(root.value).toEqual(["alpha"]); expect(field("alpha").disabled).toBe(false)
    field("legend-choice").click(); field("disabled-field").click()
    expect(field("legend-choice").checked).toBe(true); expect(field("disabled-field").checked).toBe(false)
  })
  it("retains first-legend activation within the group's own disabled native fieldset", async () => {
    const group = new CheckboxGroup()
    group.innerHTML = '<fieldset disabled><legend><m-checkbox value="legend">Legend checkbox</m-checkbox></legend><m-checkbox value="body">Body checkbox</m-checkbox></fieldset>'
    document.body.append(group); await flush()
    const boxes = group.querySelectorAll<Checkbox>("m-checkbox")
    expect(group.disabled).toBe(true)
    boxes[0]!.click(); boxes[1]!.click()
    expect(group.value).toEqual(["legend"])
    expect(boxes[0]!.disabled).toBe(false); expect(boxes[1]!.disabled).toBe(false)
  })
  it("reports invalid late members then recovers", async () => {
    const { root, field } = await fixture()
    const error = vi.fn(); root.addEventListener("m:checkbox-group-error", error)
    field("beta").value = "alpha"; await flush()
    expect(error).toHaveBeenCalledOnce(); expect(root.error).toMatch("unique")
    expect(() => root.refresh()).toThrow("unique")
    field("gamma").click(); expect(field("gamma").checked).toBe(false)
    await flush()
    field("beta").value = "beta"; await flush()
    expect(root.error).toBeNull()
  })
  it("records explicit refresh errors without dispatching user events and keeps recovery observing", async () => {
    const { root, field } = await fixture()
    const changed = vi.fn(); root.addEventListener("m:checkbox-group-error", changed)
    field("beta").value = "alpha"
    expect(() => root.refresh()).toThrow("unique")
    expect(root.error).toContain("unique")
    expect(changed).not.toHaveBeenCalled()
    await flush()
    field("beta").value = "beta"; await flush()
    expect(root.error).toBeNull()
  })
  it("restores only derived ARIA and cancels pending events when removed", async () => {
    const { root, field } = await fixture()
    const alpha = field("alpha"), beta = field("beta")
    alpha.setAttribute("aria-disabled", "true"); await flush()
    root.value = ["beta"]; beta.disabled = true
    const events = vi.fn(); root.addEventListener("m:checkbox-group-change", events)
    const parent = root.parentNode!
    root.remove(); await flush()
    expect(alpha.getAttribute("aria-disabled")).toBe("true")
    expect(beta.getAttribute("aria-disabled")).toBeNull()
    expect([beta.checked, beta.disabled, alpha.defaultChecked]).toEqual([true, true, true])
    parent.append(root); await flush()
    expect(root.querySelector("#beta")).toBe(beta)
    beta.disabled = false; root.value = ["alpha"]; beta.click(); root.remove(); await flush()
    expect(events).not.toHaveBeenCalled()
  })
  it("honors authored aria-disabled without changing native submission disabledness", async () => {
    const { root, field } = await fixture()
    field("beta").setAttribute("aria-disabled", "true"); root.refresh(); field("beta").click()
    expect(field("beta").checked).toBe(false); expect(field("beta").disabled).toBe(false)
  })
})
