import { afterEach, describe, expect, it, vi } from "vitest"
import { createInputOtp } from "../src/components/input-otp/index.js"
import type { InputOtpOptions } from "../src/components/input-otp/index.js"
import { createInput } from "../src/components/input/index.js"
import { createForm } from "../src/components/form/index.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(options: InputOtpOptions = {}, initial = "") {
  const length = options.length ?? 6, characters = options.characters ?? "digits"
  document.body.innerHTML = `<form id="codes"><label for="code">Code</label><div class="mui-input" data-input id="root">
    <input class="mui-input-otp" data-input-control id="code" name="code[0].text" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="${length}" pattern="${characters === "digits" ? "[0-9]" : "[A-Za-z0-9]"}{${length}}" required aria-describedby="help"></div>
    <button name="intent" value="local">Continue</button></form><p id="help">Help</p><p id="status">Original status</p><p id="feedback" hidden></p><button id="outside" type="button">Outside</button>`
  const input = document.querySelector<HTMLInputElement>("#code")!, status = document.querySelector<HTMLElement>("#status")!
  input.defaultValue = initial
  const helper = createInputOtp(input, { ...options, status }); helpers.push(helper)
  const completed = vi.fn(); input.addEventListener("mui:input-otp-complete", completed)
  return { helper, input, status, completed, form: document.querySelector("form")! }
}
function edit(input: HTMLInputElement, value: string) {
  input.value = value; input.dispatchEvent(new InputEvent("input", { bubbles: true }))
}
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("one native field and strict ASCII anatomy", () => {
  it("preserves input identity, labels, selection, listeners, native name/default/attributes and FormData", async () => {
    const { helper, input, form } = fixture({}, "001234"), label = input.labels![0], listener = vi.fn()
    input.addEventListener("input", listener); input.focus(); input.setSelectionRange(1, 4)
    helper.refresh(); expect(input.labels![0]).toBe(label); expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4])
    expect(input.defaultValue).toBe("001234"); expect(new FormData(form).getAll("code[0].text")).toEqual(["001234"])
    expect(form.querySelectorAll("input")).toHaveLength(1); expect(input.autocomplete).toBe("one-time-code")
    expect(input.getAttribute("aria-describedby")).toBe("help")
    edit(input, "00123"); await flush(); expect(listener).toHaveBeenCalledOnce()
  })
  it.each([0, -1, 13, 2.5, NaN, Infinity])("rejects invalid length %s without altering the field", length => {
    const { helper, input } = fixture(); helper.disconnect(); const original = input.outerHTML
    expect(() => createInputOtp(input, { length })).toThrow("1 to 12"); expect(input.outerHTML).toBe(original)
  })
  it.each([{ characters: "unicode" }, { length: "6" }, { length: null }, { characters: null }, { status: null }, { mask: true }, { allowInput: () => true }])("rejects unsupported options %j", options => {
    const { helper, input } = fixture(); helper.disconnect()
    expect(() => createInputOtp(input, options as InputOtpOptions)).toThrow()
  })
  it.each(["pattern", "maxlength", "autocomplete", "type"])("requires native %s anatomy without writing missing attributes", async name => {
    const { helper, input } = fixture()
    if (name === "type") input.type = "number"
    else input.removeAttribute(name)
    await flush(); expect(helper.connected).toBe(false)
    expect(() => createInputOtp(input)).toThrow("Author")
  })
  it("rejects primitive configuration instead of silently applying defaults", () => {
    const { helper, input } = fixture(); helper.disconnect()
    for (const value of [true, 6, "options", () => {}]) expect(() => createInputOtp(input, value as never)).toThrow("options")
  })
  it("rejects duplicate owners across module copies and releases after disposal", async () => {
    const { helper, input } = fixture()
    expect(() => createInputOtp(input)).toThrow("owner")
    vi.resetModules(); const other = await import("../src/components/input-otp/index.js")
    expect(() => other.createInputOtp(input)).toThrow("owner")
    helper.disconnect(); helpers.push(other.createInputOtp(input))
  })
  it.each(["off one-time-code", "typo one-time-code", "one-time-code one-time-code", "section- one-time-code"])("rejects invalid OTP autocomplete token list: %s", async autocomplete => {
    const { helper, input } = fixture()
    input.setAttribute("autocomplete", autocomplete); await flush()
    expect(helper.connected).toBe(false); expect(() => createInputOtp(input)).toThrow("Author")
  })
  it("accepts an explicit native section token without changing it", () => {
    const { helper, input } = fixture(); helper.disconnect()
    input.setAttribute("autocomplete", "section-login one-time-code")
    helpers.push(createInputOtp(input)); expect(input.getAttribute("autocomplete")).toBe("section-login one-time-code")
  })
  it("supports bounded alphanumeric ASCII without uppercasing or stripping zeroes", async () => {
    const { input, helper, completed } = fixture({ length: 8, characters: "alphanumeric" })
    edit(input, "0aB1cD2e"); await flush()
    expect(helper.complete).toBe(true); expect(input.value).toBe("0aB1cD2e"); expect(completed).toHaveBeenCalledOnce()
  })
  it("never adds roles, per-digit descriptions, proxy fields or secret attributes", async () => {
    const { input, completed } = fixture(); edit(input, "001234"); await flush()
    const event = completed.mock.calls[0]![0] as CustomEvent
    expect(event.detail).toEqual({ length: 6, characters: "digits" })
    expect(Object.isFrozen(event.detail)).toBe(true)
    expect(input.hasAttribute("role")).toBe(false); expect(document.querySelectorAll("input")).toHaveLength(1)
    expect(document.body.innerHTML).not.toContain("001234")
  })
})

