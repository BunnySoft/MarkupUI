import { readFileSync } from "node:fs"
import { join } from "node:path"
import { createContext, runInContext } from "node:vm"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Radio, RadioButton, RadioGroup, registerRadio } from "../src/components/radio/index.js"
import { ViewElement } from "../src/core/index.js"

const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "plans") {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "radio.html"), "utf8"), "text/html")
  // JSDOM groups by ancestor rather than explicit form owner; Chromium tests use the unmodified demo.
  parsed.getElementById("alternate")!.append(parsed.getElementById("external")!)
  parsed.querySelectorAll("form").forEach(form => form.reset())
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const root = document.getElementById(id) as RadioGroup
  root.refresh()
  const field = (id: string) => document.getElementById(id) as HTMLInputElement
  return { root, field, form: document.getElementById("subscription") as HTMLFormElement }
}
function addPeer(form: HTMLElement) {
  const label = document.createElement("label"), peer = document.createElement("input")
  peer.type = "radio"; peer.name = "plan"; peer.value = "outside"
  label.append(peer, "Outside peer"); form.append(label)
  return peer
}
function standalone(button = false) {
  const radio = document.createElement(button ? "m-radio-button" : "m-radio") as Radio
  radio.textContent = "Choice"; document.body.append(radio); radio.refresh()
  return radio
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Radio stylesheet contract", () => {
  const css = readFileSync(join("src", "components", "radio", "radio.css"), "utf8")
  it("keeps colors and size defaults private for inherited author tokens", () => {
    expect(css).not.toMatch(/--m-radio-[\w-]+\s*:/)
    for (const size of [14, 16, 18]) expect(css).toMatch(new RegExp(`--_m-radio-size:\\s*${size}px`))
    expect(css).toMatch(/data-m-theme="?dark"?/); expect(css).not.toContain("var(--m-text-primary")
    expect(css).toContain("[size=small]"); expect(css).toContain("[status=error]")
  })
  it("retains visible native circles, including RadioButton", () => {
    expect(css).toContain("accent-color:")
    expect(css).not.toMatch(/appearance\s*:|::before|::after|position:\s*absolute|pointer-events:\s*none|opacity:\s*0[;}]/)
  })
  it("keeps reference heights, spacing and final checked text inheritance", () => {
    for (const height of [28, 34, 40]) expect(css).toMatch(new RegExp(`--_m-radio-height:\\s*${height}px`))
    expect(css).not.toMatch(/text-decoration:\s*underline|font-weight:\s*650/)
    expect(css).toContain(".m-radio-button:has(>input:checked)>span{color:inherit}")
    expect(css).toContain(".m-radio-group__buttons{gap:4px}")
    expect(css).toMatch(/vertical-align:\s*top/)
  })
  it("retains forced-color focus and authored hidden-state safeguards", () => {
    expect(css).toMatch(/@media\s*\(forced-colors:\s*active\)/)
    expect(css).toMatch(/outline:\s*2px solid Highlight/)
    expect(css).toMatch(/m-radio\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
  })
  it("does not compound system disabled paint with button opacity in forced colors", () => {
    const forced = css.split(/@media\s*\(forced-colors:\s*active\)/)[1]!
    expect(forced).toMatch(/\.m-radio-button:has\(\s*>\s*input:disabled\)\s*\{\s*opacity:\s*1\s*;?\s*\}/)
    expect(css).toMatch(/opacity:\s*var\(--_m-radio-opacity,\s*\.5\)/)
  })
})

