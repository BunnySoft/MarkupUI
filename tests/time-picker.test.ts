import { afterEach, describe, expect, it, vi } from "vitest"
import { createTimePicker, isTimePickerSupported } from "../src/components/time-picker/index.js"
import { isDatePickerTypeSupported, createDatePicker } from "../src/components/date-picker/index.js"
import type { NativeDateType } from "../src/components/date-picker/index.js"
import { createForm } from "../src/components/form/index.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 20))
function fixture() {
  document.body.innerHTML = `<form id="form"><fieldset data-time-picker id="root"><legend>Clock</legend>
    <label for="time">Time <input data-time-control id="time" type="time" name="clock.time" value="09:30" step="0.001"></label>
    <p data-time-output hidden>Original output</p><button type="button" data-time-clear hidden>Clear</button></fieldset>
    <button name="intent" value="save">Submit</button></form><p id="feedback" hidden></p><button id="outside" type="button">Outside</button>`
  const root = document.querySelector<HTMLFieldSetElement>("#root")!, form = document.querySelector("form")!
  const helper = createTimePicker(root); helpers.push(helper)
  return { root, form, helper, control: helper.control, output: root.querySelector<HTMLElement>("[data-time-output]")!, clear: root.querySelector<HTMLButtonElement>("[data-time-clear]")! }
}
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("time-only native grammar, not a date or instant model", () => {
  it("reuses native capability probing without adding fields or broadening Date Picker", () => {
    const { helper, control, form, root } = fixture()
    expect(isTimePickerSupported(document)).toBe(true)
    expect(isDatePickerTypeSupported(document, "time" as NativeDateType)).toBe(false)
    helper.disconnect(); root.removeAttribute("data-time-picker"); root.setAttribute("data-date-picker", ""); control.setAttribute("data-date-control", "")
    expect(() => createDatePicker(root)).toThrow("supported native")
    expect(form.querySelectorAll("input")).toHaveLength(1)
  })
  it.each(["00:00", "23:59", "09:05", "00:00:00", "12:34:56", "12:34:56.100", "12:34:56.010", "12:34:56.001", "23:59:59.999", "12:34:00.000", "12:34:56.500"])("accepts %s without losing native precision", value => {
    const { helper, control } = fixture()
    const native = document.createElement("input"); native.type = "time"; native.value = value
    helper.setValue(value)
    expect(helper.value).toBe(native.value); expect(control.valueAsNumber).toBe(native.valueAsNumber)
    expect(control.defaultValue).toBe("09:30")
  })
  it.each([["12:34:56.1", 45_296_100], ["12:34:56.01", 45_296_010]] as const)("requires faithful native short-fraction semantics for %s", (value, expected) => {
    const { helper, control } = fixture(), probe = document.createElement("input")
    probe.type = "time"; probe.value = value
    if (probe.valueAsNumber === expected) {
      helper.setValue(value); expect(control.valueAsNumber).toBe(expected)
    } else {
      // Existing jsdom treats these fractions as 1ms; do not patch that into production.
      expect(() => helper.setValue(value)).toThrow("unsupported-precision")
      expect(control.value).toBe("09:30")
    }
  })
  it.each(["24:00", "23:59:60", "12:60", "1:30", "12:3", "12:34:5", "12:34:56.1234", "12:34Z", "12:34+08:00", "2024-01-01T12:34", "1:30 PM", " 12:34", "12:34\n", "-01:00", "１２:３４"])("rejects invalid/non-time input %j before empty sanitization", value => {
    const { helper, control } = fixture()
    expect(() => helper.setValue(value)).toThrow()
    expect(control.value).toBe("09:30"); expect(control.defaultValue).toBe("09:30")
  })
  it.each([null, undefined, 0, 45_296_789, new Date(0), ["09:00", "10:00"], { value: "09:00" }].map(value => ({ value })))("rejects epoch/null/date/object/range models", ({ value }) => {
    const { helper, control } = fixture()
    expect(() => helper.setValue(value as never)).toThrow("time-only string")
    expect(control.value).toBe("09:30")
  })
  it("keeps midnight distinct from empty and empty distinct from absent successful fields", () => {
    const { helper, control, form } = fixture()
    helper.setValue("00:00"); expect(helper.state.empty).toBe(false); expect(control.valueAsNumber).toBe(0)
    expect(new FormData(form).get("clock.time")).toBe("00:00")
    helper.setValue(""); expect(helper.state.empty).toBe(true); expect(new FormData(form).get("clock.time")).toBe("")
    control.disabled = true; expect(new FormData(form).has("clock.time")).toBe(false)
  })
  it("rejects invalid authored defaults and unsupported native modes without rewriting them", () => {
    const { helper, root, control } = fixture(); helper.disconnect()
    control.defaultValue = "24:00"
    expect(() => createTimePicker(root)).toThrow("Invalid")
    expect(control.defaultValue).toBe("24:00")
    control.defaultValue = "09:30"; control.type = "text"
    expect(() => createTimePicker(root)).toThrow("native time")
    expect(control.type).toBe("text")
  })
  it("rejects a second field rather than inventing a range API", () => {
    const { helper, root, control } = fixture(); helper.disconnect()
    const second = control.cloneNode(true) as HTMLInputElement; second.id = "second"; root.append(second)
    expect(() => createTimePicker(root)).toThrow("one owned")
  })
})

