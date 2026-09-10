import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRadioGroup } from "../src/components/radio/index.js"
import type { RadioGroupController, RadioGroupChange } from "../src/components/radio/index.js"

const helpers: RadioGroupController[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "plans") {
  const html = readFileSync(join("demo", "components", "radio.html"), "utf8")
  const parsed = new DOMParser().parseFromString(html, "text/html")
  // jsdom groups radios by ancestor form rather than explicit form owner. Keep its unit
  // fixture contained; the unmodified external-placement demo is accepted in Chromium.
  parsed.getElementById("alternate")!.append(parsed.getElementById("external")!)
  parsed.querySelectorAll("form").forEach(form => form.reset())
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id) as HTMLFieldSetElement
  const helper = createRadioGroup(root); helpers.push(helper)
  const field = (id: string) => document.getElementById(id) as HTMLInputElement
  return { root, helper, field, form: document.getElementById("subscription") as HTMLFormElement }
}
function addPeer(form: HTMLElement) {
  const label = document.createElement("label"), peer = document.createElement("input")
  peer.type = "radio"; peer.name = "plan"; peer.value = "outside"
  label.append(peer, "Outside peer"); form.append(label)
  return peer
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Radio stylesheet contract", () => {
  const css = readFileSync(join("src", "components", "radio", "radio.css"), "utf8")
  it("keeps theme, size and status defaults private for inherited author tokens", () => {
    expect(css).not.toMatch(/--mui-radio-[\w-]+\s*:/)
    for (const size of [14, 16, 18]) expect(css).toMatch(new RegExp(`--_mui-radio-size:\\s*${size}px`))
    expect(css).toMatch(/data-mui-theme="?dark"?/)
    expect(css).not.toContain("var(--mui-text-primary")
  })
  it("retains visible native circles, including the button variant", () => {
    expect(css).toContain("accent-color:")
    expect(css).not.toMatch(/appearance\s*:|::before|::after|position:\s*absolute|pointer-events:\s*none|opacity:\s*0[;}]/)
  })
  it("uses the reference button heights without synthetic checked-text decorations", () => {
    for (const height of [28, 34, 40]) expect(css).toMatch(new RegExp(`--_mui-radio-height:\\s*${height}px`))
    expect(css).not.toMatch(/text-decoration:\s*underline|font-weight:\s*650/)
    expect(css).toMatch(/input:checked\s*\+\s*span\s*\{[^}]*var\(--_mui-radio-tone\)/)
    expect(css).toMatch(/vertical-align:\s*top/)
  })
  it("retains forced-color focus and authored hidden-state safeguards", () => {
    expect(css).toMatch(/@media\s*\(forced-colors:\s*active\)/)
    expect(css).toMatch(/outline:\s*2px solid Highlight/)
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
  })
  it("does not compound system disabled paint with RadioButton opacity in forced colors", () => {
    const forcedColors = css.split(/@media\s*\(forced-colors:\s*active\)/)[1]?.split("@media print")[0] ?? ""
    expect(forcedColors).toMatch(/\.mui-radio-button:has\(\s*>\s*input:disabled\)\s*\{\s*opacity:\s*1\s*;?\s*\}/)
    expect(css).toMatch(/opacity:\s*var\(--_mui-radio-opacity,\s*\.5\)/)
  })
})