describe("canonical native radio elements", () => {
  it("registers only the three own-tag ViewElement constructors atomically", () => {
    for (const Type of [Radio, RadioGroup, RadioButton]) {
      expect(Object.hasOwn(Type, "tag")).toBe(true)
      expect(customElements.get(Type.tag)).toBe(Type)
      expect(ViewElement.prototype.isPrototypeOf(Type.prototype)).toBe(true)
    }
    const define = vi.fn()
    expect(() => registerRadio({ get: tag => tag === "m-radio-button" ? class extends HTMLElement {} : undefined, define })).toThrow("different")
    expect(define).not.toHaveBeenCalled()
    registerRadio()
    const names: string[] = []
    registerRadio({ get: () => undefined, define: name => { names.push(name) } })
    expect(names).toEqual(["m-radio", "m-radio-button", "m-radio-group"])
  })
  it("has no public controller facade, other-family constructor or text-input dependency", async () => {
    expect(Object.keys(await import("../src/components/radio/index.js")).sort()).toEqual(["Radio", "RadioButton", "RadioGroup", "registerRadio"])
    const js = readFileSync(join("dist", "markup-ui-radio.js"), "utf8")
    expect(js).toContain("./markup-ui-core.js"); expect(js).toContain("./markup-ui-native-radio.js")
    expect(js).not.toMatch(/m-checkbox|m-switch|m-input|createRate|native-input/)
  })
  it.each([false, true])("exposes native defaults without a host role or second control (button=%s)", button => {
    const radio = standalone(button)
    expect(radio.checked).toBe(false); expect(radio.defaultChecked).toBe(false)
    expect(radio.value).toBe("on"); expect(radio.name).toBe("")
    expect(radio.disabled).toBe(false); expect(radio.required).toBe(false)
    expect(radio.size).toBe("medium"); expect(radio.form).toBeNull()
    expect(radio.native.type).toBe("radio")
    expect(radio.querySelectorAll("input")).toHaveLength(1)
    expect(radio.querySelectorAll("button,[role],[tabindex]")).toHaveLength(0)
    expect(radio.hasAttribute("role")).toBe(false); expect(radio.tabIndex).toBe(-1)
  })
  it("retains authored input, label, content, attributes and listeners", () => {
    const { root, field } = fixture()
    const pro = field("pro"), label = pro.labels![0]!, content = label.querySelector("span")
    pro.checked = true; pro.setAttribute("aria-describedby", "plan-help")
    const before = pro.outerHTML, listener = vi.fn(); pro.addEventListener("change", listener)
    root.refresh(); root.remove(); document.body.append(root); root.refresh()
    expect(field("pro")).toBe(pro); expect(pro.labels![0]).toBe(label); expect(label.querySelector("span")).toBe(content)
    expect(pro.outerHTML).toBe(before); expect(pro.checked).toBe(true); expect(pro.defaultChecked).toBe(false)
    field("basic").click(); pro.click(); expect(listener).toHaveBeenCalledOnce()
  })
  it("keeps generated label and late authored content identity", async () => {
    const radio = standalone(), control = radio.native, label = control.labels![0]!
    const text = document.createElement("span"), listener = vi.fn()
    text.textContent = "More"; text.addEventListener("custom", listener); radio.append(text)
    await flush()
    expect(text.parentElement).toBe(label); expect(radio.native).toBe(control)
    text.dispatchEvent(new Event("custom")); expect(listener).toHaveBeenCalledOnce()
    radio.size = "large"; radio.checked = true; radio.remove(); document.body.append(radio); await flush()
    expect(radio.native).toBe(control); expect(control.labels![0]).toBe(label); expect(radio.checked).toBe(true)
  })
  it("adopts a native radio with an external for-label without cloning it", () => {
    document.body.innerHTML = '<label for="outside-label">Named</label><m-radio><input id="outside-label" type="radio"></m-radio>'
    const radio = document.querySelector<Radio>("m-radio")!, control = radio.native, label = control.labels![0]
    radio.refresh(); expect(radio.native).toBe(control); expect(control.labels![0]).toBe(label)
    label!.click(); expect(radio.checked).toBe(true)
  })
  it("replays pre-upgrade own properties and retains disconnected writes", () => {
    const radio = new Radio()
    radio.textContent = "Pre-upgrade"
    Object.defineProperty(radio, "checked", { configurable: true, value: true })
    Object.defineProperty(radio, "value", { configurable: true, value: "before" })
    document.body.append(radio); radio.refresh()
    expect(Object.hasOwn(radio, "checked")).toBe(false)
    expect(radio.checked).toBe(true); expect(radio.value).toBe("before"); expect(radio.defaultChecked).toBe(false)
    const control = radio.native
    radio.remove(); radio.checked = false; radio.value = "away"; radio.defaultChecked = true
    expect(radio.checked).toBe(false)
    document.body.append(radio); radio.refresh()
    expect(radio.native).toBe(control); expect(radio.value).toBe("away"); expect(radio.checked).toBe(false)
  })
  it("uses checked attributes as reset defaults instead of controlled live state", () => {
    const radio = standalone()
    radio.setAttribute("checked", ""); expect(radio.checked).toBe(true); expect(radio.defaultChecked).toBe(true)
    radio.checked = false; radio.removeAttribute("checked"); radio.setAttribute("checked", "")
    expect(radio.checked).toBe(false); expect(radio.defaultChecked).toBe(true)
  })
  it.each(["checked", "defaultChecked", "disabled", "required"])("validates boolean %s atomically", key => {
    const radio = standalone()
    expect(() => Reflect.set(radio, key, "false")).toThrow()
    expect(Reflect.get(radio, key)).toBe(false)
  })
  it("validates strings, sizes and native cardinality without replacements", () => {
    const radio = standalone(), control = radio.native
    expect(() => { radio.value = 1 as unknown as string }).toThrow()
    expect(() => { radio.name = null as unknown as string }).toThrow()
    expect(() => { radio.size = "huge" as "large" }).toThrow()
    expect(radio.value).toBe("on"); expect(radio.size).toBe("medium")
    const extra = document.createElement("input"); extra.type = "radio"; radio.append(extra)
    expect(() => radio.refresh()).toThrow("one"); extra.remove()
    control.type = "checkbox"; expect(() => radio.refresh()).toThrow("radio"); control.type = "radio"
    radio.setAttribute("role", "radio"); expect(() => radio.refresh()).toThrow("semantics")
    radio.removeAttribute("role"); radio.refresh(); expect(radio.native).toBe(control)
  })
  it("delegates focus, validity and activation to the actual input", () => {
    const radio = standalone(), events: string[] = []
    radio.required = true; expect(radio.validity.valueMissing).toBe(true)
    const invalid = vi.fn(); radio.native.addEventListener("invalid", invalid)
    expect(radio.checkValidity()).toBe(false); expect(invalid).toHaveBeenCalledOnce()
    radio.focus(); expect(document.activeElement).toBe(radio.native)
    radio.blur(); expect(document.activeElement).not.toBe(radio.native)
    radio.addEventListener("input", () => events.push("input")); radio.addEventListener("change", () => events.push("change"))
    radio.click(); expect(events).toEqual(["input", "change"]); expect(radio.reportValidity()).toBe(true)
    radio.setCustomValidity("Choose another"); expect(radio.validationMessage).toBe("Choose another")
    expect(radio.validity.customError).toBe(true); radio.setCustomValidity(""); expect(radio.checkValidity()).toBe(true)
  })
  it("leaves standalone same-name and native-peer exclusivity to the browser", () => {
    document.body.innerHTML = '<form><m-radio name="plain" value="a" checked>A</m-radio><m-radio-button name="plain" value="b">B</m-radio-button><label><input type="radio" name="plain" value="native">Native</label></form>'
    const a = document.querySelector<Radio>("m-radio")!, b = document.querySelector<RadioButton>("m-radio-button")!
    a.refresh(); b.refresh(); const native = document.querySelector<HTMLInputElement>("input[value=native]")!
    b.click(); expect(a.checked).toBe(false); expect(b.checked).toBe(true)
    native.checked = true; expect(b.checked).toBe(false)
    expect(new FormData(document.querySelector("form")!).get("plain")).toBe("native")
  })
})

