import { afterEach, describe, expect, it, vi } from "vitest"
import { createInputOtp, InputOtp, registerInputOtp, inputOtpSizes } from "../src/components/input-otp/index.js"
import type { InputOtpOptions, InputOtpSize } from "../src/components/input-otp/index.js"
import { ViewElement } from "../src/core/index.js"
import { createInput } from "../src/components/native-input.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(options: InputOtpOptions = {}, initial = "") {
  const length = options.length ?? 6, characters = options.characters ?? "digits"
  document.body.innerHTML = `<form id="codes"><label for="code">Code</label><div class="m-input" data-input id="root">
    <input class="m-input-otp" data-input-control id="code" name="code[0].text" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="${length}" pattern="${characters === "digits" ? "[0-9]" : "[A-Za-z0-9]"}{${length}}" required aria-describedby="help"></div>
    <button name="intent" value="local">Continue</button></form><p id="help">Help</p><p id="status">Original status</p><p id="feedback" hidden></p><button id="outside" type="button">Outside</button>`
  const input = document.querySelector<HTMLInputElement>("#code")!, status = document.querySelector<HTMLElement>("#status")!
  input.defaultValue = initial
  const helper = createInputOtp(input, { ...options, status }); helpers.push(helper)
  const completed = vi.fn(); input.addEventListener("m:input-otp-complete", completed)
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
    const other = await import("../src/components/input-otp/input-otp.js" + "?ownership-copy")
    expect(other.createInputOtp).not.toBe(createInputOtp)
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
  it("does not confuse a dirty default mutation with a later native edit", async () => {
    const { input, completed, form } = fixture()
    input.defaultValue = "005678"; edit(input, "001234"); input.defaultValue = "009876"
    await flush(); expect(completed).toHaveBeenCalledOnce(); expect(input.value).toBe("001234")
    form.reset(); await flush()
    expect(input.value).toBe("009876"); expect(completed).toHaveBeenCalledOnce()
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

describe("canonical InputOtp ViewElement", () => {
  it("exports canonical own-tag ViewElements and registers input-otp elements", () => {
    expect(InputOtp.tag).toBe("m-input-otp")
    expect(ViewElement.prototype.isPrototypeOf(InputOtp.prototype)).toBe(true)
    expect(customElements.get("m-input-otp")).toBe(InputOtp)
    expect(InputOtp.observedAttributes).toEqual([
      "value", "length", "characters", "pattern", "disabled", "mask", "size", "name", "form",
      "required", "readonly", "aria-label", "aria-labelledby", "aria-describedby",
    ])

    const define = vi.fn()
    expect(() => registerInputOtp({ get: name => name === "m-input-otp" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerInputOtp()).not.toThrow()
  })

  describe("shared InputOtp owner and typed native mapping", () => {
    function element(markup = "") {
      const otp = document.createElement("m-input-otp") as InputOtp
      otp.innerHTML = markup
      document.body.append(otp)
      return otp
    }

    it("computes live values from the sole field and maps the value attribute only to reset defaults", async () => {
      const form = document.createElement("form"), otp = document.createElement("m-input-otp") as InputOtp
      otp.setAttribute("value", "001234"); otp.name = "otp[0].text"; form.append(otp); document.body.append(form)
      const input = otp.native!, complete = vi.fn()
      otp.addEventListener("m:input-otp-complete", complete)
      expect(otp.value).toBe("001234"); expect(otp.defaultValue).toBe("001234"); expect(otp.form).toBe(form)
      otp.value = "invalid draft beyond maxlength"
      expect(new FormData(form).getAll("otp[0].text")).toEqual(["invalid draft beyond maxlength"])
      expect(otp.getAttribute("value")).toBe("001234"); expect(otp.complete).toBe(false)
      otp.defaultValue = "005678"
      expect(otp.value).toBe("invalid draft beyond maxlength"); expect(input.defaultValue).toBe("005678")
      form.reset(); await flush()
      expect(otp.value).toBe("005678"); expect(otp.complete).toBe(true); expect(complete).not.toHaveBeenCalled()
      edit(input, "00567"); expect(otp.value).toBe("00567"); expect(otp.getAttribute("value")).toBe("005678")
      form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
      expect(otp.value).toBe("00567")
      otp.clear(); expect(input.value).toBe(""); expect(input.defaultValue).toBe("005678")
      otp.removeAttribute("value"); form.reset(); await flush(); expect(otp.value).toBe("")
    })

    it("retains authored identity, labels, ARIA, defaults, listeners and native disables/masking", () => {
      const otp = document.createElement("m-input-otp") as InputOtp
      otp.innerHTML = '<label for="authored">Code</label><input id="authored" name="code" maxlength="4" value="AB01" pattern="[A-Z0-9]{4}" type="password" disabled aria-label="Original" aria-describedby="help">'
      const input = otp.querySelector("input")!, label = otp.querySelector("label")!, listener = vi.fn()
      input.addEventListener("input", listener); document.body.append(otp)
      expect(otp.native).toBe(input); expect(input.labels![0]).toBe(label); expect(otp.length).toBe(4)
      expect(otp.disabled).toBe(true); expect(otp.mask).toBe(true); expect(otp.defaultValue).toBe("AB01")
      expect(otp.pattern).toBe("[A-Z0-9]{4}"); expect(input.getAttribute("aria-label")).toBe("Original")
      expect(input.getAttribute("aria-describedby")).toBe("help"); expect(otp.name).toBe("code")
      otp.disabled = false; otp.mask = false; input.focus(); input.setSelectionRange(1, 3)
      input.name = "actual-code"; expect(otp.name).toBe("actual-code")
      otp.refresh(); expect(document.activeElement).toBe(input); expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3])
      edit(input, "AB02"); expect(listener).toHaveBeenCalledOnce(); expect(otp.value).toBe("AB02")
      expect(otp.querySelectorAll("input")).toHaveLength(1)
    })

    it("updates schema on the same owner without losing drafts, defaults, focus or selection", async () => {
      const otp = element(), input = otp.native!, completed = vi.fn()
      otp.addEventListener("m:input-otp-complete", completed)
      otp.value = "001234"; otp.defaultValue = "005678"; input.focus(); input.setSelectionRange(1, 4)
      otp.length = 8; otp.characters = "alphanumeric"
      expect(otp.connected).toBe(true); expect(otp.native).toBe(input)
      expect(input.pattern).toBe("[A-Za-z0-9]{8}"); expect(input.inputMode).toBe("text")
      expect(otp.value).toBe("001234"); expect(otp.defaultValue).toBe("005678")
      expect(document.activeElement).toBe(input); expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4])
      expect(() => createInputOtp(input, { length: 8, characters: "alphanumeric" })).toThrow("owner")
      edit(input, "0aB1cD2e"); await flush()
      expect(otp.complete).toBe(true); expect(completed).toHaveBeenCalledOnce()
      expect(completed.mock.calls[0]![0].detail).toEqual({ length: 8, characters: "alphanumeric" })
      input.inputMode = "tel"; otp.length = 4; expect(input.inputMode).toBe("tel")
    })

    it("rejects invalid typed data before changing native or host state", () => {
      const otp = element(), input = otp.native!, before = input.outerHTML
      for (const value of [null, [], {}, 123456, true]) {
        expect(() => { otp.value = value as never }).toThrow("string")
        expect(() => { otp.defaultValue = value as never }).toThrow("string")
        expect(() => { otp.name = value as never }).toThrow("string")
      }
      for (const value of [null, [], {}, "6", 0, 13, NaN]) expect(() => { otp.length = value as never }).toThrow()
      for (const value of [null, [], {}, "unicode"]) expect(() => { otp.characters = value as never }).toThrow()
      for (const value of [null, [], {}, "false"]) {
        expect(() => { otp.disabled = value as never }).toThrow()
        expect(() => { otp.mask = value as never }).toThrow()
      }
      expect(() => { otp.pattern = "[" }).toThrow(SyntaxError)
      expect(input.outerHTML).toBe(before); expect(otp.hasAttribute("value")).toBe(false)
    })

    it.each(["", "0", "-1", "13", "4.5", "invalid"])("rejects an authored invalid maxlength %j instead of silently adopting six", length => {
      const otp = document.createElement("m-input-otp") as InputOtp
      otp.innerHTML = `<input maxlength="${length}">`
      expect(() => otp.length).toThrow()
      expect(otp.native!.getAttribute("maxlength")).toBe(length)
    })

    it("preserves custom native pattern capability and resets an override explicitly", async () => {
      const otp = element('<input maxlength="4" pattern="[A-Z]{4}" value="ABCD">'), input = otp.native!
      const completed = vi.fn(); otp.addEventListener("m:input-otp-complete", completed)
      expect(otp.complete).toBe(true)
      otp.length = 6; expect(input.pattern).toBe("[A-Z]{4}"); expect(input.value).toBe("ABCD")
      otp.pattern = "[A-Z]{6}"; edit(input, "ABCDEF"); await flush()
      expect(otp.complete).toBe(true); expect(completed).toHaveBeenCalledOnce()
      otp.pattern = null; expect(input.pattern).toBe("[0-9]{6}"); expect(otp.complete).toBe(false)
      otp.pattern = "[A-Z]{6}"; otp.removeAttribute("pattern")
      expect(input.pattern).toBe("[0-9]{6}")
      otp.pattern = ""; expect(input.pattern).toBe(""); expect(otp.complete).toBe(false)
    })

    it("leaves Unicode and paste as one native draft, deferring completion through composition", async () => {
      const otp = element(), input = otp.native!, completed = vi.fn(), nativeEvents = vi.fn()
      otp.addEventListener("m:input-otp-complete", completed); otp.addEventListener("input", nativeEvents)
      edit(input, "１２３４５６"); await flush()
      expect(otp.value).toBe("１２３４５６"); expect(otp.complete).toBe(false)
      const paste = new Event("paste", { bubbles: true, cancelable: true })
      input.dispatchEvent(paste); expect(paste.defaultPrevented).toBe(false)
      otp.length = 2; otp.pattern = ".+"
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
      input.value = "e\u0301"; input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
      await flush(); expect(otp.complete).toBe(false); expect(completed).not.toHaveBeenCalled()
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
      input.dispatchEvent(new InputEvent("input", { bubbles: true })); await flush()
      expect(otp.value).toBe("e\u0301"); expect(otp.complete).toBe(true); expect(completed).toHaveBeenCalledOnce()
      otp.value = "😀"; expect(otp.value).toBe("😀"); expect(otp.complete).toBe(true)
      expect(nativeEvents).toHaveBeenCalledTimes(3); expect(otp.querySelectorAll("input")).toHaveLength(1)
    })

    it("suppresses unavailable completion and preserves native fieldset/name/form semantics", async () => {
      const form = document.createElement("form"), fieldset = document.createElement("fieldset")
      const otp = document.createElement("m-input-otp") as InputOtp, completed = vi.fn()
      otp.name = "code"; otp.required = true; fieldset.append(otp); form.append(fieldset); document.body.append(form)
      otp.addEventListener("m:input-otp-complete", completed)
      fieldset.disabled = true; otp.refresh(); edit(otp.native!, "001234"); await flush()
      expect(completed).not.toHaveBeenCalled(); expect(new FormData(form).getAll("code")).toEqual([])
      fieldset.disabled = false; otp.clear(); otp.readOnly = true; edit(otp.native!, "005678"); await flush()
      expect(completed).not.toHaveBeenCalled(); expect(new FormData(form).getAll("code")).toEqual(["005678"])
      otp.readOnly = false; otp.clear(); edit(otp.native!, "005678"); await flush()
      expect(completed).toHaveBeenCalledOnce()
    })

    it("does not recreate invalidated owners until explicitly connected with valid native anatomy", async () => {
      const otp = element(), input = otp.native!, completed = vi.fn()
      otp.addEventListener("m:input-otp-complete", completed)
      edit(input, "001234"); input.type = "number"; await flush()
      expect(otp.connected).toBe(false); expect(completed).not.toHaveBeenCalled()
      expect(() => otp.connect()).toThrow("Author"); otp.refresh(); expect(otp.connected).toBe(false)
      input.type = "text"; otp.connect(); expect(otp.connected).toBe(true); expect(otp.value).toBe("001234")
      expect(otp.complete).toBe(true); expect(completed).not.toHaveBeenCalled()
    })

    it("shares native ownership across element and enhancement and restores optional status on detach", async () => {
      const status = document.createElement("p"); status.textContent = "Original status"; document.body.append(status)
      const otp = document.createElement("m-input-otp") as InputOtp
      otp.status = status; document.body.append(otp)
      const input = otp.native!, completed = vi.fn()
      otp.addEventListener("m:input-otp-complete", completed)
      expect(() => createInputOtp(input)).toThrow("owner")
      expect(() => { otp.status = null }).toThrow("Disconnect")
      edit(input, "001234"); otp.remove(); await flush()
      expect(otp.connected).toBe(false); expect(completed).not.toHaveBeenCalled(); expect(status.textContent).toBe("Original status")
      document.body.append(otp); expect(otp.native).toBe(input); expect(otp.value).toBe("001234")
      expect(otp.connected).toBe(true); expect(completed).not.toHaveBeenCalled()
      otp.clear(); edit(input, "005678"); await flush(); expect(completed).toHaveBeenCalledOnce()
      otp.disconnect(); expect(status.textContent).toBe("Original status")
      const enhancement = createInputOtp(input); helpers.push(enhancement)
      expect(() => otp.connect()).toThrow("owner")
      enhancement.disconnect(); otp.status = null; otp.connect(); expect(otp.connected).toBe(true)
    })

    it("restores only leased presentation, retaining author attributes and later native styles", () => {
      const otp = document.createElement("m-input-otp") as InputOtp
      otp.innerHTML = '<input class="author" data-size="custom" style="--m-input-otp-length:9!important" value="001234">'
      const input = otp.querySelector("input")!, priority = input.style.getPropertyPriority("--m-input-otp-length")
      document.body.append(otp)
      expect(input.classList.contains("m-input-otp")).toBe(true); otp.remove()
      expect(input.className).toBe("author"); expect(input.dataset.size).toBe("custom")
      expect(input.style.getPropertyValue("--m-input-otp-length")).toBe("9")
      expect(input.style.getPropertyPriority("--m-input-otp-length")).toBe(priority)
      document.body.append(otp)
      input.dataset.size = "external"; input.style.setProperty("--m-input-otp-length", "11", "important")
      otp.remove()
      expect(input.dataset.size).toBe("external"); expect(input.style.getPropertyValue("--m-input-otp-length")).toBe("11")
      expect(input.defaultValue).toBe("001234"); expect(input.value).toBe("001234")
    })

    it("replays real own pre-upgrade writes through the existing helper without caching live values", () => {
      const otp = document.createElement("m-input-otp") as InputOtp
      otp.innerHTML = '<input id="pre-code" value="old-default">'
      for (const [name, value] of Object.entries({
        value: "0aB1", defaultValue: "00AA", length: 4, characters: "alphanumeric", mask: true,
        disabled: true, size: "small", name: "pre-code",
      })) Object.defineProperty(otp, name, { value, writable: true, configurable: true })
      const input = otp.querySelector("input")!
      document.body.append(otp)
      expect(otp.native).toBe(input); expect(otp.value).toBe("0aB1"); expect(otp.defaultValue).toBe("00AA")
      expect(otp.getAttribute("value")).toBe("00AA"); expect(input.pattern).toBe("[A-Za-z0-9]{4}")
      expect(input.type).toBe("password"); expect(input.disabled).toBe(true); expect(input.name).toBe("pre-code")
      expect(otp.size).toBe("small"); expect(Object.hasOwn(otp, "value")).toBe(false)
    })

    it("keeps enhancement schema changes explicit, strict, silent and on one native field", async () => {
      const { input, helper, completed } = fixture({}, "001234")
      input.focus(); input.setSelectionRange(1, 4)
      helper.configure({ length: 8, characters: "alphanumeric" })
      expect(helper.connected).toBe(true); expect(helper.length).toBe(8); expect(helper.characters).toBe("alphanumeric")
      expect(helper.pattern).toBe("[A-Za-z0-9]{8}")
      expect(input.value).toBe("001234"); expect(input.defaultValue).toBe("001234")
      expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4])
      const original = input.outerHTML
      for (const data of [[], null, new Date(), Object.create({ length: 4 }), { length: null }, { pattern: "[" }, { extra: true }]) {
        expect(() => helper.configure(data as never)).toThrow()
      }
      expect(input.outerHTML).toBe(original); expect(completed).not.toHaveBeenCalled()
      edit(input, "0aB1cD2e"); helper.configure({ length: 6 }); await flush()
      expect(completed).not.toHaveBeenCalled(); expect(input.value).toBe("0aB1cD2e")
      helper.disconnect(); expect(() => helper.configure({ length: 4 })).toThrow("disconnected")
    })
  })

  it("handles typed properties, attributes and defaults", () => {
    const otp = document.createElement("m-input-otp") as InputOtp
    document.body.append(otp)
    expect(otp.value).toBe("")
    expect(otp.length).toBe(6)
    expect(otp.disabled).toBe(false)
    expect(otp.mask).toBe(false)
    expect(otp.size).toBe("medium")

    otp.value = "123456"
    expect(otp.value).toBe("123456")
    expect(otp.getAttribute("value")).toBeNull()
    expect(otp.defaultValue).toBe("")

    otp.length = 4
    expect(otp.length).toBe(4)
    expect(otp.getAttribute("length")).toBe("4")
    expect(() => { (otp as any).length = 0 }).toThrow(RangeError)
    expect(() => { (otp as any).length = 13 }).toThrow(RangeError)
    expect(() => { (otp as any).length = 2.5 }).toThrow(RangeError)
    expect(() => { (otp as any).length = "6" }).toThrow(RangeError)

    otp.disabled = true
    expect(otp.disabled).toBe(true)
    expect(otp.hasAttribute("disabled")).toBe(true)
    otp.disabled = false
    expect(otp.disabled).toBe(false)
    expect(otp.hasAttribute("disabled")).toBe(false)

    otp.mask = true
    expect(otp.mask).toBe(true)
    expect(otp.hasAttribute("mask")).toBe(true)
    otp.mask = false
    expect(otp.mask).toBe(false)
    expect(otp.hasAttribute("mask")).toBe(false)

    for (const size of inputOtpSizes) {
      otp.size = size
      expect(otp.size).toBe(size)
      expect(otp.getAttribute("size")).toBe(size)
    }
    expect(() => { (otp as any).size = "xlarge" }).toThrow(RangeError)
  })

  it("generates native input and synchronizes attributes and methods", () => {
    const otp = document.createElement("m-input-otp") as InputOtp
    otp.value = "1234"
    otp.length = 4
    otp.mask = true
    otp.disabled = true
    document.body.append(otp)

    const input = otp.querySelector<HTMLInputElement>("input")!
    expect(input).not.toBeNull()
    expect(input.classList.contains("m-input-otp")).toBe(true)
    expect(input.value).toBe("1234")
    expect(input.maxLength).toBe(4)
    expect(input.type).toBe("password")
    expect(input.disabled).toBe(true)
    expect(otp.native).toBe(input)

    otp.mask = false
    expect(input.type).toBe("text")

    otp.disabled = false
    expect(input.disabled).toBe(false)

    otp.length = 8
    expect(input.maxLength).toBe(8)

    const focusSpy = vi.spyOn(input, "focus")
    const blurSpy = vi.spyOn(input, "blur")
    otp.focus()
    expect(focusSpy).toHaveBeenCalledOnce()
    otp.blur()
    expect(blurSpy).toHaveBeenCalledOnce()

    otp.clear()
    expect(otp.value).toBe("")
    expect(input.value).toBe("")
  })

  it("adopts authored native inputs", () => {
    const otp = document.createElement("m-input-otp") as InputOtp
    otp.innerHTML = '<input class="m-input-otp" id="custom-otp" value="987654" maxlength="6">'
    document.body.append(otp)

    const input = otp.querySelector<HTMLInputElement>("#custom-otp")!
    expect(input).not.toBeNull()
    expect(otp.querySelectorAll("input")).toHaveLength(1)
    expect(otp.value).toBe("987654")
    expect(otp.native).toBe(input)

    otp.value = "112233"
    expect(input.value).toBe("112233")
  })

  it("preserves native editing events and emits the owner's one metadata-only completion event", async () => {
    const otp = document.createElement("m-input-otp") as InputOtp
    document.body.append(otp)

    const changeSpy = vi.fn()
    const completeSpy = vi.fn()
    otp.addEventListener("input", changeSpy)
    otp.addEventListener("m:input-otp-complete", completeSpy)
    const obsolete = vi.fn()
    otp.addEventListener("m:change", obsolete)
    otp.addEventListener("m:complete", obsolete)

    const input = otp.querySelector<HTMLInputElement>("input")!

    input.value = "123"
    input.dispatchEvent(new Event("input", { bubbles: true }))

    expect(changeSpy).toHaveBeenCalledOnce()
    expect(changeSpy.mock.calls[0]![0].target).toBe(input)
    expect(changeSpy.mock.calls[0]![0].bubbles).toBe(true)
    expect(changeSpy.mock.calls[0]![0].cancelable).toBe(false)
    expect(changeSpy.mock.calls[0]![0].composed).toBe(false)
    expect(completeSpy).not.toHaveBeenCalled()

    input.value = "123456"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))
    await flush()

    expect(changeSpy).toHaveBeenCalledTimes(2)
    expect(completeSpy).toHaveBeenCalledOnce()
    expect(completeSpy.mock.calls[0]![0].detail).toEqual({ length: 6, characters: "digits" })
    expect(completeSpy.mock.calls[0]![0].target).toBe(input)
    expect(completeSpy.mock.calls[0]![0].bubbles).toBe(true)
    expect(completeSpy.mock.calls[0]![0].cancelable).toBe(false)
    expect(completeSpy.mock.calls[0]![0].composed).toBe(false)

    // Replacing complete with another complete does not infer new completion
    input.value = "654321"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    await flush()
    expect(changeSpy).toHaveBeenCalledTimes(3)
    expect(completeSpy).toHaveBeenCalledOnce()

    // Deleting to incomplete rearms completion
    input.value = "65432"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    await flush()
    expect(changeSpy).toHaveBeenCalledTimes(4)
    expect(completeSpy).toHaveBeenCalledOnce()

    input.value = "654321"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    await flush()
    expect(changeSpy).toHaveBeenCalledTimes(5)
    expect(completeSpy).toHaveBeenCalledTimes(2)
    expect(obsolete).not.toHaveBeenCalled()
  })

  it("upgrades properties assigned before connection", () => {
    const pre = document.createElement("m-input-otp") as InputOtp
    pre.value = "1234"
    pre.length = 4
    pre.disabled = true
    pre.mask = true
    pre.size = "small"
    document.body.append(pre)

    expect(pre.value).toBe("1234")
    expect(pre.length).toBe(4)
    expect(pre.disabled).toBe(true)
    expect(pre.mask).toBe(true)
    expect(pre.size).toBe("small")

    const preInput = pre.querySelector<HTMLInputElement>("input")!
    expect(preInput.value).toBe("1234")
    expect(preInput.maxLength).toBe(4)
    expect(preInput.disabled).toBe(true)
    expect(preInput.type).toBe("password")
  })
})