describe("authored Radio/RadioButton ownership", () => {
  it("keeps native control/label/content/attributes/listeners and pre-enhancement state", () => {
    const { root, helper, field } = fixture()
    helper.disconnect()
    const pro = field("pro"), label = pro.labels![0], content = label!.querySelector("span")
    pro.checked = true
    pro.setAttribute("aria-describedby", "plan-help")
    const attributes = pro.outerHTML
    const listener = vi.fn(); pro.addEventListener("change", listener)
    helpers.push(createRadioGroup(root))
    expect(root.querySelector("#pro")).toBe(pro)
    expect(pro.labels![0]).toBe(label)
    expect(label!.querySelector("span")).toBe(content)
    expect(pro.outerHTML).toBe(attributes)
    expect(pro.checked).toBe(true)
    expect(pro.defaultChecked).toBe(false)
    field("basic").click(); pro.click()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(pro.hasAttribute("aria-checked")).toBe(false)
    expect(root.hasAttribute("role")).toBe(false)
    expect(root.hasAttribute("tabindex")).toBe(false)
  })
  it("does not register or upgrade legacy radio tags", () => {
    const before = [customElements.get("mui-radio"), customElements.get("mui-radio-group")]
    fixture()
    expect([customElements.get("mui-radio"), customElements.get("mui-radio-group")]).toEqual(before)
  })
  it("uses native radios rather than buttons for RadioButton", () => {
    const { root, field } = fixture("layouts")
    expect(root.querySelectorAll("button,[role=radio]")).toHaveLength(0)
    expect(field("layout-grid").type).toBe("radio")
    field("layout-list").labels![0]!.click()
    expect(field("layout-grid").checked).toBe(false)
    expect(field("layout-list").checked).toBe(true)
  })
  it("guards duplicate and cross-module ownership and permits recreation", async () => {
    const { root, helper } = fixture()
    expect(() => createRadioGroup(root)).toThrow("owner")
    vi.resetModules()
    const other = await import("../src/components/radio/index.js")
    expect(() => other.createRadioGroup(root)).toThrow("owner")
    helper.disconnect(); helper.disconnect()
    helpers.push(other.createRadioGroup(root))
  })
  it("requires a native fieldset and named first legend", () => {
    const { root, helper } = fixture()
    helper.disconnect()
    expect(() => createRadioGroup(document.createElement("div") as HTMLFieldSetElement)).toThrow("fieldset")
    root.prepend(document.createElement("legend"))
    expect(() => createRadioGroup(root)).toThrow("legend")
  })
  it("requires a real label and native radio semantics", () => {
    const { root, helper, field } = fixture()
    helper.disconnect()
    field("pro").type = "checkbox"
    expect(() => createRadioGroup(root)).toThrow("radio")
    field("pro").type = "radio"
    const pro = field("pro"); pro.parentElement!.replaceWith(pro)
    expect(() => createRadioGroup(root)).toThrow("label")
  })
})