describe("complete native group boundaries", () => {
  it("has native fieldset ownership, computed initial values and noninvented empty defaults", () => {
    const { root } = fixture()
    expect(root.native).toBeInstanceOf(HTMLFieldSetElement)
    expect(root.value).toBe("basic"); expect(root.name).toBe("plan")
    expect(root.size).toBe("medium"); expect(root.status).toBeNull(); expect(root.disabled).toBe(false)
    const empty = new RadioGroup(); empty.innerHTML = "<legend>Empty</legend>"
    document.body.append(empty); empty.refresh()
    expect([empty.value, empty.name, empty.form]).toEqual([null, null, null])
    empty.value = null; expect(() => { empty.value = "missing" }).toThrow("existing")
  })
  it("requires a native fieldset's named first legend and preserves semantics", () => {
    const { root } = fixture()
    const extra = document.createElement("legend"); root.native.prepend(extra)
    expect(() => root.refresh()).toThrow("legend"); extra.remove()
    root.native.setAttribute("role", "radiogroup"); expect(() => root.refresh()).toThrow("role")
    root.native.removeAttribute("role"); root.setAttribute("tabindex", "0")
    expect(() => root.refresh()).toThrow("semantics"); root.removeAttribute("tabindex"); root.refresh()
  })
  it("rejects late competing fieldsets rather than ignoring their content", () => {
    const { root } = fixture(), field = root.native, extra = document.createElement("fieldset")
    root.append(extra); expect(() => root.refresh()).toThrow("one native fieldset")
    extra.remove(); root.refresh(); expect(root.native).toBe(field); expect(root.error).toBeNull()
  })
  it("keeps replacement authored fieldset ownership distinct from generated chrome", () => {
    const root = new RadioGroup(); root.innerHTML = "<legend>Generated</legend>"
    document.body.append(root); root.refresh()
    const field = document.createElement("fieldset"), note = document.createElement("p")
    field.innerHTML = '<legend>Authored</legend><m-radio name="replacement" value="new" checked>New</m-radio>'
    note.textContent = "Outside the authored fieldset"
    root.replaceChildren(field, note); root.refresh()
    expect(root.native).toBe(field); expect(note.parentElement).toBe(root); expect(root.value).toBe("new")
  })
  it("requires a real label and native radio semantics", () => {
    const { root, field } = fixture(), pro = field("pro")
    pro.type = "checkbox"; expect(() => root.refresh()).toThrow("radio"); pro.type = "radio"
    pro.labels![0]!.querySelector("span")!.textContent = ""
    expect(() => root.refresh()).toThrow("label"); pro.labels![0]!.append("Fixed"); root.refresh()
  })
  it.each(["", "different"])("rejects invalid common name %j without renaming controls", name => {
    const { root, field } = fixture(); field("pro").name = name
    expect(() => root.refresh()).toThrow("name")
    expect(field("pro").name).toBe(name); expect(field("basic").name).toBe("plan")
    field("pro").name = "plan"; root.refresh()
  })
  it.each(["", "basic"])("rejects empty/duplicate native value %j and typed member writes", value => {
    const { root, field } = fixture(), radio = field("pro").closest("m-radio") as Radio
    expect(() => { radio.value = value }).toThrow("unique"); expect(radio.value).toBe("pro")
    field("pro").value = value; expect(() => root.refresh()).toThrow("unique")
    field("pro").value = "pro"; root.refresh()
  })
  it("rejects missing explicit group values without substituting on", () => {
    const { root, field } = fixture(); field("pro").removeAttribute("value")
    expect(() => root.refresh()).toThrow("explicit"); field("pro").value = "pro"; root.refresh()
  })
  it("allows same-name members with a different form owner", () => {
    const { root } = fixture()
    const external = document.getElementById("external") as RadioGroup; external.refresh()
    expect(root.value).toBe("basic"); expect(external.value).toBe("monthly")
    expect(root.form).not.toBe(external.form)
  })
  it("rejects mixed form owners and unresolved explicit targets", () => {
    const { root, field } = fixture()
    field("pro").setAttribute("form", "alternate"); expect(() => root.refresh()).toThrow("form owner")
    field("pro").setAttribute("form", "missing"); expect(() => root.refresh()).toThrow("resolve")
    field("pro").removeAttribute("form"); root.refresh()
  })
  it("rejects hidden/disabled and unmarked out-of-scope peers without renaming them", () => {
    const { root, form } = fixture(), peer = addPeer(form)
    peer.disabled = true; peer.hidden = true
    expect(() => root.refresh()).toThrow("out-of-scope"); expect(peer.name).toBe("plan")
    root.native.append(peer.parentElement!); expect(() => root.refresh()).toThrow("out-of-scope")
    peer.parentElement!.remove(); root.refresh()
  })
  it("separates nesting only when native names or forms differ", () => {
    const { root, field } = fixture(), inner = document.getElementById("billing") as RadioGroup
    inner.refresh(); field("bill-yearly").click()
    expect(inner.value).toBe("yearly"); expect(root.value).toBe("basic")
    field("bill-monthly").name = "plan"; field("bill-yearly").name = "plan"
    expect(() => root.refresh()).toThrow("out-of-scope"); expect(() => inner.refresh()).toThrow("out-of-scope")
    field("bill-monthly").name = "billing"; field("bill-yearly").name = "billing"
    root.refresh(); inner.refresh()
  })
  it("reports dynamic peer conflicts once while retaining actual native checkedness", async () => {
    const { root, field, form } = fixture(), errors = vi.fn()
    root.addEventListener("m:radio-group-error", errors)
    const peer = addPeer(form); await flush()
    expect(errors).toHaveBeenCalledOnce(); expect(root.error).toContain("out-of-scope")
    peer.click(); expect(field("basic").checked).toBe(false)
    expect(() => { root.value = "pro" }).toThrow("out-of-scope")
    expect(() => root.value).toThrow("out-of-scope"); expect(peer.checked).toBe(true)
    peer.parentElement!.remove(); root.refresh(); expect(root.value).toBeNull(); expect(root.error).toBeNull()
  })
  it("revalidates peer names anywhere in the native tree", async () => {
    const { root, form } = fixture(), peer = addPeer(form); peer.name = "separate"; root.refresh()
    const errors = vi.fn(); root.addEventListener("m:radio-group-error", errors)
    peer.name = "plan"; await flush(); expect(errors).toHaveBeenCalledOnce()
    peer.parentElement!.remove(); root.refresh()
  })
  it("validates no-form peers but not peers in a different native tree", () => {
    const { root } = fixture(); document.body.append(root); root.refresh(); expect(root.form).toBeNull()
    const host = document.createElement("div"); document.body.append(host)
    const shadow = host.attachShadow({ mode: "open" }), peer = document.createElement("input")
    peer.type = "radio"; peer.name = "plan"; shadow.append(peer); root.refresh()
    const conflict = addPeer(document.body); expect(() => root.refresh()).toThrow("out-of-scope")
    conflict.parentElement!.remove(); root.refresh()
  })
  it("rejects unsupported group sizes/statuses without mutating them", () => {
    const { root } = fixture()
    expect(() => { root.size = "huge" as "large" }).toThrow()
    expect(() => { root.status = "success" as "error" }).toThrow()
    expect(root.size).toBe("medium"); expect(root.status).toBeNull()
    root.size = "small"; root.status = "warning"; expect(root.getAttribute("size")).toBe("small")
  })
})

