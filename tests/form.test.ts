import { readFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createForm } from "../src/components/form/index.js"
import type { FormController, FormItemOptions, FormValidator, FormValidatorResult } from "../src/components/form/index.js"
import { createInput } from "../src/components/input/index.js"
import { createRate } from "../src/components/rate/index.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(validator?: FormValidator, blur = false) {
  document.body.innerHTML = `<form id="test"><div class="mui-form-item" id="item">
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

describe("Form stylesheet contract", () => {
  const css = readFileSync(join("src", "components", "form", "form.css"), "utf8")
  it("keeps inherited public geometry and color tokens authoritative", () => {
    expect(css).not.toMatch(/--mui-form-[\w-]+\s*:/)
    expect(css).toContain("var(--mui-form-label-align")
    expect(css).toContain("var(--mui-form-feedback-color")
    expect(css).not.toContain("var(--mui-text-primary")
    expect(css).toMatch(/data-mui-theme="?dark"?/)
    expect(css).toMatch(/@media\s+print\s*\{[^}]*color-scheme:\s*light/)
  })
  it("uses reference label weight and explicit size inheritance without sizing controls", () => {
    expect(css).toMatch(/font-weight:\s*400/)
    for (const height of [24, 26, 28]) expect(css).toMatch(new RegExp(`--_f-lh:\\s*${height}px`))
    expect(css).toMatch(/:is\(\.mui-form,\s*\.mui-form-item\)\[data-size="?medium"?\]/)
    expect(css).toMatch(/\.mui-form-item__content:not\(\.mui-input\)\s*\{[^}]*min-block-size:/)
    expect(css).not.toMatch(/\.mui-input\s*\{[^}]*min-block-size:/)
    expect(css).not.toMatch(/\.mui-form[^,{]*(?:\s|>|\+|~)(?:input|select|textarea)(?:[\s[.:#,{])/)
  })
  it("reserves hidden feedback space without exposing or generating feedback", () => {
    expect(css).toMatch(/\.mui-form-item:not\(fieldset\):has\(>\s*\.mui-form-item__feedback\[hidden\]\)\s*\{[^}]*padding-block-end:/)
    expect(css).toMatch(/\.mui-form-item__feedback:not\(:empty\)\s*\{[^}]*padding-block-start:\s*4px/)
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
    expect(css).not.toMatch(/::before|::after/)
  })
  it("preserves authored content flow, fieldsets and border-box item sizing", () => {
    const content = css.match(/\.mui-form-item__content\s*\{([^}]*)\}/)?.[1] ?? ""
    expect(content).not.toMatch(/display:/)
    expect(css).toMatch(/\.mui-form-item\s*\{[^}]*box-sizing:\s*border-box/)
    expect(css).toMatch(/data-label-placement="?left"?[^\n]*:not\(fieldset\)/)
  })
  it("retains pending, forced-color and motion-free presentation", () => {
    expect(css).toMatch(/data-form-status="?pending"?[^{]*\{[^}]*dotted currentColor/)
    expect(css).toMatch(/@media\s*\(forced-colors:\s*active\)/)
    expect(css).toContain("color: CanvasText")
    expect(css).not.toMatch(/(?:animation|transition)(?:-[a-z]+)?\s*:/)
    expect(gzipSync(css, { level: 9 }).byteLength).toBeLessThanOrEqual(1250)
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
    const other = await import("../src/components/form/index.js")
    expect(() => other.createForm(form, { items: [] })).toThrow("owner")
    helper.disconnect()
    helpers.push(other.createForm(form, { items: [{ key: "single", controls: [first] }] }))
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
    form.addEventListener("mui:form-error", error)
    await expect(helper.validate()).rejects.toThrow("Validator must")
    expect(error).toHaveBeenCalledOnce()
  })
  it("rejects unexpected throws/promises and reports late unexpected failures even after cancellation", async () => {
    const pending = deferred(), { helper, form, first } = fixture(() => pending.promise), error = vi.fn()
    form.addEventListener("mui:form-error", error)
    const validation = helper.validate(); await Promise.resolve()
    first.dispatchEvent(new Event("change", { bubbles: true }))
    expect((await validation).status).toBe("aborted")
    pending.reject(new Error("late failure")); await flush()
    expect(error).toHaveBeenCalledOnce()
    expect((error.mock.calls[0]![0] as CustomEvent).detail.error.message).toBe("late failure")
  })
  it("does not treat an uncancelled AbortError as valid success", async () => {
    const { helper, form } = fixture(() => Promise.reject(new DOMException("unexpected", "AbortError")))
    const error = vi.fn(); form.addEventListener("mui:form-error", error)
    await expect(helper.validate()).rejects.toThrow("unexpected"); expect(error).toHaveBeenCalledOnce()
  })
  it("expected signal abort is an aborted result, not a validation success or an error event", async () => {
    const { helper, form } = fixture(({ signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("stop", "AbortError")))))
    const error = vi.fn(); form.addEventListener("mui:form-error", error)
    const validation = helper.validate(); await Promise.resolve(); helper.disconnect()
    expect((await validation).status).toBe("aborted"); await flush(); expect(error).not.toHaveBeenCalled()
  })
  it("surfaces synchronous exceptions and clears pending presentation", async () => {
    const { helper, element, form } = fixture(() => { throw new Error("bug") }), error = vi.fn()
    form.addEventListener("mui:form-error", error)
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
    root.classList.add("mui-input"); root.setAttribute("data-input", ""); first.setAttribute("data-input-control", "")
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
    root.className = "mui-rate mui-radio-group"; root.setAttribute("data-rate", ""); root.setAttribute("data-radio-group", "")
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