describe("native periodic bounds, step and validity", () => {
  it.each(["22:00", "23:45", "00:00", "01:30", "02:00"])("accepts %s in a native midnight-wrapping interval", value => {
    const { helper, control } = fixture()
    control.min = "22:00"; control.max = "02:00"; control.step = "900"
    helper.setValue(value)
    expect(control.validity.valid).toBe(true); expect(helper.state.nativeValid).toBe(true)
    expect(control.min).toBe("22:00"); expect(control.max).toBe("02:00")
  })
  it("does not reject min>max as a date range or clamp outside values", () => {
    const { helper, control } = fixture()
    control.min = "22:00"; control.max = "02:00"
    helper.setValue("12:00")
    expect(control.value).toBe("12:00"); expect(helper.state.nativeValid).toBe(false)
    expect(control.validity.rangeUnderflow || control.validity.rangeOverflow).toBe(true)
  })
  it("preserves native seconds step and its min/value base instead of imposing a format engine", () => {
    const { helper, control } = fixture()
    control.min = "09:05"; control.max = "18:00"; control.step = "900"
    helper.setValue("09:20"); expect(control.validity.stepMismatch).toBe(false)
    helper.setValue("09:30"); expect(control.validity.stepMismatch).toBe(true)
    control.removeAttribute("min"); control.step = "60"; helper.setValue("09:30:30")
    expect(control.validity.stepMismatch).toBe(true)
    control.step = "0.001"; helper.refresh(); expect(control.validity.stepMismatch).toBe(false)
  })
  it("keeps required/readonly/native custom validity owned by the field/application", async () => {
    const { helper, control, form } = fixture()
    control.required = true; helper.setValue(""); expect(control.validity.valueMissing).toBe(true)
    expect(helper.state.nativeValid).toBe(false)
    control.readOnly = true; helper.refresh(); expect(control.willValidate).toBe(false); expect(helper.state.nativeValid).toBe(true)
    control.readOnly = false; control.setCustomValidity("Application clock rule")
    helper.setValue("12:34"); helper.clear(); form.reset(); await flush(); helper.disconnect()
    expect(control.validationMessage).toBe("Application clock rule")
  })
})

describe("native current/default/form identity and clear semantics", () => {
  it("preserves original nodes/labels/listeners/name/defaults and one native submitter value", () => {
    const { helper, control, form } = fixture(), label = control.labels![0], listener = vi.fn()
    control.addEventListener("input", listener); helper.setValue("12:34:56.789")
    expect(control.labels![0]).toBe(label); expect(control.defaultValue).toBe("09:30")
    expect(form.querySelectorAll("input")).toHaveLength(1)
    expect([...new FormData(form, form.querySelector<HTMLButtonElement>('button[name="intent"]')!)]).toEqual([["clock.time", "12:34:56.789"], ["intent", "save"]])
    expect(listener).not.toHaveBeenCalled()
  })
  it("emits exactly one native input/change pair and clear event for explicit user clear", () => {
    const { helper, control, root } = fixture(), events: string[] = []
    control.addEventListener("input", () => events.push("input")); control.addEventListener("change", () => events.push("change"))
    root.addEventListener("mui:time-picker-clear", () => events.push("clear"))
    expect(helper.clear()).toBe(true); expect(events).toEqual(["input", "change", "clear"])
    expect(helper.clear()).toBe(false); expect(control.value).toBe("")
  })
  it("setters/refresh/reset remain silent and never turn midnight into null", async () => {
    const { helper, control, form } = fixture(), events = vi.fn()
    control.addEventListener("input", events); control.addEventListener("change", events)
    helper.setValue("00:00"); helper.refresh(); form.reset(); await flush()
    expect(control.value).toBe("09:30"); expect(events).not.toHaveBeenCalled()
  })
  it("does not duplicate native events and handles reentrant superseding updates", () => {
    const { helper, control, output } = fixture(), changed = vi.fn()
    control.addEventListener("input", () => { control.value = "18:00"; control.dispatchEvent(new Event("input", { bubbles: true })) }, { once: true })
    control.addEventListener("change", changed); helper.clear()
    expect(control.value).toBe("18:00"); expect(output.textContent).toBe("18:00"); expect(changed).not.toHaveBeenCalled()
  })
  it("cancelled reset inside clear input does not suppress its change notification", () => {
    const { helper, control, form } = fixture(), changed = vi.fn()
    form.addEventListener("reset", event => event.preventDefault())
    control.addEventListener("input", () => form.reset()); control.addEventListener("change", changed)
    helper.clear(); expect(changed).toHaveBeenCalledOnce(); expect(control.value).toBe("")
  })
  it("clear respects readonly/fieldset disabling but programmatic setters remain explicit", () => {
    const { helper, control, root, form } = fixture()
    control.readOnly = true; expect(helper.clear()).toBe(false)
    helper.setValue("10:00"); expect(control.value).toBe("10:00")
    control.readOnly = false; root.disabled = true; helper.refresh()
    expect(helper.clear()).toBe(false); expect(new FormData(form).has("clock.time")).toBe(false)
    root.querySelector("legend")!.append(control); helper.refresh(); expect(control.matches(":disabled")).toBe(false)
    expect(helper.clear()).toBe(true)
  })
  it("native reset and cancellation keep values/defaults and authored overnight bounds", async () => {
    const { helper, control, form } = fixture()
    control.min = "22:00"; control.max = "02:00"; helper.setValue("23:00")
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(control.value).toBe("23:00")
    form.reset(); await flush(); expect(control.value).toBe("09:30")
    expect(control.min).toBe("22:00"); expect(control.max).toBe("02:00")
  })
  it("retains external native form association and ignores unrelated form resets", async () => {
    const { helper, root, control, form } = fixture()
    control.setAttribute("form", form.id); document.body.append(root); helper.refresh(); helper.setValue("12:00")
    const other = document.createElement("form"); document.body.append(other); other.reset(); await flush()
    expect(control.value).toBe("12:00")
    form.reset(); await flush(); expect(control.value).toBe("09:30")
  })
})