describe("native selection, defaults and event ordering", () => {
  it("lets labels select once and emits the group event after input/change", async () => {
    const { root, field } = fixture(), events: string[] = [], details: unknown[] = []
    field("pro").addEventListener("input", () => events.push("input")); field("pro").addEventListener("change", () => events.push("change"))
    const previous = vi.fn(); field("basic").addEventListener("change", previous)
    root.addEventListener("m:radio-group-change", event => { events.push("group"); details.push((event as CustomEvent).detail) })
    field("pro").labels![0]!.click(); await flush(); field("pro").click(); await flush()
    expect(root.value).toBe("pro"); expect(field("basic").checked).toBe(false)
    expect(events).toEqual(["input", "change", "group"]); expect(details).toEqual([{ value: "pro" }])
    expect(previous).not.toHaveBeenCalled()
  })
  it("keeps silent writes and clearing separate from defaults, validation, events and focus", () => {
    const { root, field } = fixture(), events = vi.fn()
    for (const type of ["input", "change", "m:radio-group-change"]) root.addEventListener(type, events)
    field("basic").focus(); root.value = "pro"
    expect(document.activeElement).toBe(field("basic")); expect(field("basic").defaultChecked).toBe(true)
    expect(field("pro").defaultChecked).toBe(false)
    root.value = null; expect(root.value).toBeNull(); expect(field("basic").validity.valueMissing).toBe(true)
    root.value = "pro"; expect(field("basic").validity.valueMissing).toBe(false); expect(events).not.toHaveBeenCalled()
  })
  it.each([true, false, 1, "", "unknown", undefined, ["pro"]])("rejects unknown or non-string value %j atomically", value => {
    const { root, field } = fixture()
    expect(() => { root.value = value as string }).toThrow("existing")
    expect(field("basic").checked).toBe(true); expect(field("pro").checked).toBe(false)
  })
  it("reads silent native writes immediately and does not manufacture events", async () => {
    const { root, field } = fixture(), change = vi.fn()
    root.addEventListener("m:radio-group-change", change); field("pro").checked = true
    expect(root.value).toBe("pro"); await flush(); expect(change).not.toHaveBeenCalled()
    expect(root.querySelectorAll("[aria-checked],[tabindex]")).toHaveLength(0)
  })
  it("leaves cancelled activation rollback to native behavior", async () => {
    const { root, field } = fixture(), change = vi.fn()
    root.addEventListener("m:radio-group-change", change)
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    field("pro").click(); await flush()
    expect(field("pro").checked).toBe(false); expect(change).not.toHaveBeenCalled()
    // JSDOM misses restoration of the previous peer; trusted Chromium covers complete rollback.
  })
  it("does not dirty the previously selected native peer during a nonnull group write", () => {
    const { root, field } = fixture()
    root.value = "pro"; field("basic").defaultChecked = false; field("basic").defaultChecked = true
    expect(field("basic").checked).toBe(true); expect(root.value).toBe("basic")
  })
  it("does not reapply stale group attributes after native writes or reconnect", async () => {
    const { root, field } = fixture()
    root.setAttribute("value", "pro"); expect(root.value).toBe("pro")
    field("basic").click(); expect(root.getAttribute("value")).toBe("pro")
    expect(root.value).toBe("basic")
    const parent = root.parentElement!; root.remove(); parent.append(root); await flush()
    expect(root.value).toBe("basic")
    root.value = null; root.refresh(); expect(root.value).toBeNull()
  })
  it("supports generated fieldsets, own-property replay, detached value writes and late members", () => {
    const root = new RadioGroup()
    root.innerHTML = '<legend>Generated</legend><m-radio name="generated" value="a" checked>A</m-radio><m-radio name="generated" value="b">B</m-radio>'
    Object.defineProperty(root, "value", { configurable: true, value: "b" })
    document.body.append(root); root.refresh()
    expect(root.value).toBe("b"); expect(Object.hasOwn(root, "value")).toBe(false)
    const field = root.native, control = root.querySelector<Radio>("m-radio")!.native
    root.remove(); root.value = "a"; document.body.append(root); root.refresh()
    expect(root.native).toBe(field); expect(root.value).toBe("a"); expect(root.querySelector<Radio>("m-radio")!.native).toBe(control)
    const late = new Radio(); late.textContent = "C"; late.name = "generated"; late.value = "c"; root.append(late)
    root.refresh(); root.value = "c"; expect(root.value).toBe("c")
  })
  it("supports empty groups and never auto-selects after removing a checked member", () => {
    const { root, field } = fixture()
    field("basic").closest("m-radio")!.remove(); root.refresh(); expect(root.value).toBeNull()
    root.querySelector("#plan-items")!.replaceChildren(); root.refresh()
    expect([root.value, root.name, root.form]).toEqual([null, null, null]); root.value = null
  })
  it("keeps disabled groups selected but excluded from native submission", () => {
    const { root, field, form } = fixture()
    root.disabled = true; field("pro").click(); expect(root.value).toBe("basic")
    root.value = "pro"; expect(root.value).toBe("pro"); expect(field("pro").disabled).toBe(false)
    expect(new FormData(form).has("plan")).toBe(false)
  })
  it("uses native first-legend effective disabledness", () => {
    const { field } = fixture()
    field("legend-radio").click(); expect(field("legend-radio").checked).toBe(true)
    field("disabled-radio").click(); expect(field("disabled-radio").checked).toBe(false)
    expect(field("disabled-radio").disabled).toBe(false)
    expect(field("disabled-radio").matches(":disabled")).toBe(true)
  })
  it("retains actual hidden radio options while ignoring template members", () => {
    const { root, form } = fixture()
    expect(() => { root.value = "team" }).toThrow()
    root.value = "hidden"; expect(new FormData(form).getAll("plan")).toEqual(["hidden"])
  })
})