describe("complete native group boundaries", () => {
  it.each(["", "different"])("rejects invalid common name %j without renaming controls", name => {
    const { root, helper, field } = fixture()
    helper.disconnect(); field("pro").name = name
    expect(() => createRadioGroup(root)).toThrow("name")
    expect(field("pro").name).toBe(name)
    expect(field("basic").name).toBe("plan")
  })
  it.each(["", "basic"])("rejects empty/duplicate native value %j", value => {
    const { root, helper, field } = fixture()
    helper.disconnect(); field("pro").value = value
    expect(() => createRadioGroup(root)).toThrow("unique")
  })
  it("rejects missing explicit values, without substituting on", () => {
    const { root, helper, field } = fixture()
    helper.disconnect(); field("pro").removeAttribute("value")
    expect(() => createRadioGroup(root)).toThrow("explicit")
  })
  it("allows same-name peers owned by a different form", () => {
    const { helper } = fixture()
    expect(helper.state.value).toBe("basic")
    helpers.push(createRadioGroup(document.getElementById("external") as HTMLFieldSetElement))
  })
  it("rejects mixed form owners and unresolved explicit form targets", () => {
    const { root, helper, field } = fixture()
    helper.disconnect()
    field("pro").setAttribute("form", "alternate")
    expect(() => createRadioGroup(root)).toThrow("form owner")
    field("pro").setAttribute("form", "missing")
    expect(() => createRadioGroup(root)).toThrow("resolve")
  })
  it("rejects out-of-scope native peers, even disabled or hidden", () => {
    const { root, helper, form } = fixture()
    helper.disconnect()
    const peer = addPeer(form); peer.disabled = true; peer.hidden = true
    expect(() => createRadioGroup(root)).toThrow("out-of-scope")
    expect(peer.name).toBe("plan")
  })
  it("rejects unmarked native peers inside the visual fieldset", () => {
    const { root, helper, field } = fixture()
    helper.disconnect(); field("pro").removeAttribute("data-radio")
    expect(() => createRadioGroup(root)).toThrow("out-of-scope")
  })
  it("separates nested groups only when native names/forms really differ", () => {
    const { root, helper, field } = fixture()
    const nested = root.querySelector<HTMLFieldSetElement>("#billing")!
    const inner = createRadioGroup(nested); helpers.push(inner)
    field("bill-yearly").click()
    expect(inner.state.value).toBe("yearly")
    expect(helper.state.value).toBe("basic")
    field("bill-monthly").name = "plan"; field("bill-yearly").name = "plan"
    expect(() => helper.refresh()).toThrow("out-of-scope")
    expect(() => inner.refresh()).toThrow("out-of-scope")
  })
  it("reports dynamic outside conflicts while preserving actual native peer behavior", async () => {
    const { root, helper, field, form } = fixture()
    const errors = vi.fn(); root.addEventListener("mui:radio-group-error", errors)
    const peer = addPeer(form)
    await flush()
    expect(errors).toHaveBeenCalledTimes(1)
    expect(helper.error).toMatch("out-of-scope")
    peer.click()
    expect(peer.checked).toBe(true)
    expect(field("basic").checked).toBe(false)
    expect(() => helper.setValue("pro")).toThrow("out-of-scope")
    expect(peer.checked).toBe(true)
    peer.parentElement!.remove(); helper.refresh()
    expect(helper.error).toBeNull()
    expect(helper.state.value).toBeNull()
  })
  it("revalidates names anywhere in the native tree", async () => {
    const { root, helper, form } = fixture()
    const peer = addPeer(form); peer.name = "separate"
    helper.refresh()
    const errors = vi.fn(); root.addEventListener("mui:radio-group-error", errors)
    peer.name = "plan"; await flush()
    expect(errors).toHaveBeenCalledTimes(1)
    expect(() => helper.refresh()).toThrow("out-of-scope")
  })
  it("validates no-form peers but does not confuse a different native tree", () => {
    const { root, helper } = fixture()
    document.body.append(root)
    helper.refresh()
    expect(helper.state.form).toBeNull()
    const host = document.createElement("div"); document.body.append(host)
    const shadow = host.attachShadow({ mode: "open" })
    const peer = document.createElement("input"); peer.type = "radio"; peer.name = "plan"
    shadow.append(peer)
    helper.refresh()
    const conflict = addPeer(document.body)
    expect(() => helper.refresh()).toThrow("out-of-scope")
    conflict.parentElement!.remove(); helper.refresh()
  })
})