describe("safe actions, ownership and Form coexistence", () => {
  it("recovers a hidden clear button locally without stealing outside focus", async () => {
    const { helper, control, clear } = fixture()
    clear.focus(); clear.click(); await flush(); expect(document.activeElement).toBe(control); expect(clear.hidden).toBe(true)
    helper.setValue("12:34"); const outside = document.querySelector<HTMLButtonElement>("#outside")!; outside.focus()
    helper.clear(); expect(document.activeElement).toBe(outside)
  })
  it("retains focus-handler attribute overrides after clear and later setters", () => {
    const { helper, control, clear, output } = fixture()
    clear.focus(); control.addEventListener("focus", () => { clear.disabled = true; output.hidden = true }, { once: true })
    helper.clear(); helper.setValue("12:00")
    expect(clear.disabled).toBe(true); expect(output.hidden).toBe(true)
  })
  it("preserves blur-handler action overrides before hiding a focused clear button", () => {
    const { helper, clear, output } = fixture()
    clear.focus(); clear.addEventListener("blur", () => { clear.disabled = true; output.hidden = true }, { once: true })
    helper.clear(); helper.setValue("12:00")
    expect(clear.disabled).toBe(true); expect(output.hidden).toBe(true)
  })
  it("does not continue synchronization after a clear-button blur handler disposes the owner", () => {
    const { helper, clear, output } = fixture()
    clear.focus(); clear.addEventListener("blur", () => helper.disconnect(), { once: true })
    helper.clear()
    expect(helper.connected).toBe(false); expect(output.hidden).toBe(true); expect(output.textContent).toBe("Original output")
  })
  it("respects cancelled clicks and does not clear a newer queued value", async () => {
    const { helper, control, clear } = fixture()
    clear.addEventListener("click", event => event.preventDefault(), { once: true }); clear.click(); await flush()
    expect(control.value).toBe("09:30")
    clear.click(); helper.setValue("12:00"); await flush(); expect(control.value).toBe("12:00")
  })
  it("never invokes a native chooser from construction, setters, clear or refresh", () => {
    const { helper, control } = fixture(), picker = vi.fn()
    Object.defineProperty(control, "showPicker", { value: picker, configurable: true })
    helper.setValue("12:00"); helper.clear(); helper.refresh(); helper.disconnect()
    expect(picker).not.toHaveBeenCalled()
  })
  it("rejects duplicate owners across modules and restores only owned UI state", async () => {
    const { helper, root, control, clear, output } = fixture()
    expect(() => createTimePicker(root)).toThrow("owner")
    vi.resetModules(); const other = await import("../src/components/time-picker/index.js")
    expect(() => other.createTimePicker(root)).toThrow("owner")
    helper.setValue("12:00"); output.textContent = "Application output"; helper.disconnect()
    expect(control.value).toBe("12:00"); expect(clear.hidden).toBe(true); expect(output.textContent).toBe("Application output")
    helpers.push(other.createTimePicker(root))
  })
  it("removal/disposal cancels queued clear without resetting the native value", async () => {
    const { helper, root, control, clear } = fixture()
    clear.click(); root.remove(); await flush()
    expect(helper.connected).toBe(false); expect(control.value).toBe("09:30")
  })
  it("coexists with real Form validation without owning its ARIA/custom errors", async () => {
    const { helper, control, form } = fixture()
    control.required = true; helper.setValue("")
    const validation = createForm(form, { items: [{ key: "clock", controls: [control], feedback: document.querySelector("#feedback")! }] }); helpers.push(validation)
    expect((await validation.validate()).status).toBe("invalid")
    expect(control.getAttribute("aria-describedby")).toBe("feedback")
    helper.setValue("12:00"); validation.refresh(); helper.disconnect(); validation.disconnect()
    expect(control.hasAttribute("aria-describedby")).toBe(false)
  })
})