describe("completion is a local transition, not authentication or selection intent", () => {
  it("preserves leading zeroes and emits once across input/change duplicates", async () => {
    const { input, completed, helper } = fixture()
    edit(input, "001234"); input.dispatchEvent(new Event("change", { bubbles: true }))
    input.dispatchEvent(new InputEvent("input", { bubbles: true })); await flush()
    expect(input.value).toBe("001234"); expect(helper.complete).toBe(true); expect(completed).toHaveBeenCalledOnce()
    input.dispatchEvent(new Event("change", { bubbles: true })); await flush(); expect(completed).toHaveBeenCalledOnce()
  })
  it("does not infer new intent when one complete code is replaced by another complete code", async () => {
    const { input, completed } = fixture()
    edit(input, "001234"); await flush(); edit(input, "005678"); await flush()
    expect(completed).toHaveBeenCalledOnce(); expect(input.value).toBe("005678")
  })
  it("re-completes after deletion, including delete/retype events in the same task", async () => {
    const { input, completed } = fixture()
    edit(input, "001234"); await flush(); edit(input, "00123"); edit(input, "001234"); await flush()
    expect(completed).toHaveBeenCalledTimes(2)
  })
  it.each(["", "00123", "0012345", "00123 ", " 001234", "001-23", "a01234", "１２３４５６", "١٢٣٤٥٦", "a😀123"])("does not complete invalid local content (case %s)", async value => {
    const { input, helper, completed } = fixture()
    edit(input, value); await flush()
    expect(input.value).toBe(value); expect(helper.complete).toBe(false); expect(completed).not.toHaveBeenCalled()
  })
  it("does not truncate scripted overlong values or normalize whitespace", () => {
    const { helper, input } = fixture()
    input.value = "001234 extra"; helper.refresh()
    expect(input.value).toBe("001234 extra"); expect(helper.complete).toBe(false); expect(input.maxLength).toBe(6)
  })
  it("never emits for prefilled values, refreshes or silent programmatic Input setters", async () => {
    const { input, helper, completed } = fixture({}, "001234"), entry = createInput(document.querySelector("#root")!)
    helpers.push(entry); helper.refresh(); input.dispatchEvent(new Event("change", { bubbles: true })); await flush()
    expect(completed).not.toHaveBeenCalled()
    entry.setValue(""); helper.refresh(); entry.setValue("005678"); helper.refresh(); await flush()
    expect(helper.complete).toBe(true); expect(completed).not.toHaveBeenCalled()
    expect(() => entry.setValue(123456 as never)).toThrow("string")
  })
  it("guards deferred completion from a silent direct value write or explicit refresh", async () => {
    const { input, helper, completed } = fixture()
    edit(input, "001234"); input.value = "005678"; await flush()
    expect(completed).not.toHaveBeenCalled(); expect(input.value).toBe("005678")
    edit(input, ""); edit(input, "001234"); helper.refresh(); await flush()
    expect(completed).not.toHaveBeenCalled()
  })
  it("does not complete with external custom validity, including messages installed after input listeners", async () => {
    const { input, helper, completed } = fixture()
    input.addEventListener("input", () => input.setCustomValidity("External local error"), { once: true })
    edit(input, "001234"); await flush()
    expect(helper.complete).toBe(false); expect(completed).not.toHaveBeenCalled()
    helper.refresh(); helper.disconnect(); expect(input.validationMessage).toBe("External local error")
  })
  it("leaves native paste, keyboard navigation, selection and modified Enter untouched", () => {
    const { input } = fixture()
    const paste = new Event("paste", { bubbles: true, cancelable: true }); input.dispatchEvent(paste)
    expect(paste.defaultPrevented).toBe(false)
    for (const key of ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Enter"]) {
      const event = new KeyboardEvent("keydown", { key, ctrlKey: true, bubbles: true, cancelable: true })
      input.dispatchEvent(event); expect(event.defaultPrevented).toBe(false)
    }
  })
  it("never submits, focuses outside fields or exposes a code in the completion status", async () => {
    const { input, form, completed, status } = fixture(), submit = vi.fn()
    form.addEventListener("submit", submit)
    document.querySelector<HTMLButtonElement>("#outside")!.focus(); edit(input, "001234"); await flush()
    expect(completed).toHaveBeenCalledOnce(); expect(submit).not.toHaveBeenCalled()
    expect(document.activeElement?.id).toBe("outside"); expect(status.textContent).not.toContain("001234")
    expect(status.hasAttribute("role")).toBe(false); expect(status.hasAttribute("aria-live")).toBe(false)
  })
})