describe("native selection, current/default state and events", () => {
  it("lets native labels select exclusively and repeated clicks remain checked", async () => {
    const { root, helper, field } = fixture()
    const events: string[] = [], details: RadioGroupChange[] = []
    field("pro").addEventListener("input", () => events.push("input"))
    field("pro").addEventListener("change", () => events.push("change"))
    const oldChanged = vi.fn(); field("basic").addEventListener("change", oldChanged)
    root.addEventListener("mui:radio-group-change", event => { events.push("group"); details.push((event as CustomEvent).detail) })
    field("pro").labels![0]!.click(); await flush()
    field("pro").click(); await flush()
    expect(helper.state.value).toBe("pro")
    expect(field("basic").checked).toBe(false)
    expect(events).toEqual(["input", "change", "group"])
    expect(details).toEqual([{ value: "pro" }])
    expect(oldChanged).not.toHaveBeenCalled()
  })
  it("keeps silent setters/clear/defaults separate and does not move focus", () => {
    const { root, helper, field } = fixture()
    const events = vi.fn()
    for (const type of ["input", "change", "mui:radio-group-change"]) root.addEventListener(type, events)
    field("basic").focus()
    helper.setValue("pro")
    expect(document.activeElement).toBe(field("basic"))
    expect(field("basic").defaultChecked).toBe(true)
    expect(field("pro").defaultChecked).toBe(false)
    helper.setValue(null)
    expect(helper.state.value).toBeNull()
    expect(events).not.toHaveBeenCalled()
    expect(field("basic").validity.valueMissing).toBe(true)
    helper.setValue("pro")
    expect(field("basic").validity.valueMissing).toBe(false)
  })
  it.each([true, false, 1, "", "unknown", undefined])("rejects unknown or non-string key %j atomically", value => {
    const { helper, field } = fixture()
    expect(() => helper.setValue(value as string)).toThrow()
    expect(field("basic").checked).toBe(true)
    expect(field("pro").checked).toBe(false)
  })
  it("reads native checked property writes immediately, without dispatching events", async () => {
    const { root, helper, field } = fixture()
    const change = vi.fn(); root.addEventListener("mui:radio-group-change", change)
    field("pro").checked = true
    expect(helper.state.value).toBe("pro")
    await flush()
    expect(change).not.toHaveBeenCalled()
    expect(root.querySelectorAll("[aria-checked],[tabindex]")).toHaveLength(0)
  })
  it("matches unenhanced native cancellation without generating a group change", async () => {
    const { root, helper, field, form } = fixture()
    helper.disconnect()
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    field("pro").click()
    const baseline = [...root.querySelectorAll<HTMLInputElement>("#plan-items input")].find(node => node.checked)?.value ?? null
    form.reset()
    const enhanced = createRadioGroup(root); helpers.push(enhanced)
    const change = vi.fn(); root.addEventListener("mui:radio-group-change", change)
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    field("pro").click(); await flush()
    expect(field("pro").checked).toBe(false)
    // jsdom also misses restoration of the previously checked radio after cancellation;
    // compare its native baseline here, and verify actual rollback in Chromium.
    expect(enhanced.state.value).toBe(baseline)
    expect(change).not.toHaveBeenCalled()
  })
  it("supports an empty group and never auto-selects when a selected field is removed", () => {
    const { root, helper, field } = fixture()
    field("basic").parentElement!.remove(); helper.refresh()
    expect(helper.state.value).toBeNull()
    root.querySelector("#plan-items")!.replaceChildren(); helper.refresh()
    expect(helper.state).toEqual({ value: null, name: null, form: null })
    helper.setValue(null)
    expect(() => helper.setValue("missing")).toThrow("existing")
  })
  it("keeps all-disabled groups selected but excluded from submission", () => {
    const { root, helper, field, form } = fixture()
    root.disabled = true
    field("pro").click()
    expect(helper.state.value).toBe("basic")
    helper.setValue("pro")
    expect(helper.state.value).toBe("pro")
    expect(new FormData(form).has("plan")).toBe(false)
    expect(field("pro").disabled).toBe(false)
  })
  it("uses real hidden radio options and ignores template contents", () => {
    const { helper, form } = fixture()
    expect(() => helper.setValue("team")).toThrow()
    helper.setValue("hidden")
    expect(new FormData(form).getAll("plan")).toEqual(["hidden"])
  })
})