describe("reset, dynamic ownership and lifecycle", () => {
  it("keeps defaults native before dirty state and resets current state silently", async () => {
    const { root, field, form } = fixture()
    field("pro").defaultChecked = true; expect(field("pro").checked).toBe(true)
    root.value = "basic"; field("basic").defaultChecked = false; expect(field("basic").checked).toBe(true)
    const change = vi.fn(); root.addEventListener("m:radio-group-change", change)
    form.reset(); await flush(); expect(root.value).toBe("pro"); expect(change).not.toHaveBeenCalled()
  })
  it("retains a cancelled reset without custom events", async () => {
    const { root, form } = fixture(); root.value = "pro"
    const change = vi.fn(); root.addEventListener("m:radio-group-change", change)
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush(); expect(root.value).toBe("pro"); expect(change).not.toHaveBeenCalled()
  })
  it("leaves multiple defaults and reordered reset winners to native order", async () => {
    const { root, field, form } = fixture()
    field("pro").defaultChecked = true; root.value = "basic"
    expect(field("basic").defaultChecked).toBe(true); expect(field("pro").defaultChecked).toBe(true)
    form.reset(); await flush(); expect(root.value).toBe("pro")
    root.querySelector("#plan-items")!.prepend(field("pro").closest("m-radio")!)
    form.reset(); await flush(); expect(root.value).toBe("basic")
  })
  it("follows external form reset and changed target IDs without overwriting associations", async () => {
    const { root, field, form } = fixture("external"); root.value = "yearly"
    form.reset(); await flush(); expect(root.value).toBe("yearly")
    const other = document.getElementById("alternate") as HTMLFormElement
    other.id = "renamed"; field("external-monthly").setAttribute("form", "renamed"); field("external-yearly").setAttribute("form", "renamed")
    root.refresh(); expect(root.form).toBe(other)
    other.reset(); await flush(); expect(root.value).toBe("monthly")
  })
  it("updates the common name without renaming other nested controls", () => {
    const { root, field } = fixture()
    for (const node of root.querySelectorAll<HTMLInputElement>("#plan-items input")) node.name = "renamed-plan"
    root.refresh(); expect(root.name).toBe("renamed-plan"); expect(field("bill-monthly").name).toBe("billing")
  })
  it("adopts late/reordered members, changes keys and retains native identity", () => {
    const { root, field } = fixture()
    root.querySelector("#plan-items")!.append((document.getElementById("plan-template") as HTMLTemplateElement).content.cloneNode(true))
    root.refresh(); root.value = "team"; expect(root.value).toBe("team")
    const pro = field("pro"); root.querySelector("#plan-items")!.prepend(pro.closest("m-radio")!)
    pro.value = "new-pro"; root.refresh(); expect(() => { root.value = "pro" }).toThrow()
    root.value = "new-pro"; expect(root.value).toBe("new-pro"); expect(field("pro")).toBe(pro)
  })
  it("reports invalid direct changes and recovers without overwriting native selection", () => {
    const { root, field } = fixture(), errors = vi.fn()
    root.addEventListener("m:radio-group-error", errors)
    field("pro").value = "basic"; field("pro").checked = true; field("pro").dispatchEvent(new Event("change", { bubbles: true }))
    expect(errors).toHaveBeenCalledOnce(); expect(root.error).toContain("unique")
    field("pro").value = "pro"; root.refresh(); expect(root.error).toBeNull(); expect(root.value).toBe("pro")
  })
  it("cancels queued notifications and releases ownership on disconnect, reconnecting once", async () => {
    const { root, field } = fixture(), events = vi.fn(), parent = root.parentElement!
    root.addEventListener("m:radio-group-change", events)
    const pro = field("pro"); pro.click(); pro.setAttribute("aria-describedby", "plan-help"); root.remove(); await flush()
    expect(events).not.toHaveBeenCalled(); expect(pro.checked).toBe(true)
    expect(pro.getAttribute("aria-describedby")).toBe("plan-help")
    root.value = "basic"; parent.append(root); root.refresh(); pro.click(); await flush()
    expect(events).toHaveBeenCalledOnce(); expect(root.value).toBe("pro"); expect(field("pro")).toBe(pro)
  })
  it("releases transferred members without retaining old ownership", async () => {
    const { root, field } = fixture(), moved = field("pro").closest("m-radio") as Radio
    const target = new RadioGroup(); target.innerHTML = "<legend>Transfer target</legend>"; document.body.append(target); target.refresh()
    moved.name = "transferred"; target.native.append(moved); root.refresh(); target.refresh()
    target.value = "pro"; await flush(); expect(target.value).toBe("pro"); expect(root.value).toBe("basic")
  })
})

