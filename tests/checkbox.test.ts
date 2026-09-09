import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createCheckboxGroup } from "../src/components/checkbox/index.js"
import type { CheckboxGroupController, CheckboxGroupOptions, CheckboxGroupChange } from "../src/components/checkbox/index.js"

const helpers: CheckboxGroupController[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "topics", options: CheckboxGroupOptions = { min: 1, max: 2 }) {
  const html = readFileSync(join("demo", "components", "checkbox.html"), "utf8")
  const parsed = new DOMParser().parseFromString(html, "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id) as HTMLFieldSetElement
  const helper = createCheckboxGroup(root, options)
  helpers.push(helper)
  const field = (id: string) => document.getElementById(id) as HTMLInputElement
  return { root, helper, field, form: document.getElementById("choices-form") as HTMLFormElement }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("native Checkbox and group ownership", () => {
  it("preserves native controls, label content, checked/default/value and listeners", () => {
    const { root, helper, field } = fixture()
    helper.disconnect()
    const alpha = field("alpha"), label = alpha.labels![0], span = label!.querySelector("span")
    alpha.checked = false; alpha.indeterminate = true
    const listener = vi.fn(); alpha.addEventListener("change", listener)
    helpers.push(createCheckboxGroup(root))
    expect(root.querySelector("#alpha")).toBe(alpha)
    expect(alpha.labels![0]).toBe(label)
    expect(label!.querySelector("span")).toBe(span)
    expect([alpha.checked, alpha.defaultChecked, alpha.indeterminate, alpha.value]).toEqual([false, true, true, "alpha"])
    alpha.click()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(root.hasAttribute("role")).toBe(false)
    expect(alpha.hasAttribute("aria-checked")).toBe(false)
  })
  it("does not register legacy checkbox tags", () => {
    const before = customElements.get("mui-checkbox")
    fixture()
    expect(customElements.get("mui-checkbox")).toBe(before)
  })
  it("guards duplicate root owners and supports recreation", () => {
    const { root, helper } = fixture()
    expect(() => createCheckboxGroup(root)).toThrow("owner")
    helper.disconnect(); helper.disconnect()
    helpers.push(createCheckboxGroup(root))
  })
  it("guards cross-module duplicate ownership", async () => {
    const { root } = fixture()
    vi.resetModules()
    const other = await import("../src/components/checkbox/index.js")
    expect(() => other.createCheckboxGroup(root)).toThrow("owner")
  })
  it("rejects missing legends, wrong types and missing real labels", () => {
    const { root, helper, field } = fixture()
    helper.disconnect()
    root.querySelector("legend")!.textContent = ""
    expect(() => createCheckboxGroup(root)).toThrow("legend")
    root.querySelector("legend")!.textContent = "Group"
    field("alpha").type = "radio"
    expect(() => createCheckboxGroup(root)).toThrow("checkbox")
    field("alpha").type = "checkbox"
    const alpha = field("alpha"); alpha.parentElement!.replaceWith(alpha)
    expect(() => createCheckboxGroup(root)).toThrow("label")
  })
  it.each(["", "alpha"])("rejects empty/duplicate native value %j", value => {
    const { root, helper, field } = fixture()
    helper.disconnect(); field("beta").value = value
    expect(() => createCheckboxGroup(root)).toThrow("unique")
  })
  it("requires explicit values rather than repeated native on defaults", () => {
    const { root, helper, field } = fixture()
    helper.disconnect(); field("beta").removeAttribute("value")
    expect(() => createCheckboxGroup(root)).toThrow("explicit")
  })
  it("requires the first native legend to name the group", () => {
    const { root, helper } = fixture()
    helper.disconnect()
    const legend = document.createElement("legend")
    root.prepend(legend)
    expect(() => createCheckboxGroup(root)).toThrow("legend")
  })
  it("ignores template content and separates nested groups including duplicate keys", () => {
    const { root, helper, field } = fixture("delivery", {})
    const inner = createCheckboxGroup(root.querySelector("fieldset")!); helpers.push(inner)
    expect(helper.state.values).toEqual(["mail", "external"])
    expect(inner.state.values).toEqual([])
    field("nested-mail").click()
    expect(helper.state.values).toEqual(["mail", "external"])
    expect(inner.state.values).toEqual(["mail"])
  })
})

describe("silent state and explicit native defaults", () => {
  it("setValues and refresh are silent and do not change defaults or mixed state", () => {
    const { root, helper, field } = fixture()
    const change = vi.fn(); root.addEventListener("change", change); root.addEventListener("mui:checkbox-group-change", change)
    field("beta").indeterminate = true
    helper.setValues(["beta"])
    expect(field("alpha").defaultChecked).toBe(true)
    expect(field("beta").defaultChecked).toBe(false)
    expect(field("beta").indeterminate).toBe(true)
    helper.refresh()
    expect(change).not.toHaveBeenCalled()
    expect(helper.state.values).toEqual(["beta"])
  })
  it.each([["missing"], ["alpha", "alpha"], [1], [null]])("rejects bad keys atomically: %j", (...keys) => {
    const { helper, field } = fixture()
    expect(() => helper.setValues(keys as string[])).toThrow()
    expect(field("alpha").checked).toBe(true)
    expect(field("beta").checked).toBe(false)
  })
  it("keeps DOM order and treats numeric-looking keys as native strings", () => {
    const { helper, field } = fixture()
    field("beta").value = "1"
    helper.refresh(); helper.setValues(["1", "alpha"])
    expect(helper.state.values).toEqual(["alpha", "1"])
  })
  it("supports empty groups without inventing controls or clamping state", () => {
    const { root, helper } = fixture()
    root.querySelector("#topic-items")!.replaceChildren()
    helper.refresh()
    expect(helper.state).toEqual({ values: [], min: 1, max: 2, withinLimits: false })
    helper.setValues([])
    expect(root.querySelectorAll("input")).toHaveLength(0)
  })
  it("direct checked writes need refresh for derived ARIA, not for native checkedness", async () => {
    const { helper, field } = fixture()
    field("beta").checked = true
    await flush()
    expect(field("gamma").getAttribute("aria-disabled")).toBeNull()
    expect(helper.state.values).toEqual(["alpha", "beta"])
    helper.refresh()
    expect(field("gamma").getAttribute("aria-disabled")).toBe("true")
  })
  it("includes disabled selected keys in state/limits, but not native submission", () => {
    const { helper, field, form } = fixture()
    helper.setValues(["alpha", "locked"])
    expect(helper.state.values).toEqual(["alpha", "locked"])
    field("beta").click()
    expect(field("beta").checked).toBe(false)
    expect(new FormData(form).getAll("topics")).toEqual(["alpha"])
    expect(field("alpha").disabled).toBe(false)
  })
  it("does not equate mixed with a submitted third value", () => {
    const { field, form } = fixture()
    const mixed = field("mixed")
    mixed.indeterminate = true
    expect(new FormData(form).get("mixed")).toBe("checked-mixed")
    mixed.checked = false
    expect(mixed.indeterminate).toBe(true)
    expect(new FormData(form).has("mixed")).toBe(false)
  })
})

describe("native activation and limits", () => {
  it("cancels forbidden min toggles using browser rollback, retaining mixed state", async () => {
    const { helper, field, root } = fixture()
    const alpha = field("alpha"); alpha.indeterminate = true
    const events = vi.fn(); root.addEventListener("input", events); root.addEventListener("change", events); root.addEventListener("mui:checkbox-group-change", events)
    alpha.click(); await flush()
    expect([alpha.checked, alpha.indeterminate]).toEqual([true, true])
    expect(helper.state.values).toEqual(["alpha"])
    expect(events).not.toHaveBeenCalled()
  })
  it("uses native label activation once; accepted input/change plus one group notification", async () => {
    const { root, field } = fixture()
    const events: string[] = [], details: CheckboxGroupChange[] = []
    field("beta").addEventListener("input", () => events.push("input"))
    field("beta").addEventListener("change", () => events.push("change"))
    root.addEventListener("mui:checkbox-group-change", event => { events.push("group"); details.push((event as CustomEvent).detail) })
    field("beta").labels![0]!.click(); await flush()
    expect(events).toEqual(["input", "change", "group"])
    expect(details).toEqual([{ values: ["alpha", "beta"], value: "beta", actionType: "check" }])
  })
  it("cancels max toggles and never disables a checked control for a min boundary", () => {
    const { helper, field, form } = fixture()
    field("beta").click(); field("gamma").click()
    expect(helper.state.values).toEqual(["alpha", "beta"])
    expect(field("gamma").checked).toBe(false)
    helper.setValues(["alpha"])
    expect(field("alpha").getAttribute("aria-disabled")).toBe("true")
    expect(field("alpha").disabled).toBe(false)
    expect(new FormData(form).getAll("topics")).toEqual(["alpha"])
  })
  it("reads actual pre-activated native state after silent unrefreshed writes", () => {
    const { field } = fixture()
    field("beta").checked = true
    field("gamma").indeterminate = true
    field("gamma").click()
    expect([field("gamma").checked, field("gamma").indeterminate]).toEqual([false, true])
  })
  it("respects a later author's click cancellation without dirty state or events", async () => {
    const { root, field } = fixture()
    const event = vi.fn(); root.addEventListener("mui:checkbox-group-change", event)
    field("beta").indeterminate = true
    root.addEventListener("click", e => e.preventDefault(), { once: true })
    field("beta").click(); await flush()
    expect(field("beta").checked).toBe(false)
    expect(field("beta").indeterminate).toBe(true)
    expect(event).not.toHaveBeenCalled()
  })
  it("permits repair of an out-of-bounds native state without enforcing constraints as validation", () => {
    const { helper, field } = fixture()
    helper.setValues([])
    expect(helper.state.withinLimits).toBe(false)
    expect(field("alpha").required).toBe(false)
    field("alpha").click()
    expect(helper.state.withinLimits).toBe(true)
    helper.setValues(["alpha", "beta", "gamma"])
    field("alpha").click()
    expect(helper.state.values).toEqual(["beta", "gamma"])
    expect(helper.state.withinLimits).toBe(true)
  })
  it.each([{ min: -1 }, { max: -1 }, { min: 3, max: 2 }, { max: 1.5 }, { min: NaN }, { max: Infinity }, { min: undefined }, { bogus: true }])("validates limits %j atomically", options => {
    const { helper } = fixture()
    expect(() => helper.setLimits(options)).toThrow()
    expect(helper.state.min).toBe(1)
    expect(helper.state.max).toBe(2)
  })
  it("supports zero and unlimited bounds and silent limit changes", () => {
    const { helper, field } = fixture()
    helper.setLimits({ min: 0, max: 0 }); helper.setValues([])
    field("alpha").click(); expect(field("alpha").checked).toBe(false)
    helper.setLimits({ max: null }); field("alpha").click()
    expect(field("alpha").checked).toBe(true)
  })
})

describe("form reset, refresh and disposal", () => {
  it("refreshes after native reset/defaultChecked without changing native mixed behavior", async () => {
    const { helper, field, form, root } = fixture()
    helper.setValues(["beta"])
    field("alpha").defaultChecked = false; field("gamma").defaultChecked = true
    field("alpha").indeterminate = true
    const events = vi.fn(); root.addEventListener("mui:checkbox-group-change", events)
    form.reset(); await flush()
    expect(helper.state.values).toEqual(["gamma"])
    expect(field("gamma").getAttribute("aria-disabled")).toBe("true")
    expect(field("alpha").indeterminate).toBe(true)
    expect(events).not.toHaveBeenCalled()
  })
  it("keeps a cancelled reset and its limit decoration", async () => {
    const { helper, field, form } = fixture()
    helper.setValues(["beta"])
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(helper.state.values).toEqual(["beta"])
    expect(field("beta").getAttribute("aria-disabled")).toBe("true")
  })
  it("follows independent external form ownership and changed form IDs", async () => {
    const { helper, field, form } = fixture("delivery", {})
    helper.setValues([])
    form.reset(); await flush()
    expect(helper.state.values).toEqual(["mail"])
    const other = document.getElementById("other-form") as HTMLFormElement
    other.id = "renamed"; field("external-choice").setAttribute("form", "renamed")
    other.reset(); await flush()
    expect(helper.state.values).toEqual(["mail", "external"])
  })
  it("preserves native disabled fieldsets and the first-legend exception", () => {
    const { root, helper, field } = fixture()
    root.disabled = true
    field("beta").click()
    expect(helper.state.values).toEqual(["alpha"])
    expect(field("alpha").disabled).toBe(false)
    field("legend-choice").click(); field("disabled-field").click()
    expect(field("legend-choice").checked).toBe(true)
    expect(field("disabled-field").checked).toBe(false)
  })
  it("adopts late authored children, changed values and removals on refresh", () => {
    const { helper, root, field } = fixture()
    const clone = (document.getElementById("topic-template") as HTMLTemplateElement).content.cloneNode(true)
    root.querySelector("#topic-items")!.append(clone)
    helper.refresh(); helper.setValues(["delta"])
    expect(helper.state.values).toEqual(["delta"])
    field("beta").value = "new-beta"; helper.refresh()
    expect(() => helper.setValues(["beta"])).toThrow("unknown")
    field("alpha").remove(); helper.refresh()
    expect(helper.state.values).toEqual(["delta"])
  })
  it("reports invalid late members, rejects explicit refresh/actions, then recovers", async () => {
    const { helper, root, field } = fixture()
    const error = vi.fn(); root.addEventListener("mui:checkbox-group-error", error)
    field("beta").value = "alpha"; await flush()
    expect(error).toHaveBeenCalledTimes(1)
    expect(helper.error).toMatch("unique")
    expect(() => helper.refresh()).toThrow("unique")
    field("gamma").click(); expect(field("gamma").checked).toBe(false)
    field("beta").value = "beta"; helper.refresh()
    expect(helper.error).toBeNull()
    field("gamma").click(); expect(field("gamma").checked).toBe(true)
  })
  it("reports an invalid native change before the mutation observer runs", () => {
    const { root, field } = fixture()
    const error = vi.fn(); root.addEventListener("mui:checkbox-group-error", error)
    field("beta").value = "alpha"
    field("beta").dispatchEvent(new Event("change", { bubbles: true }))
    expect(error).toHaveBeenCalledTimes(1)
  })
  it("restores only owned derived aria state and preserves checked/default/disabled", async () => {
    const { helper, field } = fixture()
    field("alpha").setAttribute("aria-disabled", "true")
    await flush()
    helper.setValues(["beta"])
    field("beta").disabled = true
    helper.disconnect()
    expect(field("alpha").getAttribute("aria-disabled")).toBe("true")
    expect(field("beta").getAttribute("aria-disabled")).toBeNull()
    expect(field("beta").checked).toBe(true)
    expect(field("beta").disabled).toBe(true)
    expect(field("alpha").defaultChecked).toBe(true)
  })
  it("honors author aria-disabled while bound without modifying submission disabledness", () => {
    const { helper, field } = fixture()
    field("beta").setAttribute("aria-disabled", "true")
    helper.refresh(); field("beta").click()
    expect(field("beta").checked).toBe(false)
    expect(field("beta").disabled).toBe(false)
  })
  it("disconnects removed roots and cancels queued group events", async () => {
    const { helper, root, field } = fixture()
    const changed = vi.fn(); root.addEventListener("mui:checkbox-group-change", changed)
    field("beta").click(); root.remove()
    await flush()
    expect(helper.connected).toBe(false)
    expect(changed).not.toHaveBeenCalled()
    expect(field("beta")).toBeNull()
    expect(() => helper.setValues([])).toThrow("disconnected")
  })
})