describe("IME, native availability and reset generations", () => {
  it("never emits mid-composition and deduplicates end/input/change", async () => {
    const { helper, input, completed } = fixture()
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    input.value = "001234"; input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    await flush(); expect(helper.complete).toBe(false); expect(completed).not.toHaveBeenCalled()
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    input.dispatchEvent(new InputEvent("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true }))
    await flush(); expect(helper.complete).toBe(true); expect(completed).toHaveBeenCalledOnce()
  })
  it("does not re-complete an unchanged completed code after composition", async () => {
    const { input, completed } = fixture()
    edit(input, "001234"); await flush(); input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })); await flush()
    expect(completed).toHaveBeenCalledOnce()
  })
  it.each(["disabled", "readonly", "hidden", "fieldset"])("suppresses completion while %s", async mode => {
    const { input, helper, completed, form } = fixture()
    if (mode === "disabled") input.disabled = true
    if (mode === "readonly") input.readOnly = true
    if (mode === "hidden") form.hidden = true
    if (mode === "fieldset") { const fieldset = document.createElement("fieldset"); fieldset.disabled = true; form.append(fieldset); fieldset.append(input) }
    helper.refresh(); edit(input, "001234"); await flush()
    expect(completed).not.toHaveBeenCalled(); expect(input.value).toBe("001234")
  })
  it("honors the native disabled-fieldset first legend exception", async () => {
    const { input, form, helper, completed } = fixture()
    const fieldset = document.createElement("fieldset"), legend = document.createElement("legend")
    fieldset.disabled = true; legend.append(input); fieldset.append(legend); form.append(fieldset); helper.refresh()
    edit(input, "001234"); await flush(); expect(completed).toHaveBeenCalledOnce()
  })
  it("native masking and readonly transitions remain silent and preserve value/default", async () => {
    const { input, helper, completed } = fixture({}, "001234")
    input.type = "password"; helper.refresh(); input.readOnly = true; helper.refresh()
    input.type = "text"; input.readOnly = false; helper.refresh(); await flush()
    expect(input.value).toBe("001234"); expect(input.defaultValue).toBe("001234"); expect(completed).not.toHaveBeenCalled()
  })
  it("uses current native external form owner and reset defaults without emission", async () => {
    const { input, form, helper, completed } = fixture({}, "001234")
    input.setAttribute("form", form.id); document.body.append(input); helper.refresh()
    edit(input, "001"); await flush(); form.reset(); await flush()
    expect(input.value).toBe("001234"); expect(completed).not.toHaveBeenCalled()
    expect(new FormData(form).getAll("code[0].text")).toEqual(["001234"])
  })
  it("cancelled reset preserves value and settled completion dedupe", async () => {
    const { input, form, completed } = fixture()
    edit(input, "001234"); await flush()
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    input.dispatchEvent(new Event("change", { bubbles: true })); await flush()
    expect(input.value).toBe("001234"); expect(completed).toHaveBeenCalledOnce()
  })
  it("cancelled reset preserves a still-guarded pending completion", async () => {
    const { input, form, completed } = fixture()
    edit(input, "001234")
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(completed).toHaveBeenCalledOnce(); expect(input.value).toBe("001234")
  })
  it("cancelled reset does not bypass a pending notification's silent-write guard", async () => {
    const { input, form, completed } = fixture()
    edit(input, "001234")
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset()
    input.value = "005678"; await flush(); expect(completed).not.toHaveBeenCalled()
  })
  it("a completed stretch is rearmed by successful reset before immediate new input", async () => {
    const { input, form, completed } = fixture()
    edit(input, "001234"); await flush()
    form.reset(); edit(input, "001234"); await flush()
    expect(completed).toHaveBeenCalledTimes(2)
  })
  it("a successful reset ends old composition before immediate noncomposing input", async () => {
    const { input, form, completed } = fixture()
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    form.reset(); edit(input, "001234"); await flush()
    expect(completed).toHaveBeenCalledOnce()
  })
  it("a later cancelled reset cannot revive a notification cancelled by a successful reset", async () => {
    const { input, form, completed } = fixture()
    edit(input, "001234"); form.reset()
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(completed).not.toHaveBeenCalled(); expect(input.value).toBe("")
  })
  it("reset cancels pending completion and independently ends old composition", async () => {
    const { input, form, helper, completed } = fixture()
    edit(input, "001234"); form.reset(); await flush(); expect(completed).not.toHaveBeenCalled()
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); form.reset(); helper.refresh(); await flush()
    edit(input, "001234"); await flush(); expect(completed).toHaveBeenCalledOnce()
  })
  it("old reset cleanup cannot cancel new post-reset edits or a new composition session", async () => {
    const { input, form, helper, completed } = fixture()
    form.reset(); edit(input, "001234"); await flush(); expect(completed).toHaveBeenCalledOnce()
    form.reset(); input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); await flush()
    expect(helper.complete).toBe(false); input.value = "005678"
    input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true })); await flush()
    expect(completed).toHaveBeenCalledOnce()
  })
})

