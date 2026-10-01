import { checkSizeRecommendation } from "../scripts/size-policy.mjs"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { TimePicker, registerTimePicker, timePickerSizes, createTimePicker, isTimePickerSupported } from "../src/components/time-picker/index.js"
import { ViewElement } from "../src/core/index.js"
import { isDatePickerTypeSupported, createDatePicker } from "../src/components/date-picker/index.js"
import type { NativeDateType } from "../src/components/date-picker/index.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"

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

describe("Time Picker default styles", () => {
  const css = readFileSync(resolve("src", "components", "time-picker", "time-picker.css"), "utf8")

  it("uses the reference Input size scale within budget", () => {
    expect(css).toContain("--_m-time-picker-height: 28px")
    expect(css).toContain("--_m-time-picker-height: 34px")
    expect(css).toContain("--_m-time-picker-height: 40px")
    checkSizeRecommendation(gzipSync(css, { level: 9 }).length, 1000, "time-picker.test.ts: gzipSync(css, { level: 9 }).length")
  })

  it("uses reference field density and light-dark roles", () => {
    expect(css).toContain("padding-inline: 12px")
    expect(css).toContain("border-radius: 3px")
    expect(css).toContain("light-dark(#333639, rgba(255, 255, 255, .82))")
  })

  it("keeps labelled native clear actions at the control height", () => {
    expect(css).toMatch(/\.m-time-picker button \{[\s\S]*block-size: var\(--_m-time-picker-height\)/)
    expect(css).not.toMatch(/text-indent:\s*-\d|font-size:\s*0/)
  })

  it("supports forced colors and print without replacing the native picker", () => {
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("@media print")
    expect(css).toContain("[data-time-clear]")
  })
})

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
    root.addEventListener("m:time-picker-clear", () => events.push("clear"))
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
  it("updates defaults using native dirty-value rules and reconnects the same concrete owner", async () => {
    const { helper, control, form, root, clear } = fixture(), changed = vi.fn()
    root.addEventListener("m:change", changed)
    helper.setDefaultValue("08:00")
    expect(helper.value).toBe("08:00")
    helper.setValue("00:00")
    helper.setDefaultValue("07:00")
    expect(helper.value).toBe("00:00")
    clear.click(); helper.disconnect()
    helper.setValue("23:00"); helper.setDefaultValue("06:00")
    helper.connect(); helper.connect(); await flush()
    expect(helper.control).toBe(control)
    expect(helper.value).toBe("23:00")
    expect(helper.defaultValue).toBe("06:00")
    expect(changed).not.toHaveBeenCalled()
    control.value = "22:00"
    control.dispatchEvent(new Event("input", { bubbles: true }))
    control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(changed).toHaveBeenCalledOnce()
    form.reset(); await flush()
    expect(helper.value).toBe("06:00")
    expect(changed).toHaveBeenCalledOnce()
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
    const other = await import("../src/components/time-picker/time-picker.js" + "?ownership-copy")
    expect(other.createTimePicker).not.toBe(createTimePicker)
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

describe("canonical TimePicker ViewElement", () => {
  it("registers only its own ViewElement and rejects conflicting definitions", () => {
    expect(TimePicker.prototype).toBeInstanceOf(ViewElement)
    expect(customElements.get("m-time-picker")).toBe(TimePicker)
    expect(TimePicker.tag).toBe("m-time-picker")
    const define = vi.fn()
    registerTimePicker({ get: () => undefined, define })
    expect(define.mock.calls.map(call => call[0])).toEqual(["m-time-picker"])
    expect(() => registerTimePicker({ get: () => HTMLElement, define })).toThrow("different")
  })

  it("exposes canonical observedAttributes and default property values", () => {
    expect(TimePicker.observedAttributes).toEqual(["value", "placeholder", "format", "clearable", "disabled", "step", "size", "aria-label"])
    const picker = new TimePicker()
    expect(picker.value).toBe("")
    expect(picker.defaultValue).toBe("")
    expect(picker.native).toBeNull()
    expect(() => picker.state).toThrow("not connected")
    expect(picker.placeholder).toBeNull()
    expect(picker.format).toBeNull()
    expect(picker.clearable).toBe(false)
    expect(picker.disabled).toBe(false)
    expect(picker.step).toBeNull()
    expect(picker.size).toBe("medium")
  })

  it("reflects properties to attributes and validates values", () => {
    const picker = new TimePicker()
    picker.value = "09:30"
    expect(picker.value).toBe("09:30")
    expect(picker.hasAttribute("value")).toBe(false)
    picker.value = ""
    expect(picker.value).toBe("")
    picker.defaultValue = "12:34"
    expect(picker.getAttribute("value")).toBe("12:34")
    expect(() => { picker.value = null as never }).toThrow("time-only string")

    picker.placeholder = "Select time"
    expect(picker.getAttribute("placeholder")).toBe("Select time")
    picker.placeholder = null
    expect(picker.hasAttribute("placeholder")).toBe(false)

    picker.format = "HH:mm"
    expect(picker.getAttribute("format")).toBe("HH:mm")
    picker.format = null
    expect(picker.hasAttribute("format")).toBe(false)

    picker.clearable = true
    expect(picker.hasAttribute("clearable")).toBe(true)
    picker.clearable = false
    expect(picker.hasAttribute("clearable")).toBe(false)

    picker.disabled = true
    expect(picker.hasAttribute("disabled")).toBe(true)
    picker.disabled = false
    expect(picker.hasAttribute("disabled")).toBe(false)

    picker.step = "1"
    expect(picker.getAttribute("step")).toBe("1")
    picker.step = null
    expect(picker.hasAttribute("step")).toBe(false)

    for (const size of timePickerSizes) {
      picker.size = size
      expect(picker.getAttribute("size")).toBe(size)
    }
    expect(() => { (picker as any).size = "invalid" }).toThrow(RangeError)
  })

  it("generates native time input and synchronizes properties", () => {
    const picker = new TimePicker()
    picker.placeholder = "Choose time"
    picker.value = "09:30"
    picker.step = "1"
    document.body.append(picker)

    expect(picker.classList.contains("m-time-picker")).toBe(true)
    const input = picker.querySelector<HTMLInputElement>("input[data-time-control]")!
    expect(input).not.toBeNull()
    expect(input.type).toBe("time")
    expect(input.value).toBe("09:30")
    expect(input.placeholder).toBe("Choose time")
    expect(input.step).toBe("1")

    picker.disabled = true
    expect(input.disabled).toBe(true)

    picker.value = "14:15"
    expect(input.value).toBe("14:15")

    picker.placeholder = "New placeholder"
    expect(input.placeholder).toBe("New placeholder")

    picker.step = "0.001"
    expect(input.step).toBe("0.001")

    picker.size = "large"
    expect(picker.getAttribute("data-size")).toBe("large")
  })

  it("emits m:change event when native input changes", () => {
    const picker = new TimePicker()
    document.body.append(picker)
    const input = picker.querySelector<HTMLInputElement>("input")!
    const listener = vi.fn()
    picker.addEventListener("m:change", listener)

    input.value = "15:45"
    input.dispatchEvent(new Event("change", { bubbles: true }))

    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toEqual({ value: "15:45" })
    expect(picker.value).toBe("15:45")
  })

  it("supports clearable and clear() method", async () => {
    const picker = new TimePicker()
    picker.clearable = true
    picker.value = "09:30"
    document.body.append(picker)

    const input = picker.querySelector<HTMLInputElement>("input")!
    expect(input.value).toBe("09:30")

    const clearBtn = picker.querySelector<HTMLButtonElement>("[data-time-clear]")!
    expect(clearBtn).not.toBeNull()
    expect(clearBtn.hidden).toBe(false)

    const listener = vi.fn()
    picker.addEventListener("m:change", listener)

    clearBtn.click()
    await flush()

    expect(picker.value).toBe("")
    expect(input.value).toBe("")
    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toEqual({ value: "" })

    picker.value = "11:00"
    expect(input.value).toBe("11:00")
    expect(picker.clear()).toBe(true)
    expect(picker.value).toBe("")
    expect(input.value).toBe("")
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it("adopts authored native inputs", () => {
    const picker = document.createElement("m-time-picker") as TimePicker
    picker.innerHTML = '<input data-time-control id="custom-field" type="time" value="09:30" aria-label="Custom time">'
    document.body.append(picker)

    const input = picker.querySelector<HTMLInputElement>("#custom-field")!
    expect(input).not.toBeNull()
    expect(picker.querySelectorAll("input")).toHaveLength(1)
    expect(picker.native).toBe(input)
    expect(picker.value).toBe("09:30")
    expect(picker.defaultValue).toBe("09:30")
    picker.value = "10:30"
    expect(input.value).toBe("10:30")
  })

  it("delegates focus and blur to the native input", () => {
    const picker = new TimePicker()
    document.body.append(picker)
    const input = picker.querySelector<HTMLInputElement>("input")!
    const focusSpy = vi.spyOn(input, "focus")
    const blurSpy = vi.spyOn(input, "blur")

    picker.focus()
    expect(focusSpy).toHaveBeenCalledOnce()

    picker.blur()
    expect(blurSpy).toHaveBeenCalledOnce()
  })

  it("upgrades properties assigned before connection", () => {
    const picker = document.createElement("m-time-picker") as TimePicker
    Object.defineProperties(picker, {
      value: { configurable: true, writable: true, value: "12:00" },
      defaultValue: { configurable: true, writable: true, value: "08:00" },
      size: { configurable: true, writable: true, value: "large" },
      clearable: { configurable: true, writable: true, value: true },
    })
    document.body.append(picker)

    expect(picker.value).toBe("12:00")
    expect(picker.native!.value).toBe("12:00")
    expect(picker.defaultValue).toBe("08:00")
    expect(picker.size).toBe("large")
  })

  it.each(["24:00", "12:60", "1:30", "12:34Z", "12:34:56.1234", "12:34+08:00", " 12:34"])("rejects %j atomically through live and default APIs", value => {
    const picker = new TimePicker()
    picker.defaultValue = "09:30"
    document.body.append(picker)
    picker.value = "10:00"
    expect(() => { picker.value = value }).toThrow()
    expect(() => { picker.defaultValue = value }).toThrow()
    expect(picker.value).toBe("10:00")
    expect(picker.native!.value).toBe("10:00")
    expect(picker.defaultValue).toBe("09:30")
    expect(picker.getAttribute("value")).toBe("09:30")
  })

  it.each(["00:00", "00:00:00", "12:34:56.100", "12:34:56.010", "12:34:56.001", "23:59:59.999"])("retains %s precision and native validity independently of the format hint", value => {
    const picker = new TimePicker()
    picker.format = "HH:mm"
    picker.step = "0.001"
    document.body.append(picker)
    picker.value = value
    const probe = document.createElement("input"); probe.type = "time"; probe.value = value
    expect(picker.value).toBe(probe.value)
    expect(picker.native!.valueAsNumber).toBe(probe.valueAsNumber)
    expect(picker.state.nativeValid).toBe(true)
    expect(picker.state.value).toBe(picker.value)
    expect(Object.isFrozen(picker.state)).toBe(true)
    picker.step = "60"
    expect(picker.value).toBe(probe.value)
    expect(picker.state.nativeValid).toBe(picker.native!.validity.valid)
  })

  it.each([["12:34:56.1", 45_296_100], ["12:34:56.01", 45_296_010]] as const)("does not silently accept an unsupported native fraction %s", (value, coordinate) => {
    const picker = new TimePicker()
    document.body.append(picker)
    const probe = document.createElement("input"); probe.type = "time"; probe.value = value
    if (probe.valueAsNumber === coordinate) {
      picker.value = value
      expect(picker.native!.valueAsNumber).toBe(coordinate)
    } else {
      expect(() => { picker.value = value }).toThrow("unsupported-precision")
      expect(picker.value).toBe("")
    }
  })

  it("maps value markup to native defaults without clobbering a dirty live value", async () => {
    const form = document.createElement("form"), picker = new TimePicker(), events = vi.fn()
    picker.setAttribute("value", "09:30")
    form.append(picker); document.body.append(form)
    picker.addEventListener("input", events); picker.addEventListener("change", events); picker.addEventListener("m:change", events)
    picker.defaultValue = "08:00"
    expect(picker.value).toBe("08:00")
    picker.value = "10:00"
    picker.setAttribute("value", "07:00")
    expect(picker.value).toBe("10:00")
    expect(picker.defaultValue).toBe("07:00")
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush(); expect(picker.value).toBe("10:00")
    form.reset(); await flush(); expect(picker.value).toBe("07:00")
    expect(picker.state.value).toBe("07:00")
    picker.removeAttribute("value")
    expect(picker.defaultValue).toBe("")
    form.reset(); await flush(); expect(picker.value).toBe("")
    expect(events).not.toHaveBeenCalled()
  })

  it("preserves authored nodes, labels, form association and native constraints", async () => {
    const form = document.createElement("form"); form.id = "external"; document.body.append(form)
    const picker = new TimePicker()
    picker.innerHTML = `<label for="authored-clock">Clock</label><input id="authored-clock" type="time"
      name="clock" form="external" value="23:00" min="22:00" max="02:00" step="0.001" required>
      <span data-time-output hidden>Original</span><button data-time-clear type="button" hidden>Clear clock</button>`
    const input = picker.querySelector("input")!, label = picker.querySelector("label")!, listener = vi.fn()
    input.addEventListener("input", listener)
    document.body.append(picker)
    expect(picker.native).toBe(input)
    expect(input.labels![0]).toBe(label)
    expect(input.form).toBe(form)
    expect(input.min).toBe("22:00"); expect(input.max).toBe("02:00"); expect(input.step).toBe("0.001")
    picker.value = "00:00"
    expect([...new FormData(form)]).toEqual([["clock", "00:00"]])
    expect(listener).not.toHaveBeenCalled()
    picker.disabled = true
    expect(new FormData(form).has("clock")).toBe(false)
    picker.disabled = false
    picker.value = "12:00"; expect(picker.state.nativeValid).toBe(false)
    form.reset(); await flush()
    expect(picker.value).toBe("23:00")
    expect(picker.defaultValue).toBe("23:00")
    expect(input.validationMessage).toBe("")
  })

  it("keeps native events bubbling and deduplicates m:change across input/change", () => {
    const picker = new TimePicker(); document.body.append(picker)
    const events: string[] = []
    for (const name of ["input", "change", "m:change"]) picker.addEventListener(name, () => events.push(name))
    picker.native!.value = "10:00"
    picker.native!.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
    picker.native!.dispatchEvent(new Event("change", { bubbles: true }))
    expect(events).toEqual(["m:change", "input", "change"])
    expect(picker.getAttribute("value")).toBeNull()
    picker.value = "12:00"
    expect(events).toHaveLength(3)
    picker.clear()
    expect(events.slice(3)).toEqual(["m:change", "input", "change"])
    expect(picker.clear()).toBe(false)
    expect(events).toHaveLength(6)
  })

  it("retains edited live values during scalar mapping updates without rewriting defaults", () => {
    const picker = new TimePicker(); picker.defaultValue = "09:30"; document.body.append(picker)
    picker.native!.value = "15:45"
    picker.native!.dispatchEvent(new Event("input", { bubbles: true }))
    picker.placeholder = "Later"; picker.step = "1"; picker.size = "large"; picker.format = "HH:mm"
    picker.clearable = true
    expect(picker.value).toBe("15:45")
    expect(picker.native!.value).toBe("15:45")
    expect(picker.defaultValue).toBe("09:30")
    expect(picker.getAttribute("value")).toBe("09:30")
  })

  it("does not notify a stale clear change after a public change listener supersedes the value", () => {
    const picker = new TimePicker(); picker.value = "09:30"; document.body.append(picker)
    const changed = vi.fn(), cleared = vi.fn()
    picker.addEventListener("m:change", () => { picker.value = "18:00" }, { once: true })
    picker.addEventListener("change", changed); picker.addEventListener("m:time-picker-clear", cleared)
    expect(picker.clear()).toBe(true)
    expect(picker.value).toBe("18:00")
    expect(picker.native!.value).toBe("18:00")
    expect(changed).not.toHaveBeenCalled(); expect(cleared).not.toHaveBeenCalled()
  })

  it("toggles clearability without replacing actions and respects readonly/disabled", async () => {
    const picker = new TimePicker(); picker.defaultValue = "09:30"; document.body.append(picker)
    const button = picker.querySelector<HTMLButtonElement>("[data-time-clear]")!
    expect(button.hidden).toBe(true)
    picker.clearable = true; expect(button.hidden).toBe(false)
    button.addEventListener("click", event => event.preventDefault(), { once: true })
    button.click(); await flush(); expect(picker.value).toBe("09:30")
    picker.native!.readOnly = true; picker.refresh()
    expect(picker.clear()).toBe(false); expect(button.disabled).toBe(true)
    picker.value = "12:00"; expect(picker.value).toBe("12:00")
    picker.native!.readOnly = false; picker.disabled = true
    expect(picker.clear()).toBe(false)
    picker.disabled = false; picker.clearable = false
    expect(button.hidden).toBe(true)
    expect(picker.clear()).toBe(true)
    picker.value = "13:00"; picker.clearable = true
    expect(picker.querySelector("[data-time-clear]")).toBe(button)
    expect(button.hidden).toBe(false)
  })

  it("reconnects the same owner and nodes, cancelling stale queued actions", async () => {
    const form = document.createElement("form"), picker = new TimePicker()
    picker.defaultValue = "09:30"; picker.clearable = true
    form.append(picker); document.body.append(form)
    const input = picker.native!, button = picker.querySelector<HTMLButtonElement>("[data-time-clear]")!, changed = vi.fn()
    picker.addEventListener("m:change", changed)
    button.click(); picker.remove()
    picker.value = "00:00"
    expect(picker.value).toBe(input.value)
    picker.defaultValue = "07:30"
    form.append(picker); await flush()
    expect(picker.native).toBe(input); expect(picker.value).toBe("00:00")
    expect(picker.defaultValue).toBe("07:30")
    expect(picker.querySelectorAll("input")).toHaveLength(1)
    expect(picker.querySelector("[data-time-clear]")).toBe(button)
    expect(changed).not.toHaveBeenCalled()
    button.click(); await flush()
    expect(changed).toHaveBeenCalledOnce(); expect(picker.value).toBe("")
    form.reset(); await flush(); expect(picker.value).toBe("07:30")
    picker.remove(); picker.setAttribute("value", "06:00"); form.append(picker)
    form.reset(); await flush(); expect(picker.value).toBe("06:00")
  })

  it("restores only its own native mappings, retaining later application edits", () => {
    const picker = new TimePicker()
    picker.innerHTML = '<input type="time" value="09:30" aria-label="Authored" step="900" placeholder="Authored hint">'
    picker.step = "1"; picker.placeholder = "Mapped"; picker.setAttribute("aria-label", "Mapped clock")
    document.body.append(picker)
    const input = picker.native!
    input.placeholder = "Application"
    picker.remove()
    expect(input.step).toBe("900")
    expect(input.placeholder).toBe("Application")
    expect(input.getAttribute("aria-label")).toBe("Authored")
    document.body.append(picker)
    expect(input.step).toBe("1")
    picker.step = null
    expect(input.step).toBe("900")
  })

  it("allows disconnected data writes after releasing a host-mapped native label", () => {
    const picker = new TimePicker()
    picker.innerHTML = '<input type="time" value="09:30">'
    picker.setAttribute("aria-label", "Mapped clock")
    document.body.append(picker)
    const input = picker.native!
    picker.remove()
    expect(input.hasAttribute("aria-label")).toBe(false)
    picker.value = "00:00"; picker.defaultValue = "08:00"
    expect(input.value).toBe("00:00"); expect(input.defaultValue).toBe("08:00")
    document.body.append(picker)
    expect(picker.native).toBe(input)
    expect(picker.value).toBe("00:00")
    expect(input.getAttribute("aria-label")).toBe("Mapped clock")
  })

  it("reports automatic errors, preserving invalid markup rather than sanitizing it into success", async () => {
    const picker = new TimePicker(), errors = vi.fn()
    picker.addEventListener("m:error", errors)
    picker.setAttribute("value", "24:00")
    document.body.append(picker)
    expect(errors).toHaveBeenCalledOnce()
    expect(picker.getAttribute("value")).toBe("24:00")
    expect(() => picker.state).toThrow("not connected")
    picker.remove(); picker.setAttribute("value", "09:30"); document.body.append(picker)
    expect(picker.value).toBe("09:30")
    picker.native!.type = "text"
    await flush()
    expect(errors).toHaveBeenCalledTimes(2)
    expect(() => picker.clear()).toThrow("not connected")
    expect(picker.native!.type).toBe("text")
  })

  it("never exposes a pending value as the live value of a failed native enhancement", () => {
    const picker = new TimePicker(), errors = vi.fn()
    picker.value = "12:00"
    picker.innerHTML = '<input type="time" value="09:30">'
    picker.addEventListener("m:error", errors); document.body.append(picker)
    expect(errors).toHaveBeenCalledOnce()
    expect(picker.value).toBe(picker.native!.value)
    expect(picker.value).toBe("09:30")
    expect(() => { picker.value = "14:00" }).toThrow("enhancement is unavailable")
    expect(picker.native!.value).toBe("09:30")
    picker.remove(); picker.native!.setAttribute("aria-label", "Fixed clock"); document.body.append(picker)
    expect(picker.value).toBe("12:00")
    expect(picker.value).toBe(picker.native!.value)
  })

  it("rejects unlabelled, multiple and nested native owners without cloning authored content", () => {
    for (const content of [
      '<input type="time">',
      '<input type="time" aria-label="One"><input type="time" aria-label="Two">',
    ]) {
      const picker = new TimePicker(), errors = vi.fn()
      picker.innerHTML = content
      const nodes = [...picker.children]
      picker.addEventListener("m:error", errors); document.body.append(picker)
      expect(errors).toHaveBeenCalledOnce()
      expect(() => picker.state).toThrow("not connected")
      expect([...picker.children].slice(0, nodes.length)).toEqual(nodes)
      picker.remove()
    }
    const outer = new TimePicker(), inner = new TimePicker()
    inner.defaultValue = "08:00"; outer.append(inner); document.body.append(outer)
    expect(outer.native).not.toBe(inner.native)
    outer.value = "12:00"; expect(inner.value).toBe("08:00")
  })
})