describe("source API and selected delivery", () => {
  it("rejects duplicate or incompatible private native mechanics without replacement", () => {
    const source = readFileSync(join("dist", "markup-ui-native-radio.global.js"), "utf8")
    const context = createContext({})
    runInContext(source, context)
    expect(() => runInContext(source, context)).toThrow("already loaded")
    const incompatible = createContext({})
    runInContext('globalThis[Symbol.for("markup-ui.native-radio")] = false', incompatible)
    expect(() => runInContext(source, incompatible)).toThrow("already loaded")
    expect(runInContext('globalThis[Symbol.for("markup-ui.native-radio")]', incompatible)).toBe(false)
  })
  it("documents source-inherited native accessors/events without invented defaults", () => {
    const api = JSON.parse(readFileSync(join("demo", "api", "radio.json"), "utf8"))
    const radio = api.elements.find((element: { type: string }) => element.type === "Radio")
    const button = api.elements.find((element: { type: string }) => element.type === "RadioButton")
    const group = api.elements.find((element: { type: string }) => element.type === "RadioGroup")
    for (const element of [radio, button]) {
      expect(element.properties.checked.writable).toBe(true)
      expect(element.properties.size.default).toBe("medium")
      expect(element.events.map((event: { web: string }) => event.web)).toEqual(["input", "change", "invalid"])
      expect(element.properties.checked).not.toHaveProperty("default")
    }
    expect(group.properties.value).not.toHaveProperty("default")
    expect(group.properties.name.writable).toBe(false)
    expect(group.properties.form.writable).toBe(false)
    expect(group.events.map((event: { web: string }) => event.web)).toContain("m:radio-group-change")
    expect(group.events.find((event: { web: string }) => event.web === "m:radio-group-error").detail).toEqual({ message: "string" })
  })
  it("accounts for core and real shared mechanics while retaining all approved per-file caps", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./radio"]).toEqual({ types: "./dist/components/radio/index.d.ts", import: "./dist/markup-ui-radio.js" })
    expect(pkg.exports["./radio/style.css"]).toBe("./dist/markup-ui-radio.css")
    expect(pkg.exports).not.toHaveProperty("./native-radio")
    const manifest = JSON.parse(readFileSync(join("dist", "manifest.json"), "utf8"))
    for (const [format, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const payload = manifest.componentPayloads.radio[format]
      expect(payload.dependencies).toEqual([`markup-ui-core${suffix}`, `markup-ui-native-radio${suffix}`])
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(payload.runtimeBudget)
      expect(manifest.bundles[`markup-ui-radio${suffix}`].budget).toBe(3000)
      expect(manifest.componentPayloads.rate[format].dependencies).toEqual([`markup-ui-core${suffix}`, `markup-ui-native-radio${suffix}`])
    }
    expect(manifest.bundles["markup-ui-radio.css"].budget).toBe(1250)
    expect(manifest.componentPayloads.radio.cssGzipBytes).toBeLessThanOrEqual(1250)
  })
})