describe("ownership, cleanup and Form coexistence", () => {
  it("restores only owned status text/attributes and leaves external replacements alone", () => {
    const { helper, status } = fixture()
    status.textContent = "Application status"; status.setAttribute("data-input-otp-state", "external")
    helper.disconnect()
    expect(status.textContent).toBe("Application status"); expect(status.dataset.inputOtpState).toBe("external")
  })
  it("removes status decorations but never original native attributes on disconnect", () => {
    const { input, helper, status } = fixture(); const before = input.outerHTML
    helper.disconnect(); expect(input.outerHTML).toBe(before)
    expect(status.textContent).toBe("Original status"); expect(status.hasAttribute("data-input-otp-state")).toBe(false)
  })
  it("disconnects invalidated status/control anatomy and cancels deferred notification", async () => {
    const { input, helper, completed, status } = fixture()
    edit(input, "001234"); status.setAttribute("aria-live", "polite"); await flush()
    expect(helper.connected).toBe(false); expect(completed).not.toHaveBeenCalled()
  })
  it.each(['aria-live="assertive"', 'role="status"', 'role="alert"', 'role="log"'])("rejects effective live-region status ancestry (%s)", async attributes => {
    const { helper, status, input } = fixture()
    const parent = document.createElement("div")
    parent.innerHTML = `<div ${attributes}></div>`; document.body.append(parent); parent.firstElementChild!.append(status)
    await flush(); expect(helper.connected).toBe(false)
    expect(() => createInputOtp(input, { status })).toThrow("nonlive")
  })
  it("removal/disposal clears pending work and never reattaches fields", async () => {
    const { input, helper, completed } = fixture()
    edit(input, "001234"); input.remove(); await flush(); helper.disconnect()
    expect(helper.connected).toBe(false); expect(completed).not.toHaveBeenCalled(); expect(input.isConnected).toBe(false)
  })
  it.each(["otp-first", "input-first"])("coexists with Input/Form and native custom validity (%s teardown)", async order => {
    const { input, form, helper, completed } = fixture()
    const entry = createInput(document.querySelector("#root")!), coordinator = createForm(form, { items: [{
      key: "code", controls: [input], feedback: document.querySelector("#feedback")!,
    }] }); helpers.push(entry, coordinator)
    await coordinator.validate(); expect(input.getAttribute("aria-describedby")).toBe("help feedback")
    entry.setValue("001234"); helper.refresh(); coordinator.refresh(); await flush()
    expect(completed).not.toHaveBeenCalled(); expect(input.getAttribute("aria-describedby")).toBe("help")
    input.setCustomValidity("Application owned"); helper.refresh()
    if (order === "otp-first") { helper.disconnect(); entry.disconnect() } else { entry.disconnect(); helper.disconnect() }
    coordinator.disconnect()
    expect(input.value).toBe("001234"); expect(input.validationMessage).toBe("Application owned")
    expect(input.getAttribute("aria-describedby")).toBe("help")
  })
})