describe("reset, dynamic ownership and lifecycle", () => {
  it("keeps defaultChecked native before dirty state and resets dirty current state silently", async () => {
    const { root, helper, field, form } = fixture()
    field("pro").defaultChecked = true
    expect(field("pro").checked).toBe(true)
    helper.setValue("basic")
    field("basic").defaultChecked = false
    expect(field("basic").checked).toBe(true)
    const change = vi.fn(); root.addEventListener("mui:radio-group-change", change)
    form.reset(); await flush()
    expect(helper.state.value).toBe("pro")
    expect(change).not.toHaveBeenCalled()
  })
  it("retains a cancelled reset without custom events", async () => {
    const { root, helper, form } = fixture()
    helper.setValue("pro")
    const change = vi.fn(); root.addEventListener("mui:radio-group-change", change)
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(helper.state.value).toBe("pro")
    expect(change).not.toHaveBeenCalled()
  })
  it("leaves multiple checked defaults and reset order to the native group", async () => {
    const { helper, field, form, root } = fixture()
    field("pro").defaultChecked = true
    helper.setValue("basic")
    expect(field("basic").defaultChecked).toBe(true)
    expect(field("pro").defaultChecked).toBe(true)
    form.reset(); await flush()
    expect(helper.state.value).toBe("pro")
    root.querySelector("#plan-items")!.prepend(field("pro").parentElement!)
    form.reset(); await flush()
    expect(helper.state.value).toBe("basic")
  })
  it("follows external form reset and changed form IDs without overwriting association", async () => {
    const { helper, field, form } = fixture("external")
    helper.setValue("yearly")
    form.reset(); await flush()
    expect(helper.state.value).toBe("yearly")
    const other = document.getElementById("alternate") as HTMLFormElement
    other.id = "renamed"
    field("external-monthly").setAttribute("form", "renamed")
    field("external-yearly").setAttribute("form", "renamed")
    helper.refresh()
    expect(helper.state.form).toBe(other)
    other.reset(); await flush()
    expect(helper.state.value).toBe("monthly")
  })
  it("updates a group name without silently renaming individual controls", () => {
    const { helper, field, root } = fixture()
    for (const node of root.querySelectorAll<HTMLInputElement>("#plan-items input")) node.name = "renamed-plan"
    helper.refresh()
    expect(helper.state.name).toBe("renamed-plan")
    expect(field("bill-monthly").name).toBe("billing")
  })
  it("adopts late labels, reordered members and changed keys on explicit refresh", () => {
    const { root, helper, field } = fixture()
    root.querySelector("#plan-items")!.append((document.getElementById("plan-template") as HTMLTemplateElement).content.cloneNode(true))
    helper.refresh(); helper.setValue("team")
    expect(helper.state.value).toBe("team")
    const pro = field("pro"), label = pro.parentElement!
    root.querySelector("#plan-items")!.prepend(label)
    pro.value = "new-pro"; helper.refresh()
    expect(() => helper.setValue("pro")).toThrow()
    helper.setValue("new-pro")
    expect(helper.state.value).toBe("new-pro")
    expect(field("pro")).toBe(pro)
  })
  it("reports invalid immediate changes and recovers after a valid refresh", () => {
    const { root, helper, field } = fixture()
    const errors = vi.fn(); root.addEventListener("mui:radio-group-error", errors)
    field("pro").value = "basic"; field("pro").checked = true
    field("pro").dispatchEvent(new Event("change", { bubbles: true }))
    expect(errors).toHaveBeenCalledTimes(1)
    expect(helper.error).toMatch("unique")
    field("pro").value = "pro"; helper.refresh()
    expect(helper.error).toBeNull()
  })
  it("disposes observers/listeners/tasks without restoring native values or author attributes", async () => {
    const { root, helper, field } = fixture()
    const events = vi.fn(); root.addEventListener("mui:radio-group-change", events)
    field("pro").click()
    field("pro").setAttribute("aria-describedby", "plan-help")
    helper.disconnect(); await flush()
    expect(events).not.toHaveBeenCalled()
    expect(field("pro").checked).toBe(true)
    expect(field("pro").getAttribute("aria-describedby")).toBe("plan-help")
    expect(field("pro").hasAttribute("aria-checked")).toBe(false)
    expect(() => helper.setValue("basic")).toThrow("disconnected")
    field("basic").click()
    expect(field("basic").checked).toBe(true)
  })
  it("disconnects a removed root and cancels queued notifications", async () => {
    const { root, helper, field } = fixture()
    const event = vi.fn(); root.addEventListener("mui:radio-group-change", event)
    field("pro").click(); root.remove(); await flush()
    expect(helper.connected).toBe(false)
    expect(event).not.toHaveBeenCalled()
  })
})
