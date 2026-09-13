import { readFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Form, FormItem, FormItemGi } from "../src/components/form/index.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"
import type { FormItemOptions, FormValidator, FormValidatorResult } from "../src/components/form/index.js"
import { createInput } from "../src/components/native-input.js"
import { createRate } from "../src/components/rate/index.js"
import { Checkbox } from "../src/components/checkbox/index.js"
import { Switch } from "../src/components/switch/index.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(validator?: FormValidator, blur = false) {
  document.body.innerHTML = `<form id="test"><div class="m-form-item" id="item">
    <label for="first">First</label><input id="first" name="a.b[0]" value="seed" aria-describedby="help">
    <span id="help">Help</span><p id="feedback" hidden>Authored feedback</p></div>
    <label for="second">Second</label><input id="second" name="a.b[0]" value="other">
    <input id="required" name="required" required value="ok"><button name="intent" value="save">Save</button>
    <button id="draft" name="intent" value="draft" formnovalidate>Draft</button></form>
    <label for="external">External</label><input id="external" form="test" name='x&quot;]#' value="outside">
    <button id="outside" type="button">Outside</button>`
  const form = document.querySelector("form")!
  const first = document.querySelector<HTMLInputElement>("#first")!
  const second = document.querySelector<HTMLInputElement>("#second")!
  const external = document.querySelector<HTMLInputElement>("#external")!
  const feedback = document.querySelector<HTMLElement>("#feedback")!
  const element = document.querySelector<HTMLElement>("#item")!
  const options: FormItemOptions = { key: "a.b[0]", controls: [first, second], feedback, element }
  if (validator) options.validator = validator
  const helper = createForm(form, { items: [options], validateOnBlur: blur }); helpers.push(helper)
  return { helper, form, first, second, external, feedback, element }
}
function deferred() {
  let resolve!: (value: FormValidatorResult) => void, reject!: (error: unknown) => void
  const promise = new Promise<FormValidatorResult>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("canonical Form family", () => {
  function canonical() {
    document.body.innerHTML = `<m-form id="host"><form id="native" action="/save">
      <m-form-item key="name"><label class="m-form-item__label" for="name">Name</label>
        <input id="name" name="name" value="seed" required aria-describedby="help">
        <p id="feedback" class="m-form-item__feedback" hidden>Before</p></m-form-item>
      <input name="elsewhere" form="other" required><button name="intent" value="save">Save</button>
      </form></m-form><form id="other"></form>
      <m-form-item-gi key="outside" span="full"><label for="outside">Outside</label>
        <input id="outside" name="outside" form="native" required value="external">
        <p id="outside-error" class="m-form-item__feedback" hidden></p></m-form-item-gi>`
    const host = document.querySelector<Form>("m-form")!
    host.refresh()
    helpers.push(host)
    return { host, native: host.native, item: document.querySelector<FormItem>("m-form-item")!,
      field: document.querySelector<HTMLInputElement>("#name")!, outside: document.querySelector<HTMLInputElement>("#outside")! }
  }
  it("registers only three own-tag ViewElements and exposes no public factory/controller", async () => {
    const api = await import("../src/components/form/index.js")
    expect(Object.keys(api).sort()).toEqual(["Form", "FormItem", "FormItemGi", "registerForm"])
    for (const Type of [Form, FormItem, FormItemGi]) {
      expect(Object.hasOwn(Type, "tag")).toBe(true)
      expect(customElements.get(Type.tag)).toBe(Type)
    }
  })
  it("extracts inherited presentation, native events and real defaults without inventing native state", () => {
    const data = JSON.parse(readFileSync("demo\\api\\form.json", "utf8"))
    expect(data.elements.map((element: { type: string }) => element.type)).toEqual(["Form", "FormItem", "FormItemGi"])
    const [form, item, grid] = data.elements
    expect(form.properties.validateOnBlur.default).toBe(false)
    expect(form.properties.inline.default).toBe(false)
    expect(form.properties.size.default).toBeNull()
    expect(form.properties.labelPlacement.default).toBeNull()
    expect(form.properties.enctype.values.sort()).toEqual(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"])
    expect(form.properties.native).not.toHaveProperty("default")
    expect(form.properties.action).not.toHaveProperty("default")
    expect(item.properties.key.default).toBe("")
    expect(grid.properties.span).toMatchObject({ default: 1, min: 1, integer: true })
    expect(form.events.filter((event: { web: string }) => ["submit", "reset", "invalid"].includes(event.web))).toEqual(expect.arrayContaining([
      expect.objectContaining({ web: "submit", bubbles: true, cancelable: true, composed: false }),
      expect.objectContaining({ web: "reset", bubbles: true, cancelable: true, composed: false }),
      expect.objectContaining({ web: "invalid", bubbles: false, cancelable: true, composed: false }),
    ]))
  })
  it("retains native forms, labels, controls and actual external association", async () => {
    const { host, native, field, outside } = canonical(), label = field.labels![0]
    expect(host.elements).toBe(native.elements)
    expect((await host.validate()).status).toBe("valid")
    expect(new FormData(host.native).get("outside")).toBe("external")
    outside.value = ""
    const result = await host.validate()
    expect(result.issues.map(issue => issue.key)).toEqual(["outside"])
    expect(host.native).toBe(native); expect(field.labels![0]).toBe(label)
    expect(document.querySelectorAll("#host form")).toHaveLength(1)
    expect(host.hasAttribute("role")).toBe(false)
  })
  it("retains defaults, typed native properties and does not coerce invalid values", () => {
    const host = new Form()
    expect(host.method).toBe("get"); expect(host.enctype).toBe("application/x-www-form-urlencoded")
    expect(host.autocomplete).toBe(host.native.autocomplete); expect(host.noValidate).toBe(false)
    expect(host.target).toBe(""); expect(host.items).toBeNull(); expect(host.validateOnBlur).toBe(false)
    host.action = "/post"; host.method = "post"; host.enctype = "multipart/form-data"
    host.target = "frame"; host.noValidate = true; host.autocomplete = "off"
    expect(host.native.getAttribute("action")).toBe("/post"); expect(host.native.method).toBe("post")
    for (const [key, value] of [["method", "put"], ["enctype", "json"], ["autocomplete", "maybe"], ["noValidate", "false"], ["action", null]]) {
      expect(() => Reflect.set(host, key, value)).toThrow()
    }
    expect(host.method).toBe("post")
    expect(() => { const item = new FormItemGi(); item.span = 0 }).toThrow()
  })
  it("adopts late native content without cloning or replacing current control defaults/listeners", async () => {
    const host = new Form()
    host.method = "post"; host.action = "/saved"
    const input = document.createElement("input"), listener = vi.fn()
    input.defaultValue = "default"; input.value = "dirty"; input.addEventListener("input", listener)
    host.append(input); document.body.append(host); host.refresh()
    const generated = host.native
    input.focus()
    const authored = document.createElement("form"); authored.id = "late"
    authored.setAttribute("data-app", "preserve"); host.append(authored); host.refresh()
    expect(host.native).toBe(authored); expect(host.querySelectorAll("form")).toHaveLength(1)
    expect(generated.isConnected).toBe(false); expect(authored.method).toBe("post")
    expect(authored.getAttribute("action")).toBe("/saved"); expect(authored.getAttribute("data-app")).toBe("preserve")
    expect(input.value).toBe("dirty"); expect(input.defaultValue).toBe("default"); expect(document.activeElement).toBe(input)
    input.dispatchEvent(new Event("input")); expect(listener).toHaveBeenCalledOnce()
    host.remove(); document.body.append(host); await flush()
    expect(host.native).toBe(authored); expect(host.connected).toBe(true)
  })
  it("replays pre-upgrade properties and preserves authored native owner attributes", async () => {
    const host = new Form()
    host.innerHTML = '<form id="pre" target="authored"><input name="a" value="initial"></form>'
    for (const [name, value] of [["method", "post"], ["noValidate", true], ["validateOnBlur", true]]) {
      Object.defineProperty(host, name, { value, configurable: true, writable: true })
    }
    document.body.append(host); await flush()
    expect(host.native.id).toBe("pre"); expect(host.method).toBe("post")
    expect(host.target).toBe("authored"); expect(host.noValidate).toBe(true); expect(host.validateOnBlur).toBe(true)
    expect(Object.hasOwn(host, "method")).toBe(false)
  })
  it("keeps developer native attributes and styles through refresh, host removal and reconnect", async () => {
    const { host, native } = canonical()
    native.dataset.size = "small"; native.style.setProperty("--m-form-gap", "9px")
    host.size = "large"; expect(native.dataset.size).toBe("large")
    native.dataset.size = "medium"; native.action = "/application"; host.refresh()
    expect(native.dataset.size).toBe("medium")
    host.size = null; host.remove(); document.body.append(host); await flush()
    expect(native.dataset.size).toBe("medium"); expect(native.getAttribute("action")).toBe("/application")
    expect(native.style.getPropertyValue("--m-form-gap")).toBe("9px")
  })
  it("uses native methods despite controls named submit/reset/requestSubmit", () => {
    const { host, native } = canonical(), submitter = native.querySelector("button")!
    for (const name of ["submit", "reset", "requestSubmit"]) {
      const input = document.createElement("input"); input.name = name; native.append(input)
    }
    const request = vi.spyOn(HTMLFormElement.prototype, "requestSubmit").mockImplementation(() => {})
    const submit = vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(() => {})
    const reset = vi.spyOn(HTMLFormElement.prototype, "reset").mockImplementation(() => {})
    host.requestSubmit(submitter); host.submit(); host.reset()
    expect(request).toHaveBeenCalledExactlyOnceWith(submitter); expect(submit).toHaveBeenCalledOnce(); expect(reset).toHaveBeenCalledOnce()
  })
  it("aborts pending item validators on replacement and external reassociation", async () => {
    const { host, item, outside } = canonical(), pending = deferred()
    item.validator = () => pending.promise
    const result = host.validate(); await Promise.resolve()
    item.validator = () => null
    expect((await result).status).toBe("aborted")
    expect((await host.validate()).status).toBe("valid")
    outside.setAttribute("form", "other"); outside.value = ""; await flush()
    expect((await host.validate()).status).toBe("valid")
    expect(outside.hasAttribute("aria-invalid")).toBe(false)
    pending.resolve({ message: "stale" })
  })
  it("invalidates application-dependent results on explicit refresh without native value edits", async () => {
    const { host, item } = canonical()
    item.validator = () => ({ message: "External application dependency" })
    const result = await host.validate()
    expect(result.current).toBe(true)
    host.refresh()
    expect(result.current).toBe(false)
    expect(item.feedback!.textContent).toBe("Before")
  })
  it("preserves native fieldsets/legends and excludes nested item controls from parent mappings", async () => {
    const { host, native, item, field } = canonical()
    const fieldset = document.createElement("fieldset"), legend = document.createElement("legend")
    legend.textContent = "Group"; fieldset.disabled = true
    const required = document.createElement("input"); required.required = true; required.name = "barred"
    legend.append(field); fieldset.append(legend, required); item.append(fieldset)
    const nested = new FormItem(); nested.key = "nested"
    nested.innerHTML = '<label>Nested <input required name="nested"></label>'
    item.append(nested); host.refresh()
    expect(item.native).toBe(fieldset); expect(native.querySelector("legend")).toBe(legend)
    field.value = ""
    const result = await host.validate()
    expect(result.issues.map(issue => issue.key)).toEqual(["name", "nested"])
    expect(required.willValidate).toBe(false)
  })
  it("keeps cancelled resets settled and clears successful reset feedback without changing defaults", async () => {
    const { host, field, item, native } = canonical()
    item.validator = () => ({ message: "Local error" }); field.value = "dirty"
    await host.validate()
    native.addEventListener("reset", event => event.preventDefault(), { once: true })
    host.reset(); await flush()
    expect(field.value).toBe("dirty"); expect(item.feedback!.textContent).toBe("Local error")
    host.reset(); await flush()
    expect(field.value).toBe("seed"); expect(item.feedback!.textContent).toBe("Before")
    expect(field.getAttribute("aria-describedby")).toBe("help")
  })
})

describe("canonical Checkbox composition", () => {
  it("uses the original native owner for form validation, strings and reset", async () => {
    document.body.innerHTML = '<form><div id="item"><m-checkbox name="consent" value="yes" checked required>Consent</m-checkbox><p id="feedback" hidden></p></div></form>'
    await flush()
    const form = document.querySelector("form")!, box = document.querySelector<Checkbox>("m-checkbox")!, native = box.native
    const helper = createForm(form, { items: [{ key: "consent", controls: [native], feedback: document.getElementById("feedback")!, element: document.getElementById("item")! }] })
    helpers.push(helper)
    expect((await helper.validate()).status).toBe("valid")
    box.checked = false
    expect((await helper.validate()).status).toBe("invalid")
    form.reset(); await flush()
    expect((await helper.validate()).status).toBe("valid")
    expect(box.native).toBe(native)
    expect(new FormData(form).get("consent")).toBe("yes")
  })

  describe("canonical Switch composition", () => {
    it("uses the original Switch native owner for validation, loading, strings and reset", async () => {
      document.body.innerHTML = '<form><div id="item"><m-switch name="consent" value="yes" checked required>Consent</m-switch><p id="feedback" hidden></p></div></form>'
      await flush()
      const form = document.querySelector("form")!, toggle = document.querySelector<Switch>("m-switch")!, native = toggle.native
      const helper = createForm(form, { items: [{ key: "consent", controls: [native], feedback: document.getElementById("feedback")!, element: document.getElementById("item")! }] })
      helpers.push(helper)
      expect((await helper.validate()).status).toBe("valid")
      toggle.loading = true; expect(new FormData(form).get("consent")).toBe("yes")
      toggle.checked = false; expect((await helper.validate()).status).toBe("invalid")
      form.reset(); await flush()
      expect((await helper.validate()).status).toBe("valid")
      expect(toggle.native).toBe(native); expect(toggle.loading).toBe(true)
    })
  })
})

describe("Form stylesheet contract", () => {
  it("accounts for the complete family and shared core under the approved delivery limits", () => {
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    const family = manifest.componentPayloads.form
    expect(family.cssGzipBytes).toBeLessThanOrEqual(1250)
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const payload = family[mode]
      const core = `markup-ui-core${suffix}`
      expect(payload.dependencies).toEqual([core])
      expect(payload.gzipBytes).toBe(gzipSync(readFileSync(`dist\\${payload.file}`), { level: 9 }).length)
      expect(payload.gzipBytes).toBeLessThanOrEqual(7000)
      expect(payload.runtimeBudget).toBe(8250)
      expect(payload.runtimeGzipBytes).toBe(payload.gzipBytes + manifest.bundles[core].gzipBytes)
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(8250)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + family.cssGzipBytes)
    }
  })
  const css = readFileSync(join("src", "components", "form", "form.css"), "utf8")
  it("keeps inherited public geometry and color tokens authoritative", () => {
    expect(css).not.toMatch(/--m-form-[\w-]+\s*:/)
    expect(css).toContain("var(--m-form-label-align")
    expect(css).toContain("var(--m-form-feedback-color")
    expect(css).not.toContain("var(--m-text-primary")
    expect(css).toMatch(/data-m-theme="?dark"?/)
    expect(css).toMatch(/@media\s+print\s*\{[^}]*color-scheme:\s*light/)
  })
  it("uses reference label weight and explicit size inheritance without sizing controls", () => {
    expect(css).toMatch(/font-weight:\s*400/)
    for (const height of [24, 26, 28]) expect(css).toMatch(new RegExp(`--_f-lh:\\s*${height}px`))
    expect(css).toContain('[size="medium"]')
    expect(css).toMatch(/\.m-form-item__content:not\(\.m-input\)\s*\{[^}]*min-block-size:/)
    expect(css).not.toMatch(/\.m-input\s*\{[^}]*min-block-size:/)
    expect(css).not.toMatch(/\.m-form[^,{]*(?:\s|>|\+|~)(?:input|select|textarea)(?:[\s[.:#,{])/)
  })
  it("reserves hidden feedback space without exposing or generating feedback", () => {
    expect(css).toMatch(/\.m-form-item:not\(fieldset\):has\(>\s*\.m-form-item__feedback\[hidden\]\)\s*\{[^}]*padding-block-end:/)
    expect(css).toMatch(/\.m-form-item__feedback:not\(:empty\)\s*\{[^}]*padding-block-start:\s*4px/)
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
    expect(css).not.toMatch(/::before|::after/)
  })
  it("preserves authored content flow, fieldsets and border-box item sizing", () => {
    const content = css.match(/\.m-form-item__content\s*\{([^}]*)\}/)?.[1] ?? ""
    expect(content).not.toMatch(/display:/)
    expect(css).toMatch(/\.m-form-item\s*\{[^}]*box-sizing:\s*border-box/)
    expect(css).toMatch(/data-label-placement="?left"?[^\n]*:not\(fieldset\)/)
  })
  it("retains pending, forced-color and motion-free presentation", () => {
    expect(css).toMatch(/data-form-status="?pending"?[^{]*\{[^}]*dotted currentColor/)
    expect(css).toMatch(/@media\s*\(forced-colors:\s*active\)/)
    expect(css).toContain("color: CanvasText")
    expect(css).not.toMatch(/(?:animation|transition)(?:-[a-z]+)?\s*:/)
    expect(gzipSync(readFileSync("dist\\markup-ui-form.css"), { level: 9 }).byteLength).toBeLessThanOrEqual(1250)
  })
})

describe("Form native identity and explicit item ownership", () => {
  it("retains literal/repeated names, external associations, defaults, listeners, selection and FormData", async () => {
    const { first, helper, form } = fixture()
    const label = first.labels![0], listener = vi.fn()
    first.addEventListener("input", listener); first.focus(); first.setSelectionRange(1, 3)
    expect((await helper.validate()).status).toBe("valid")
    expect(first.labels![0]).toBe(label); expect(first.defaultValue).toBe("seed")
    expect([first.selectionStart, first.selectionEnd]).toEqual([1, 3])
    expect(new FormData(form).getAll("a.b[0]")).toEqual(["seed", "other"])
    expect(new FormData(form).get('x"]#')).toBe("outside")
    expect(form.querySelectorAll("input")).toHaveLength(3)
    first.dispatchEvent(new Event("input", { bubbles: true })); expect(listener).toHaveBeenCalledOnce()
    expect(form.noValidate).toBe(false)
  })
  it("rejects duplicate owners across module copies and releases on disconnect", async () => {
    const { form, first, helper } = fixture()
    expect(() => createForm(form, { items: [] })).toThrow("owner")
    vi.resetModules()
    const other = await import("../src/components/form/controller.js")
    expect(() => other.coordinateForm(form, { items: [] })).toThrow("owner")
    helper.disconnect()
    helpers.push(other.coordinateForm(form, { items: [{ key: "single", controls: [first] }] }))
  })
  it("rejects schema/unknown options, duplicate keys, repeated nodes and fieldset anchors", () => {
    const { form, first, helper } = fixture(); helper.disconnect()
    expect(() => createForm(form, { items: [], rules: {} } as never)).toThrow()
    expect(() => createForm(form, { items: [{ key: "one", controls: [first, first] }] })).toThrow("distinct")
    expect(() => createForm(form, { items: [{ key: "one", controls: [document.createElement("fieldset") as never] }] })).toThrow("input/select/textarea")
    expect(() => createForm(form, { items: [{ key: "one", controls: [first] }, { key: "one", controls: [] }] })).toThrow("unique")
  })
  it("requires stable unique feedback ids and plain nonlive content", () => {
    const { form, first, feedback, helper } = fixture(); helper.disconnect()
    feedback.setAttribute("role", "alert")
    expect(() => createForm(form, { items: [{ key: "x", controls: [first], feedback }] })).toThrow("nonlive")
    feedback.removeAttribute("role"); feedback.id = "first"
    expect(() => createForm(form, { items: [{ key: "x", controls: [first], feedback }] })).toThrow()
  })
  it("disconnects and aborts if mapped feedback becomes an unsupported live region", async () => {
    const pending = deferred(), { helper, feedback } = fixture(() => pending.promise)
    const result = helper.validate(); await Promise.resolve()
    feedback.setAttribute("aria-live", "polite"); await flush()
    expect((await result).status).toBe("aborted"); expect(helper.connected).toBe(false)
    pending.resolve(null)
  })
  it("copies fixed mapping arrays and rejects unknown exact keys", async () => {
    const { helper } = fixture()
    await expect(helper.validateField("a.b")).rejects.toThrow("literal")
    expect((await helper.validate({ keys: ["a.b[0]"] })).status).toBe("valid")
  })
})

describe("native validity and manual submission boundary", () => {
  it.each([
    ['type="email"', "bad"], ['required', ""], ['pattern="[A-Z]+"', "lower"],
    ['type="number" min="2"', "1"], ['type="number" max="2"', "3"], ['type="number" step="2"', "3"],
  ])("uses native %s without mutating constraints", async (attributes, value) => {
    const { helper, first, feedback } = fixture()
    const source = new DOMParser().parseFromString(`<input ${attributes}>`, "text/html").querySelector("input")!
    for (const attr of source.attributes) first.setAttribute(attr.name, attr.value)
    first.value = value; helper.refresh()
    const result = await helper.validate()
    expect(result.status).toBe("invalid")
    expect(result.issues[0]?.source).toBe("native")
    expect(feedback.textContent).toBe(first.validationMessage)
    expect(first.getAttribute("aria-invalid")).toBe("true")
    expect(document.activeElement).not.toBe(first)
  })
  it("includes unmapped invalid controls only in whole-form validation", async () => {
    const { helper, form } = fixture()
    form.querySelector<HTMLInputElement>("#required")!.value = ""
    expect((await helper.validateField("a.b[0]")).status).toBe("valid")
    const whole = await helper.validate()
    expect(whole.status).toBe("invalid"); expect(whole.issues[0]?.key).toBeNull()
  })
  it("includes eligible native buttons with application custom errors, while fieldsets remain barred", async () => {
    const { helper, form } = fixture()
    const button = form.querySelector("button")!
    button.setCustomValidity("Button application error")
    const fieldset = document.createElement("fieldset"); fieldset.setCustomValidity("Cannot block submission"); form.append(fieldset)
    const result = await helper.validate()
    expect(result.status).toBe("invalid"); expect(result.issues).toHaveLength(1)
    expect(result.issues[0]?.control).toBe(button)
    helper.restoreValidation(); expect(button.validationMessage).toBe("Button application error")
  })
  it("does not replace externally owned custom validity, including barred controls and teardown", async () => {
    const validator = vi.fn(() => null), { helper, first, second, feedback } = fixture(validator)
    first.setCustomValidity("External <error>")
    expect((await helper.validate()).status).toBe("invalid"); expect(validator).not.toHaveBeenCalled()
    expect(feedback.textContent).toBe("External <error>"); expect(feedback.children.length).toBe(0)
    first.disabled = true; second.disabled = true; helper.refresh()
    expect((await helper.validate()).status).toBe("valid")
    first.setCustomValidity("External changed while disabled"); helper.restoreValidation(); helper.disconnect()
    first.disabled = false
    expect(first.validationMessage).toBe("External changed while disabled")
  })
  it("never calls setCustomValidity for custom results, so native retries are not poisoned", async () => {
    const { helper, first, form } = fixture(() => ({ message: "App check failed" }))
    const set = vi.spyOn(first, "setCustomValidity")
    expect((await helper.validate()).status).toBe("invalid")
    expect(set).not.toHaveBeenCalled(); expect(form.checkValidity()).toBe(true)
    helper.restoreValidation(); helper.disconnect(); expect(set).not.toHaveBeenCalled()
  })
  it("skips custom validation without eligible fields; honors readonly and disabled first-legend exception", async () => {
    const validator = vi.fn(() => ({ message: "Group minimum" }))
    const { helper, first, second, form } = fixture(validator)
    first.readOnly = true; second.disabled = true; helper.refresh()
    expect((await helper.validate()).status).toBe("valid"); expect(validator).not.toHaveBeenCalled()
    const fieldset = document.createElement("fieldset"); fieldset.disabled = true
    const legend = document.createElement("legend"); legend.append(first); fieldset.append(legend, second); form.append(fieldset)
    first.readOnly = false; second.disabled = false; helper.refresh()
    const result = await helper.validate()
    expect(result.status).toBe("invalid"); expect(result.issues[0]?.control).toBe(first)
    expect(second.willValidate).toBe(false)
  })
  it("validates a native required radio group, without requiring every checkbox", async () => {
    const { helper, first, second } = fixture()
    first.type = second.type = "radio"; first.required = true; first.checked = false; second.checked = true; helper.refresh()
    expect((await helper.validate()).status).toBe("valid")
    second.checked = false; helper.refresh(); expect((await helper.validate()).status).toBe("invalid")
    first.type = second.type = "checkbox"; first.required = false; helper.refresh()
    expect((await helper.validate()).status).toBe("valid")
  })
  it("does not own submit, noValidate, formNoValidate, submitter identity or submission callbacks", async () => {
    const { helper, form } = fixture(() => ({ message: "Manual error" }))
    const listener = vi.fn((event: Event) => event.preventDefault()); form.addEventListener("submit", listener)
    const submitter = form.querySelector<HTMLButtonElement>("#draft")!
    const event = new SubmitEvent("submit", { bubbles: true, cancelable: true, submitter })
    form.dispatchEvent(event); await helper.validate()
    expect(listener).toHaveBeenCalledOnce(); expect((listener.mock.calls[0]![0] as SubmitEvent).submitter).toBe(submitter)
    expect(new FormData(form, submitter).get("intent")).toBe("draft")
    expect(form.noValidate).toBe(false); expect(submitter.formNoValidate).toBe(true)
    form.noValidate = true; helper.disconnect(); expect(form.noValidate).toBe(true)
  })
  it("native invalid capture presents feedback without cancelling native reporting", () => {
    const { helper, first, feedback } = fixture(); first.required = true; first.value = ""
    const report = vi.spyOn(first, "reportValidity")
    const invalid = new Event("invalid", { cancelable: true }); first.dispatchEvent(invalid)
    expect(invalid.defaultPrevented).toBe(false); expect(feedback.hidden).toBe(false)
    expect(report).not.toHaveBeenCalled()
    expect(helper.reportValidity()).toBe(false)
  })
  it("leaves minlength/maxlength behavior to the native browser, including programmatic values", () => {
    const { first, helper } = fixture()
    first.minLength = 2; first.maxLength = 4; first.value = "long programmatic value"
    helper.refresh(); helper.disconnect()
    expect(first.value).toBe("long programmatic value"); expect(first.maxLength).toBe(4)
  })
})

describe("small validators, lifetime and cross-field snapshots", () => {
  it("passes frozen native snapshots and returns current results with warnings separate from errors", async () => {
    const validator = vi.fn(() => ({ message: "Consider another value", level: "warning" as const }))
    const { helper, first, feedback, element } = fixture(validator)
    const result = await helper.validate()
    expect(result.status).toBe("valid"); expect(result.current).toBe(true)
    expect(result.issues[0]?.source).toBe("warning"); expect(first.hasAttribute("aria-invalid")).toBe(false)
    expect(element.dataset.formStatus).toBe("warning"); expect(feedback.textContent).toBe("Consider another value")
    const context = (validator.mock.calls as unknown as [[{ fields: unknown[]; signal: AbortSignal; reason: string }]])[0][0]
    expect(Object.isFrozen(context.fields)).toBe(true); expect(context.reason).toBe("manual")
    first.value = "silent"; expect(result.current).toBe(false)
  })
  it("aborts immediately on a cross-field event even if a validator ignores AbortSignal", async () => {
    const pending = deferred(), validator = vi.fn(() => pending.promise)
    const { helper, external, element, feedback } = fixture(validator)
    const validation = helper.validate(); await Promise.resolve(); expect(element.dataset.formStatus).toBe("pending")
    external.value = "changed"; external.dispatchEvent(new Event("input", { bubbles: true }))
    expect((await validation).status).toBe("aborted")
    pending.resolve({ message: "stale" }); await flush()
    expect(feedback.textContent).toBe("Authored feedback"); expect(element.hasAttribute("data-form-status")).toBe(false)
  })
  it.each(["silent", "refresh", "remove", "associate", "disable", "dependency-constraint"])("guards pending work across %s changes", async mode => {
    const pending = deferred(), { helper, first, external, form, feedback } = fixture(() => pending.promise)
    const validation = helper.validate(); await Promise.resolve()
    if (mode === "silent") external.value = "silent dependency"
    if (mode === "refresh") helper.refresh()
    if (mode === "remove") first.remove()
    if (mode === "associate") first.setAttribute("form", "elsewhere")
    if (mode === "disable") first.disabled = true
    if (mode === "dependency-constraint") form.querySelector<HTMLInputElement>("#required")!.minLength = 20
    pending.resolve({ message: "stale" })
    expect((await validation).status).toBe("aborted"); expect(feedback.textContent).toBe("Authored feedback")
  })
  it("new validation supersedes old work; rapid submit-intent validations never submit anything", async () => {
    const old = deferred(), fresh = deferred(), validator = vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise)
    const { helper, form, feedback } = fixture(validator)
    const submit = vi.fn(); form.addEventListener("submit", submit)
    const one = helper.validate({ reason: "submit" }); await Promise.resolve()
    const two = helper.validate({ reason: "submit" }); await Promise.resolve()
    old.resolve({ message: "old" }); fresh.resolve(null)
    expect((await one).status).toBe("aborted")
    expect((await two).status).toBe("valid"); expect(feedback.textContent).toBe("Authored feedback")
    expect(submit).not.toHaveBeenCalled()
  })
  it.each([undefined, false, "", {}, { message: "" }, { message: "bad", level: "info" }])("rejects malformed validator result %j explicitly", async value => {
    const { helper, form } = fixture((() => value) as FormValidator), error = vi.fn()
    form.addEventListener("m:form-error", error)
    await expect(helper.validate()).rejects.toThrow("Validator must")
    expect(error).toHaveBeenCalledOnce()
  })
  it("rejects unexpected throws/promises and reports late unexpected failures even after cancellation", async () => {
    const pending = deferred(), { helper, form, first } = fixture(() => pending.promise), error = vi.fn()
    form.addEventListener("m:form-error", error)
    const validation = helper.validate(); await Promise.resolve()
    first.dispatchEvent(new Event("change", { bubbles: true }))
    expect((await validation).status).toBe("aborted")
    pending.reject(new Error("late failure")); await flush()
    expect(error).toHaveBeenCalledOnce()
    expect((error.mock.calls[0]![0] as CustomEvent).detail.error.message).toBe("late failure")
  })
  it("does not treat an uncancelled AbortError as valid success", async () => {
    const { helper, form } = fixture(() => Promise.reject(new DOMException("unexpected", "AbortError")))
    const error = vi.fn(); form.addEventListener("m:form-error", error)
    await expect(helper.validate()).rejects.toThrow("unexpected"); expect(error).toHaveBeenCalledOnce()
  })
  it("expected signal abort is an aborted result, not a validation success or an error event", async () => {
    const { helper, form } = fixture(({ signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("stop", "AbortError")))))
    const error = vi.fn(); form.addEventListener("m:form-error", error)
    const validation = helper.validate(); await Promise.resolve(); helper.disconnect()
    expect((await validation).status).toBe("aborted"); await flush(); expect(error).not.toHaveBeenCalled()
  })
  it("surfaces synchronous exceptions and clears pending presentation", async () => {
    const { helper, element, form } = fixture(() => { throw new Error("bug") }), error = vi.fn()
    form.addEventListener("m:form-error", error)
    await expect(helper.validate()).rejects.toThrow("bug"); expect(error).toHaveBeenCalledOnce()
    expect(element.hasAttribute("data-form-status")).toBe(false)
  })
})

describe("feedback ownership, blur, reset and companion composition", () => {
  it("restores only owned tokens/text/attributes while preserving subsequent application changes", async () => {
    const { helper, first, feedback, element } = fixture(() => ({ message: "<img src=x>" }))
    await helper.validate()
    expect(first.getAttribute("aria-describedby")).toBe("help feedback"); expect(feedback.children).toHaveLength(0)
    first.setAttribute("aria-describedby", `${first.getAttribute("aria-describedby")} added`)
    first.setAttribute("aria-invalid", "grammar"); feedback.textContent = "App replacement"; element.dataset.formStatus = "external"
    helper.restoreValidation()
    expect(first.getAttribute("aria-describedby")).toBe("help added")
    expect(first.getAttribute("aria-invalid")).toBe("grammar"); expect(feedback.textContent).toBe("App replacement")
    expect(element.dataset.formStatus).toBe("external")
  })
  it("does not remove a preexisting feedback token", async () => {
    const { helper, first } = fixture(() => ({ message: "error" }))
    first.setAttribute("aria-describedby", "help feedback")
    await helper.validate(); helper.disconnect()
    expect(first.getAttribute("aria-describedby")).toBe("help feedback")
  })
  it.each(["form-first", "input-first"])("coexists with Input count/help in %s teardown order", async order => {
    const { helper, form, first, feedback } = fixture(); helper.disconnect()
    const root = document.querySelector<HTMLElement>("#item")!
    root.classList.add("m-input"); root.setAttribute("data-input", ""); first.setAttribute("data-input-control", "")
    const count = document.createElement("span"); count.id = "count"; count.setAttribute("data-input-count", ""); root.append(count)
    first.setAttribute("aria-describedby", "help count")
    const input = createInput(root), coordinator = createForm(form, { items: [{ key: "x", controls: [first], feedback, validator: () => ({ message: "error" }) }] })
    helpers.push(input, coordinator)
    await coordinator.validate()
    if (order === "form-first") { coordinator.disconnect(); input.disconnect() } else { input.disconnect(); coordinator.disconnect() }
    expect(first.getAttribute("aria-describedby")).toBe("help count")
    expect(first.value).toBe("seed")
  })
  it("reset clears feedback after native defaults without writing values; cancelled reset preserves settled feedback", async () => {
    const { helper, first, form, feedback } = fixture(() => ({ message: "error" }))
    first.value = "edited"; await helper.validate()
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(first.value).toBe("edited"); expect(feedback.textContent).toBe("error")
    form.reset(); await flush()
    expect(first.value).toBe("seed"); expect(first.defaultValue).toBe("seed"); expect(feedback.textContent).toBe("Authored feedback")
  })
  it("reset aborts pending work even with unchanged default values", async () => {
    const pending = deferred(), { helper, form, feedback } = fixture(() => pending.promise)
    const result = helper.validate(); await Promise.resolve(); form.reset()
    pending.resolve({ message: "stale" })
    expect((await result).status).toBe("aborted"); await flush()
    expect(feedback.textContent).toBe("Authored feedback")
  })
  it("deferred reset cleanup cannot cancel validation started against the new reset values", async () => {
    const pending = deferred(), { helper, form, feedback } = fixture(() => pending.promise)
    form.reset()
    const result = helper.validate(); await flush()
    pending.resolve({ message: "New reset-value result" })
    expect((await result).status).toBe("invalid")
    expect(feedback.textContent).toBe("New reset-value result")
  })
  it("deferred reset cleanup cannot erase an already completed post-reset result", async () => {
    const { helper, form, feedback } = fixture(() => ({ message: "New result" }))
    form.reset()
    const result = await helper.validate(); await flush()
    expect(result.current).toBe(true); expect(feedback.textContent).toBe("New result")
  })
  it("blur is opt-in, validates once leaving the item and does not focus or create live regions", async () => {
    const validator = vi.fn(() => ({ message: "blur error" })), { first, second, feedback } = fixture(validator, true)
    first.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: second }))
    await flush(); expect(validator).not.toHaveBeenCalled()
    second.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.querySelector("#outside") }))
    await flush(); expect(validator).toHaveBeenCalledOnce()
    expect(feedback.textContent).toBe("blur error"); expect(feedback.hasAttribute("aria-live")).toBe(false)
  })
  it("handles nonbubbling Rate clear as a cross-field invalidation without replacing radio state", async () => {
    const source = readFileSync("demo\\components\\rate.html", "utf8")
    document.body.innerHTML = new DOMParser().parseFromString(source, "text/html").querySelector("main")!.innerHTML
    const root = document.querySelector<HTMLFieldSetElement>("#quality")!, rate = createRate(root)
    const pending = deferred(), radios = [...root.querySelectorAll<HTMLInputElement>("input")]
    const form = document.querySelector<HTMLFormElement>("#review")!
    const helper = createForm(form, { items: [{ key: "quality", controls: radios, validator: () => pending.promise }] })
    helpers.push(rate, helper)
    const result = helper.validate(); await Promise.resolve()
    expect(rate.clear()).toBe(true); expect((await result).status).toBe("aborted")
    pending.resolve({ message: "old rating" }); await flush()
    expect(rate.value).toBeNull(); expect(radios[1]!.validity.valueMissing).toBe(true)
  })
  it.each([false, true])("aborts on unmapped Rate clear without a readout, external=%s", async external => {
    const pending = deferred(), { helper, form, feedback } = fixture(() => pending.promise)
    const root = document.createElement("fieldset")
    root.className = "m-rate m-radio-group"; root.setAttribute("data-rate", ""); root.setAttribute("data-radio-group", "")
    root.innerHTML = `<legend>Unmapped rating</legend><label><input data-radio type="radio" name="rating" value="1" checked ${external ? 'form="test"' : ""}>One</label><label><input data-radio type="radio" name="rating" value="2" ${external ? 'form="test"' : ""}>Two</label>`
    ;(external ? document.body : form).append(root)
    const rate = createRate(root, { count: 2 }); helpers.push(rate)
    const result = helper.validate(); await Promise.resolve()
    expect(rate.clear()).toBe(true)
    expect((await result).status).toBe("aborted"); expect(feedback.textContent).toBe("Authored feedback")
    pending.resolve({ message: "Old dependency" })
  })
  it("disconnect is idempotent, removes listeners and does not affect values or outside focus", async () => {
    const validator = vi.fn(() => null), { helper, first } = fixture(validator, true)
    document.querySelector<HTMLButtonElement>("#outside")!.focus()
    helper.disconnect(); helper.disconnect(); first.dispatchEvent(new FocusEvent("focusout", { bubbles: true }))
    await flush()
    expect(validator).not.toHaveBeenCalled(); expect(document.activeElement?.id).toBe("outside")
    expect(first.value).toBe("seed"); await expect(helper.validate()).rejects.toThrow("disconnected")
  })
})
