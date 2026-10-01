import { afterEach, describe, expect, it, vi } from "vitest"
import { DatePicker, registerDatePicker, datePickerTypes, createDatePicker, isDatePickerTypeSupported } from "../src/components/date-picker/index.js"
import type { DatePickerType, DatePickerValue, NativeDateType } from "../src/components/date-picker/index.js"
import { ViewElement } from "../src/core/index.js"
import { coordinateForm as createForm } from "../src/components/form/controller.js"

const helpers: { disconnect(): void }[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 20))
const examples: Record<NativeDateType, string> = { date: "2024-02-29", month: "2024-02", week: "2020-W53", "datetime-local": "2024-03-10T02:30" }
function fixture(type: NativeDateType = "date", range = false) {
  document.body.innerHTML = `<form id="form"><fieldset data-date-picker id="root"><legend>Planning</legend>
    <label for="first">Start <input data-date-control id="first" type="${type}" name="when[]" value="${examples[type]}"></label>
    ${range ? `<label for="second">End <input data-date-control id="second" type="${type}" name="when[]" value="${examples[type]}"></label>` : ""}
    <p data-date-output hidden>Original output</p><button type="button" data-date-clear hidden>Clear</button></fieldset>
    <button name="intent" value="save">Submit</button></form><p id="feedback" hidden></p><button id="outside" type="button">Outside</button>`
  const root = document.querySelector<HTMLFieldSetElement>("#root")!, form = document.querySelector("form")!
  const helper = createDatePicker(root); helpers.push(helper)
  return { root, form, helper, first: helper.inputs[0]!, second: helper.inputs[1]!, clear: root.querySelector<HTMLButtonElement>("[data-date-clear]")!, output: root.querySelector<HTMLElement>("[data-date-output]")! }
}
afterEach(() => { helpers.splice(0).reverse().forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("native temporal grammar and capability boundaries", () => {
  it.each(["date", "month", "week", "datetime-local"] as const)("probes native %s off-DOM and preserves the real field/default", type => {
    const { helper, first, root, form } = fixture(type)
    const label = first.labels![0], count = root.querySelectorAll("input").length
    expect(isDatePickerTypeSupported(document, type)).toBe(true)
    helper.setValue(examples[type])
    expect(first.labels![0]).toBe(label); expect(first.defaultValue).toBe(examples[type])
    expect(root.querySelectorAll("input")).toHaveLength(count)
    expect(new FormData(form).getAll("when[]")).toEqual([examples[type]])
  })
  it.each([
    ["date", "2024-02-29"], ["date", "2000-02-29"], ["date", "0001-01-01"], ["date", "0099-12-31"], ["date", "9999-12-31"],
    ["month", "0001-01"], ["month", "9999-12"], ["week", "2020-W53"], ["week", "2021-W01"],
    ["datetime-local", "2024-03-10T02:30"], ["datetime-local", "2024-11-03T01:30"], ["datetime-local", "2024-02-29T12:30:45.500"],
  ] as const)("accepts valid calendar/wall strings %s %s without timezone conversion", (type, value) => {
    const { helper, first } = fixture(type)
    helper.setValue(value)
    const probe = document.createElement("input"); probe.type = type; probe.value = value
    expect(first.value).toBe(probe.value); expect(helper.value).toBe(probe.value)
  })
  it.each([
    ["date", "2023-02-29"], ["date", "1900-02-29"], ["date", "2100-02-29"], ["date", "2024-04-31"], ["date", "0000-01-01"],
    ["date", "10000-01-01"], ["date", "2024-2-01"], ["date", "2024-02-29Z"], ["date", "2024-02-29\n"],
    ["month", "2024-00"], ["month", "2024-13"], ["month", "2024-02-01"],
    ["week", "2021-W53"], ["week", "2024-W00"], ["week", "2024-W54"], ["week", "2024-w01"],
    ["datetime-local", "2024-01-01T24:00"], ["datetime-local", "2024-01-01T12:60"], ["datetime-local", "2024-01-01T12:30:60"],
    ["datetime-local", "2024-01-01T12:30:01.1234"], ["datetime-local", "2024-01-01 12:30"], ["datetime-local", "2024-01-01T12:30Z"],
  ] as const)("rejects invalid/nonretained %s %s before native empty normalization", (type, value) => {
    const { helper, first } = fixture(type), before = first.value
    expect(() => helper.setValue(value)).toThrow()
    expect(first.value).toBe(before); expect(first.defaultValue).toBe(examples[type])
  })
  it.each([null, undefined, 0, Date.now(), new Date(), ["2024-01-01"]].map(value => ({ value })))("rejects non-string single-field models", ({ value }) => {
    const { helper, first } = fixture()
    expect(() => helper.setValue(value as never)).toThrow()
    expect(first.value).toBe("2024-02-29")
  })
  it("normalizes native zero seconds but never supplies an instant/timezone", () => {
    const { helper, first } = fixture("datetime-local")
    helper.setValue("2024-02-29T12:30:00.000")
    expect(first.value).toBe("2024-02-29T12:30")
    expect(first.value).not.toContain("Z")
    expect(() => helper.setValue("2024-02-29T12:30+08:00")).toThrow()
  })
  it("returns false for non-native year/quarter modes and never changes a fallback field", () => {
    const { helper, root, first } = fixture(); helper.disconnect()
    expect(isDatePickerTypeSupported(document, "quarter" as NativeDateType)).toBe(false)
    first.setAttribute("type", "quarter")
    const before = first.outerHTML
    expect(() => createDatePicker(root)).toThrow("supported native")
    expect(first.outerHTML).toBe(before)
  })
  it("rejects an explicitly invalid native reset default, not the browser's sanitized empty result", () => {
    const { helper, root, first } = fixture(); helper.disconnect()
    first.setAttribute("value", "2023-02-29")
    expect(() => createDatePicker(root)).toThrow()
    expect(first.getAttribute("value")).toBe("2023-02-29")
  })
})

describe("native ranges are fields, not hidden tuples or linked bounds", () => {
  it.each(["date", "month", "week", "datetime-local"] as const)("preserves partial %s pairs and reflects order without swapping", type => {
    const { helper, first, second, form } = fixture(type, true)
    helper.setValue(["", examples[type]])
    expect(helper.state.partial).toBe(true); expect(helper.state.complete).toBe(false); expect(helper.state.ordered).toBeNull()
    expect(new FormData(form).getAll("when[]")).toEqual(["", examples[type]])
    helper.setValue([examples[type], examples[type]])
    expect(helper.state.ordered).toBe(true); expect(first.name).toBe("when[]"); expect(second.name).toBe("when[]")
  })
  it("keeps reversed values and leaves native order validation to an explicit application decision", () => {
    const { helper, first, second, form, output } = fixture("date", true)
    first.min = second.min = "2024-01-01"; first.max = second.max = "2024-12-31"
    helper.setValue(["2024-05-10", "2024-05-01"])
    expect(helper.state.complete).toBe(true); expect(helper.state.ordered).toBe(false); expect(helper.state.nativeValid).toBe(true)
    expect(form.checkValidity()).toBe(true); expect(output.textContent).toContain("End precedes start")
    expect(first.min).toBe("2024-01-01"); expect(second.min).toBe("2024-01-01"); expect(first.max).toBe("2024-12-31")
  })
  it.each([
    ["month", "2023-12", "2024-01"],
    ["week", "2020-W53", "2021-W01"],
    ["datetime-local", "2024-11-03T01:59:59.999", "2024-11-03T02:00"],
  ] as const)("orders same-mode %s coordinates without a timezone/instant conversion", (type, start, end) => {
    const { helper } = fixture(type, true)
    helper.setValue([start, end]); expect(helper.state.ordered).toBe(true)
    helper.setValue([end, start]); expect(helper.state.ordered).toBe(false)
  })
  it("validates both incoming endpoints before mutation and rejects missing tuple entries", () => {
    const { helper, first, second } = fixture("date", true)
    for (const value of [["2024-03-01", "2023-02-29"], ["2024-03-01", null], ["2024-03-01"], ["", "", ""], "", Array(2)]) {
      expect(() => helper.setValue(value as never)).toThrow()
      expect(first.value).toBe("2024-02-29"); expect(second.value).toBe("2024-02-29")
    }
  })
  it("uses actual native min/max/step/required rather than clamping valid setter strings", () => {
    const { helper, first } = fixture()
    first.min = "2024-03-01"; first.max = "2024-03-10"; first.step = "2"; first.required = true
    helper.setValue("2024-03-02")
    expect(first.validity.stepMismatch).toBe(true); expect(helper.state.nativeValid).toBe(false)
    helper.setValue("2024-02-29"); expect(first.validity.rangeUnderflow).toBe(true)
    helper.setValue("2024-03-11"); expect(first.validity.rangeOverflow).toBe(true)
    helper.setValue(""); expect(first.validity.valueMissing).toBe(true); expect(helper.state.empty).toBe(true)
  })
  it("supports native local seconds/fraction step mismatches without discarding values", () => {
    const { helper, first } = fixture("datetime-local")
    first.step = "60"; helper.setValue("2024-02-29T12:30:30")
    expect(first.validity.stepMismatch).toBe(true); expect(first.value).toContain(":30:30")
    first.step = "0.001"; helper.refresh(); expect(first.validity.stepMismatch).toBe(false)
  })
  it("never mutates authored bounds during reset after reversed or partial edits", async () => {
    const { helper, first, second, form } = fixture("date", true)
    first.min = second.min = "2020-01-01"; first.max = second.max = "2030-12-31"
    helper.setValue(["2025-12-01", "2025-01-01"]); form.reset(); await flush()
    expect(helper.value).toEqual(["2024-02-29", "2024-02-29"])
    expect(first.min).toBe("2020-01-01"); expect(second.max).toBe("2030-12-31")
  })
})

describe("clear, native events, focus and lifetime", () => {
  it("clears both endpoints before one input/change sequence per changed field", () => {
    const { helper, first, second, form } = fixture("date", true), events: string[] = [], clear = vi.fn()
    for (const [index, input] of [first, second].entries()) for (const type of ["input", "change"]) input.addEventListener(type, () => {
      events.push(`${index}:${type}`); expect(first.value).toBe(""); expect(second.value).toBe("")
    })
    document.querySelector("#root")!.addEventListener("m:date-picker-clear", clear)
    expect(helper.clear()).toBe(true); expect(events).toEqual(["0:input", "0:change", "1:input", "1:change"])
    expect(clear).toHaveBeenCalledOnce(); expect(new FormData(form).getAll("when[]")).toEqual(["", ""])
    expect(helper.clear()).toBe(false)
  })
  it("cancelled reset inside clear notifications cannot suppress the remaining endpoint events", () => {
    const { helper, first, second, form } = fixture("date", true), events: string[] = []
    form.addEventListener("reset", event => event.preventDefault())
    first.addEventListener("input", () => form.reset())
    for (const [index, input] of [first, second].entries()) for (const type of ["input", "change"]) input.addEventListener(type, () => { events.push(`${index}:${type}`) })
    helper.clear()
    expect(events).toEqual(["0:input", "0:change", "1:input", "1:change"])
    expect(helper.value).toEqual(["", ""])
  })
  it("setters/refresh/reset are silent and empty strings are successful native values", async () => {
    const { helper, first, form } = fixture(), events = vi.fn()
    first.addEventListener("input", events); first.addEventListener("change", events)
    helper.setValue(""); helper.refresh(); expect(new FormData(form).get("when[]")).toBe("")
    form.reset(); await flush(); expect(events).not.toHaveBeenCalled(); expect(first.value).toBe("2024-02-29")
  })
  it("clear respects all-or-nothing range readonly/disabled eligibility", () => {
    const { helper, first, second, root, form } = fixture("date", true)
    second.readOnly = true; helper.refresh(); expect(helper.clear()).toBe(false); expect(first.value).toBe("2024-02-29")
    second.readOnly = false; first.disabled = true; helper.refresh(); expect(helper.clear()).toBe(false)
    helper.setValue(["2024-03-01", "2024-03-02"]); expect(first.value).toBe("2024-03-01")
    first.disabled = false; root.disabled = true; helper.refresh(); expect(new FormData(form).getAll("when[]")).toEqual([])
    expect(helper.clear()).toBe(false)
  })
  it("preserves first-legend native eligibility and never opens a native picker", () => {
    const { helper, root, first } = fixture(), picker = vi.fn()
    root.querySelector("legend")!.append(first); root.disabled = true
    Object.defineProperty(first, "showPicker", { value: picker, configurable: true })
    helper.refresh(); expect(first.matches(":disabled")).toBe(false); expect(helper.clear()).toBe(true)
    expect(picker).not.toHaveBeenCalled()
  })
  it("recovers from a clear button becoming hidden, but keeps outside focus otherwise", async () => {
    const { helper, first, clear } = fixture()
    clear.focus(); clear.click(); await flush(); expect(document.activeElement).toBe(first); expect(clear.hidden).toBe(true)
    helper.setValue("2024-03-01"); const outside = document.querySelector<HTMLButtonElement>("#outside")!; outside.focus()
    helper.clear(); expect(document.activeElement).toBe(outside)
  })
  it("records application hidden/disabled writes made by focus-recovery handlers", () => {
    const { helper, first, clear, output } = fixture()
    clear.focus()
    first.addEventListener("focus", () => { output.hidden = true; clear.disabled = true }, { once: true })
    helper.clear(); helper.setValue("2024-03-01")
    expect(output.hidden).toBe(true); expect(clear.disabled).toBe(true)
  })
  it("keeps native blur callback overrides when a clear action becomes hidden", () => {
    const { helper, clear, output } = fixture()
    clear.focus(); clear.addEventListener("blur", () => { clear.disabled = true; output.hidden = true }, { once: true })
    helper.clear(); helper.setValue("2024-03-01")
    expect(clear.disabled).toBe(true); expect(output.hidden).toBe(true)
  })
  it("stops Date synchronization if a clear-button blur callback disconnects it", () => {
    const { helper, clear, output } = fixture()
    clear.focus(); clear.addEventListener("blur", () => helper.disconnect(), { once: true })
    helper.clear()
    expect(helper.connected).toBe(false); expect(output.hidden).toBe(true); expect(output.textContent).toBe("Original output")
  })
  it("cancelled clicks/resets and superseded clear requests never discard newer values", async () => {
    const { helper, first, clear, form } = fixture()
    clear.addEventListener("click", event => event.preventDefault(), { once: true }); clear.click(); await flush()
    expect(first.value).toBe("2024-02-29")
    clear.click(); helper.setValue("2024-03-01"); await flush(); expect(first.value).toBe("2024-03-01")
    form.addEventListener("reset", event => event.preventDefault(), { once: true }); form.reset(); await flush()
    expect(first.value).toBe("2024-03-01")
  })
  it("does not overwrite a newer value from reentrant native input handlers or send stale events", () => {
    const { helper, first, second } = fixture("date", true), changed = vi.fn()
    first.addEventListener("input", () => { helper.setValue(["2024-06-01", "2024-06-02"]) }, { once: true })
    second.addEventListener("input", changed); first.addEventListener("change", changed)
    helper.clear(); expect(helper.value).toEqual(["2024-06-01", "2024-06-02"]); expect(changed).not.toHaveBeenCalled()
  })
  it("preserves labels/listeners/current/default fields and native submitter identity", () => {
    const { helper, first, form } = fixture(), label = first.labels![0], listener = vi.fn()
    first.addEventListener("input", listener); helper.setValue("2024-05-01")
    expect(first.labels![0]).toBe(label); expect(first.defaultValue).toBe("2024-02-29")
    first.dispatchEvent(new Event("input", { bubbles: true })); expect(listener).toHaveBeenCalledOnce()
    expect([...new FormData(form, form.querySelector<HTMLButtonElement>('button[name="intent"]')!)]).toEqual([["when[]", "2024-05-01"], ["intent", "save"]])
  })
  it("preserves native external custom validity in clear/set/reset/dispose", async () => {
    const { helper, first, form } = fixture()
    first.setCustomValidity("Application rule"); helper.setValue("2024-03-01"); helper.clear(); form.reset(); await flush(); helper.disconnect()
    expect(first.validationMessage).toBe("Application rule")
  })
  it("keeps original actual external form association and rejects mixed owners/types", async () => {
    const { helper, root, first, second, form } = fixture("date", true)
    first.setAttribute("form", form.id); second.setAttribute("form", form.id); document.body.append(root); helper.refresh()
    helper.setValue(["2024-03-01", "2024-03-02"]); form.reset(); await flush()
    expect(helper.value).toEqual(["2024-02-29", "2024-02-29"])
    second.type = "month"; expect(() => helper.refresh()).toThrow("same-mode")
    expect(second.type).toBe("month")
  })
  it("rejects duplicate binding across module copies and restores owned action/readout state", async () => {
    const { helper, root, first, output, clear } = fixture()
    expect(() => createDatePicker(root)).toThrow("owner")
    const other = await import("../src/components/date-picker/date-picker.js" + "?ownership-copy")
    expect(other.createDatePicker).not.toBe(createDatePicker)
    expect(() => other.createDatePicker(root)).toThrow("owner")
    helper.setValue("2024-03-01"); helper.disconnect()
    expect(first.value).toBe("2024-03-01"); expect(clear.hidden).toBe(true); expect(output.textContent).toBe("Original output")
    helpers.push(other.createDatePicker(root))
  })
  it("leaves external UI replacements intact and cancels pending work on removal", async () => {
    const { helper, root, output, first, clear } = fixture()
    output.textContent = "Application output"; clear.click(); root.remove(); await flush()
    expect(helper.connected).toBe(false); expect(first.value).toBe("2024-02-29"); expect(output.textContent).toBe("Application output")
  })
  it("allows explicit Form range checks without owning custom validity or altering endpoints", async () => {
    const { helper, first, second, form } = fixture("date", true)
    const validation = createForm(form, { items: [{ key: "period", controls: [first, second], feedback: document.querySelector("#feedback")!,
      validator: () => helper.state.partial || helper.state.ordered === false ? { message: "Complete an ordered pair." } : null }] })
    helpers.push(validation); helper.setValue(["2024-04-01", "2024-03-01"])
    expect((await validation.validate()).status).toBe("invalid")
    expect(first.validity.customError).toBe(false); expect(second.validity.customError).toBe(false)
    expect(helper.value).toEqual(["2024-04-01", "2024-03-01"])
    helper.disconnect(); validation.disconnect(); expect(first.hasAttribute("aria-describedby")).toBe(false)
  })
})

describe("canonical DatePicker ViewElement", () => {
  it("registers only its own ViewElement and rejects conflicting definitions", () => {
    expect(DatePicker.prototype).toBeInstanceOf(ViewElement)
    expect(customElements.get("m-date-picker")).toBe(DatePicker)
    expect(DatePicker.tag).toBe("m-date-picker")
    const define = vi.fn()
    registerDatePicker({ get: () => undefined, define })
    expect(define.mock.calls.map(call => call[0])).toEqual(["m-date-picker"])
    expect(() => registerDatePicker({ get: () => HTMLElement, define })).toThrow("different")
  })

  it("exposes canonical observedAttributes and default property values", () => {
    expect(DatePicker.observedAttributes).toEqual([
      "value", "type", "placeholder", "clearable", "disabled", "readonly", "required", "name", "form",
      "min", "max", "step", "format", "aria-label", "aria-labelledby", "aria-describedby",
    ])
    const picker = new DatePicker()
    expect(picker.value).toBe("")
    expect(picker.defaultValue).toBe("")
    expect(picker.native).toEqual([])
    expect(picker.type).toBe("date")
    expect(picker.placeholder).toBeNull()
    expect(picker.clearable).toBe(false)
    expect(picker.disabled).toBe(false)
    expect(picker.format).toBeNull()
  })

  it("keeps live values separate from default markup and reflects settings", () => {
    const picker = new DatePicker()
    picker.value = "2024-03-01"
    expect(picker.getAttribute("value")).toBeNull()
    expect(picker.value).toBe("2024-03-01")
    picker.defaultValue = "2024-02-29"
    expect(picker.getAttribute("value")).toBe("2024-02-29")
    expect(picker.value).toBe("2024-03-01")
    picker.value = ""

    for (const type of datePickerTypes) {
      const mode = new DatePicker()
      mode.type = type
      expect(mode.getAttribute("type")).toBe(type)
    }
    expect(() => { picker.type = "invalid" as never }).toThrow(RangeError)

    picker.placeholder = "Select date"
    expect(picker.getAttribute("placeholder")).toBe("Select date")
    picker.placeholder = null
    expect(picker.hasAttribute("placeholder")).toBe(false)

    picker.clearable = true
    expect(picker.hasAttribute("clearable")).toBe(true)
    picker.clearable = false
    expect(picker.hasAttribute("clearable")).toBe(false)

    picker.disabled = true
    expect(picker.hasAttribute("disabled")).toBe(true)
    picker.disabled = false
    expect(picker.hasAttribute("disabled")).toBe(false)

    picker.format = "YYYY-MM-DD"
    expect(picker.getAttribute("format")).toBe("YYYY-MM-DD")
    picker.format = null
    expect(picker.hasAttribute("format")).toBe(false)
  })

  it("generates native date input and synchronizes properties", () => {
    const picker = new DatePicker()
    picker.placeholder = "Choose date"
    picker.value = "2024-02-29"
    document.body.append(picker)

    expect(picker.classList.contains("m-date-picker")).toBe(true)
    const input = picker.querySelector<HTMLInputElement>("input[data-date-control]")!
    expect(input).not.toBeNull()
    expect(input.type).toBe("date")
    expect(input.value).toBe("2024-02-29")
    expect(input.placeholder).toBe("Choose date")

    picker.disabled = true
    expect(input.disabled).toBe(true)

    picker.value = "2024-05-10"
    expect(input.value).toBe("2024-05-10")

    picker.placeholder = "New placeholder"
    expect(input.placeholder).toBe("New placeholder")
  })

  it("emits m:change event when native input changes", () => {
    const picker = new DatePicker()
    document.body.append(picker)
    const input = picker.querySelector<HTMLInputElement>("input")!
    const listener = vi.fn()
    picker.addEventListener("m:change", listener)

    input.value = "2024-07-20"
    input.dispatchEvent(new Event("change", { bubbles: true }))

    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toEqual({ value: "2024-07-20" })
    expect(picker.value).toBe("2024-07-20")
  })

  it("supports range types with two inputs", () => {
    const picker = new DatePicker()
    picker.type = "daterange"
    document.body.append(picker)

    const inputs = picker.querySelectorAll<HTMLInputElement>("input[data-date-control]")
    expect(inputs).toHaveLength(2)
    expect(inputs[0].type).toBe("date")
    expect(inputs[1].type).toBe("date")

    picker.value = ["2024-01-01", "2024-01-15"]
    expect(inputs[0].value).toBe("2024-01-01")
    expect(inputs[1].value).toBe("2024-01-15")

    const listener = vi.fn()
    picker.addEventListener("m:change", listener)

    inputs[1].value = "2024-01-20"
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }))

    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toEqual({ value: ["2024-01-01", "2024-01-20"] })
    expect(picker.value).toEqual(["2024-01-01", "2024-01-20"])
  })

  it("supports clearable and clear() method", async () => {
    const picker = new DatePicker()
    picker.clearable = true
    picker.value = "2024-02-29"
    document.body.append(picker)

    const input = picker.querySelector<HTMLInputElement>("input")!
    expect(input.value).toBe("2024-02-29")

    const clearBtn = picker.querySelector<HTMLButtonElement>("[data-date-clear]")!
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

    picker.value = "2024-08-01"
    expect(input.value).toBe("2024-08-01")
    picker.clear()
    expect(picker.value).toBe("")
    expect(input.value).toBe("")
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it("adopts authored native inputs", () => {
    const picker = document.createElement("m-date-picker") as DatePicker
    picker.innerHTML = '<input data-date-control id="custom-field" type="date" value="2024-06-01" aria-label="Custom date">'
    document.body.append(picker)

    const input = picker.querySelector<HTMLInputElement>("#custom-field")!
    expect(input).not.toBeNull()
    expect(picker.querySelectorAll("input")).toHaveLength(1)
    expect(picker.value).toBe("2024-06-01")
    expect(picker.defaultValue).toBe("2024-06-01")
    picker.value = "2024-09-01"
    expect(input.value).toBe("2024-09-01")
  })

  it("delegates focus and blur to the native input", () => {
    const picker = new DatePicker()
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
    const picker = document.createElement("m-date-picker") as DatePicker
    picker.value = "2024-12-25"
    picker.type = "date"
    picker.clearable = true
    document.body.append(picker)

    expect(picker.value).toBe("2024-12-25")
    expect(picker.type).toBe("date")
    expect(picker.clearable).toBe(true)
    const input = picker.querySelector<HTMLInputElement>("input")!
    expect(input.type).toBe("date")
    expect(input.value).toBe("2024-12-25")
  })
})

const modes: readonly { type: DatePickerType; initial: DatePickerValue; next: DatePickerValue; native: string }[] = [
  { type: "date", initial: "2024-02-29", next: "0001-01-01", native: "date" },
  { type: "datetime", initial: "2024-03-10T02:30", next: "2024-11-03T01:30:45.500", native: "datetime-local" },
  { type: "daterange", initial: ["2024-02-29", "2024-03-01"], next: ["", "2024-03-02"], native: "date" },
  { type: "datetimerange", initial: ["2024-03-10T02:30", "2024-03-10T03:00"], next: ["2024-11-03T01:30:45.500", ""], native: "datetime-local" },
  { type: "month", initial: "2024-02", next: "9999-12", native: "month" },
  { type: "year", initial: 2024, next: 1, native: "number" },
  { type: "quarter", initial: "2024-Q1", next: "9999-Q4", native: "text" },
]
function elementFixture(mode: typeof modes[number]) {
  const form = document.createElement("form"), picker = new DatePicker()
  picker.type = mode.type; picker.defaultValue = mode.initial
  picker.name = "when[]"; picker.clearable = true
  form.append(picker); document.body.append(form)
  return { picker, form, inputs: picker.native, button: picker.querySelector<HTMLButtonElement>("[data-date-clear]")! }
}

describe("one owner for the complete public DatePicker contract", () => {
  it.each(modes)("retains $type live/default/reset/form state and stable native fields", async mode => {
    const { picker, form, inputs, button } = elementFixture(mode), events = vi.fn()
    for (const name of ["input", "change", "m:change"]) picker.addEventListener(name, events)
    expect(picker.value).toEqual(mode.initial)
    expect(inputs.every(input => input.type === mode.native)).toBe(true)
    picker.value = mode.next
    expect(picker.state.value).toEqual(mode.next)
    expect(picker.defaultValue).toEqual(mode.initial)
    expect(new FormData(form).getAll("when[]")).toEqual(Array.isArray(mode.next) ? mode.next : [String(mode.next)])
    picker.placeholder = "Retained"; picker.format = "hint"; picker.clearable = false; picker.clearable = true
    expect(picker.value).toEqual(mode.next); expect(picker.native).toBe(inputs)
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush(); expect(picker.value).toEqual(mode.next)
    picker.remove(); form.append(picker); await flush()
    expect(picker.native).toBe(inputs); expect(picker.querySelector("[data-date-clear]")).toBe(button)
    expect(picker.value).toEqual(mode.next)
    form.reset(); await flush(); expect(picker.value).toEqual(mode.initial)
    expect(events).not.toHaveBeenCalled()
    expect(picker.clear()).toBe(true)
    expect(picker.value).toEqual(inputs.length === 2 ? ["", ""] : "")
    expect(picker.defaultValue).toEqual(mode.initial)
    form.reset(); await flush(); expect(picker.value).toEqual(mode.initial)
  })

  it.each(modes)("preserves $type native dirty flags for markup/default updates", async mode => {
    const { picker, form } = elementFixture(mode)
    picker.defaultValue = mode.next
    expect(picker.value).toEqual(mode.next)
    picker.value = mode.initial
    picker.defaultValue = mode.next
    expect(picker.value).toEqual(mode.initial)
    form.reset(); await flush(); expect(picker.value).toEqual(mode.next)
    picker.removeAttribute("value")
    form.reset(); await flush()
    expect(picker.value).toEqual(picker.native.length === 2 ? ["", ""] : "")
  })

  it.each([
    ["date", "2023-02-29"], ["date", null], ["date", new Date()], ["date", 2024],
    ["datetime", "2024-01-01T12:30Z"], ["month", "2024-13"],
    ["daterange", "2024-01-01,2024-01-02"], ["daterange", "2024-01-01/2024-01-02"],
    ["daterange", ["2024-01-01", "2023-02-29"]], ["daterange", ["2024-01-01"]],
    ["datetimerange", ["2024-01-01T12:30", null]],
    ["year", "2024"], ["year", 0], ["year", 10000], ["year", 2024.5], ["year", NaN], ["year", Infinity], ["year", null],
    ["quarter", "0000-Q1"], ["quarter", "10000-Q1"], ["quarter", "2024-Q0"], ["quarter", "2024-Q5"],
    ["quarter", "2024-q1"], ["quarter", "2024-Q"], ["quarter", "2024-Q1\n"], ["quarter", 2024], ["quarter", null],
  ] as const)("rejects application %s value %j before live/default/host mutation", (type, value) => {
    const mode = modes.find(mode => mode.type === type)!, { picker } = elementFixture(mode)
    const before = picker.native.map(input => [input.value, input.defaultValue]), markup = picker.getAttribute("value")
    expect(() => { picker.value = value as never }).toThrow()
    expect(() => { picker.defaultValue = value as never }).toThrow()
    expect(picker.value).toEqual(mode.initial)
    expect(picker.native.map(input => [input.value, input.defaultValue])).toEqual(before)
    expect(picker.getAttribute("value")).toBe(markup)
  })

  it("accepts bounded integer years and all four bounded quarters without Date carriers", () => {
    const year = elementFixture(modes[5]!).picker, quarter = elementFixture(modes[6]!).picker
    for (const value of [1, 99, 2024, 9999]) { year.value = value; expect(year.value).toBe(value); expect(year.native[0]!.value).toBe(String(value)) }
    for (const value of ["0001-Q1", "0099-Q2", "2024-Q3", "9999-Q4"]) { quarter.value = value; expect(quarter.value).toBe(value) }
    expect(year.native[0]!.min).toBe("1"); expect(year.native[0]!.max).toBe("9999"); expect(year.native[0]!.step).toBe("1")
    year.required = quarter.required = true
    year.value = quarter.value = ""
    expect(year.checkValidity()).toBe(false); expect(quarter.checkValidity()).toBe(false)
  })

  it("keeps quarter drafts visible and natively invalid without committing a cached value", () => {
    const { picker, form, inputs } = elementFixture(modes[6]!), input = inputs[0]!, changes = vi.fn(), drafts = vi.fn(), native = vi.fn()
    picker.addEventListener("m:change", changes); picker.addEventListener("m:date-picker-draft", drafts)
    picker.addEventListener("input", native); picker.addEventListener("change", native)
    input.value = "2024-Q"; input.dispatchEvent(new Event("input", { bubbles: true }))
    expect(input.value).toBe("2024-Q"); expect(picker.value).toBeNull()
    expect(picker.state).toMatchObject({ value: null, draft: "2024-Q", badInput: true, partial: true, complete: false, nativeValid: false, empty: false })
    expect(new FormData(form).get("when[]")).toBe("2024-Q")
    expect(form.checkValidity()).toBe(false); expect(drafts).toHaveBeenCalledOnce(); expect(changes).not.toHaveBeenCalled()
    input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(changes).not.toHaveBeenCalled(); expect(native).toHaveBeenCalledTimes(2)
    picker.readOnly = true
    expect(picker.clear()).toBe(false); expect(picker.value).toBeNull(); expect(input.value).toBe("2024-Q")
    expect(picker.state.badInput).toBe(true); expect(picker.state.nativeValid).toBe(true)
    picker.readOnly = false
    input.value = "2024-Q2"
    input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(picker.value).toBe("2024-Q2"); expect(changes).toHaveBeenCalledOnce()
    expect(changes.mock.calls[0]![0].detail).toEqual({ value: "2024-Q2" })
    expect(picker.getAttribute("value")).toBe("2024-Q1")
  })

  it("uses native bounded integer year validity for invalid user drafts", () => {
    const { picker, form } = elementFixture(modes[5]!), input = picker.native[0]!, changes = vi.fn()
    picker.addEventListener("m:change", changes)
    for (const value of ["0", "10000", "2024.5"]) {
      input.value = value; input.dispatchEvent(new Event("input", { bubbles: true }))
      expect(picker.value).toBeNull(); expect(picker.state.badInput).toBe(true)
      expect(form.checkValidity()).toBe(false)
    }
    expect(changes).not.toHaveBeenCalled()
    input.value = "2025"; input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(picker.value).toBe(2025); expect(changes).toHaveBeenCalledOnce()
  })

  it("defers quarter commit across IME and deduplicates following native events", () => {
    const { picker } = elementFixture(modes[6]!), input = picker.native[0]!, changes = vi.fn(), drafts = vi.fn()
    picker.addEventListener("m:change", changes); picker.addEventListener("m:date-picker-draft", drafts)
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    input.value = "2024-Q3"
    input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    expect(picker.state.composing).toBe(true); expect(changes).not.toHaveBeenCalled(); expect(drafts).toHaveBeenCalledOnce()
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    input.dispatchEvent(new InputEvent("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(picker.state.composing).toBe(false); expect(changes).toHaveBeenCalledOnce()
  })

  it("keeps native events bubbling, metadata deduplicated and programmatic/default/reset writes silent", async () => {
    const { picker, form } = elementFixture(modes[2]!), [first, second] = picker.native, events: string[] = []
    for (const name of ["input", "change", "m:change"]) picker.addEventListener(name, () => events.push(name))
    first!.value = "2024-03-02"; second!.value = ""
    first!.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
    first!.dispatchEvent(new Event("change", { bubbles: true }))
    expect(events).toEqual(["m:change", "input", "change"])
    expect(picker.state.partial).toBe(true); expect(picker.state.ordered).toBeNull()
    picker.value = ["2024-06-02", "2024-06-01"]
    expect(picker.state.ordered).toBe(false); expect(picker.state.nativeValid).toBe(true)
    picker.refresh(); form.reset(); await flush()
    expect(events).toHaveLength(3)
    picker.clear()
    expect(events.slice(3)).toEqual(["m:change", "input", "change", "input", "change"])
  })

  it("does not send stale endpoint/clear events after reentrant public change writes", () => {
    const { picker } = elementFixture(modes[2]!), native = vi.fn(), clear = vi.fn()
    picker.addEventListener("m:change", () => { picker.value = ["2024-06-01", "2024-06-02"] }, { once: true })
    picker.addEventListener("change", native); picker.addEventListener("m:date-picker-clear", clear)
    expect(picker.clear()).toBe(true)
    expect(picker.value).toEqual(["2024-06-01", "2024-06-02"])
    expect(native).not.toHaveBeenCalled(); expect(clear).not.toHaveBeenCalled()
  })

  it("preserves authored labels/ids/listeners/ARIA and external form/submitter ownership", async () => {
    const form = document.createElement("form"); form.id = "external"
    form.innerHTML = '<button name="intent" value="save">Save</button>'; document.body.append(form)
    const picker = new DatePicker()
    picker.type = "daterange"
    picker.innerHTML = `<label for="authored-start">Start</label><input id="authored-start" type="date" form="external" name="start" value="2024-02-29" required>
      <label for="authored-end">End</label><input id="authored-end" type="date" form="external" name="end" value="2024-03-01" aria-describedby="hint">
      <span id="hint">Original hint</span><span data-date-output hidden>Original output</span>`
    const fields = [...picker.querySelectorAll("input")], labels = [...picker.querySelectorAll("label")], listener = vi.fn()
    fields[0]!.addEventListener("input", listener)
    document.body.append(picker)
    expect(picker.native).toEqual(fields); expect(picker.form).toBe(form)
    picker.value = ["2024-03-02", "2024-03-03"]
    expect([...new FormData(form, form.querySelector("button")!)]).toEqual([["intent", "save"], ["start", "2024-03-02"], ["end", "2024-03-03"]])
    expect(fields[0]!.labels![0]).toBe(labels[0]); expect(fields[1]!.getAttribute("aria-describedby")).toBe("hint")
    fields[0]!.dispatchEvent(new Event("input", { bubbles: true })); expect(listener).toHaveBeenCalledOnce()
    fields[0]!.setCustomValidity("Application rule")
    picker.clear(); form.reset(); await flush()
    expect(fields[0]!.validationMessage).toBe("Application rule")
    expect(picker.value).toEqual(["2024-02-29", "2024-03-01"])
    picker.remove()
    expect(fields[0]!.validationMessage).toBe("Application rule")
    expect(picker.querySelector("[data-date-output]")!.textContent).toBe("Original output")
  })

  it("maps native form/name/required/ARIA without adding a second form owner", () => {
    const form = document.createElement("form"); form.id = "mapped-form"; document.body.append(form)
    const picker = new DatePicker()
    picker.type = "daterange"; picker.formId = form.id; picker.name = "period[]"; picker.required = true
    picker.setAttribute("aria-label", "Schedule"); document.body.append(picker)
    expect(picker.form).toBe(form)
    expect(picker.native.map(input => input.getAttribute("aria-label"))).toEqual(["Schedule: Start", "Schedule: End"])
    expect(picker.native.map(input => input.required)).toEqual([true, true])
    expect(picker.checkValidity()).toBe(false)
    expect(picker.hasAttribute("tabindex")).toBe(false); expect(picker.hasAttribute("role")).toBe(false)
  })

  it("respects readonly/disabled fieldsets and recovers clear focus without moving outside focus", async () => {
    const { picker, form, button } = elementFixture(modes[6]!), fieldset = document.createElement("fieldset")
    form.append(fieldset); fieldset.append(picker)
    picker.readOnly = true
    expect(picker.clear()).toBe(false); expect(picker.native[0]!.readOnly).toBe(true)
    picker.readOnly = false; fieldset.disabled = true; picker.refresh()
    expect(picker.clear()).toBe(false); expect(new FormData(form).has("when[]")).toBe(false)
    fieldset.disabled = false; picker.refresh(); button.focus(); button.click(); await flush()
    expect(picker.value).toBe(""); expect(document.activeElement).toBe(picker.native[0])
    picker.value = "2024-Q2"
    const outside = document.createElement("button"); document.body.append(outside); outside.focus()
    picker.clear(); expect(document.activeElement).toBe(outside)
  })

  it.each(modes)("replays pre-upgrade $type properties, including defaults, before editing starts", mode => {
    const picker = new DatePicker()
    Object.defineProperties(picker, {
      type: { value: mode.type, configurable: true, writable: true },
      value: { value: mode.next, configurable: true, writable: true },
      defaultValue: { value: mode.initial, configurable: true, writable: true },
      clearable: { value: true, configurable: true, writable: true },
    })
    document.body.append(picker)
    expect(picker.value).toEqual(mode.next); expect(picker.defaultValue).toEqual(mode.initial)
    expect(Object.hasOwn(picker, "type")).toBe(false); expect(Object.hasOwn(picker, "value")).toBe(false)
  })

  it("retains defaults, native nodes and listeners through explicit mode/schema transactions", async () => {
    const { picker, form, button } = elementFixture(modes[0]!), first = picker.native[0]!, listener = vi.fn()
    first.addEventListener("input", listener)
    for (const mode of modes) {
      picker.configure({ type: mode.type, value: mode.next, defaultValue: mode.initial })
      expect(picker.type).toBe(mode.type); expect(picker.value).toEqual(mode.next)
      expect(picker.defaultValue).toEqual(mode.initial); expect(picker.native[0]).toBe(first)
      expect(picker.native[0]!.type).toBe(mode.native); expect(picker.querySelector("[data-date-clear]")).toBe(button)
      form.reset(); await flush(); expect(picker.value).toEqual(mode.initial)
    }
    first.dispatchEvent(new Event("input", { bubbles: true })); expect(listener).toHaveBeenCalledOnce()
    expect(() => { picker.type = "year" }).toThrow("configure")
    expect(picker.type).toBe("quarter"); expect(picker.value).toBe("2024-Q1")
    expect(() => picker.configure({ type: "year", value: 0, defaultValue: 2024 })).toThrow()
    expect(picker.type).toBe("quarter"); expect(first.type).toBe("text"); expect(first.value).toBe("2024-Q1")
  })

  it("rejects implicit attribute schema changes and invalid defaults without host/native mismatch", () => {
    const { picker } = elementFixture(modes[0]!), errors = vi.fn()
    picker.addEventListener("m:error", errors)
    picker.setAttribute("type", "quarter")
    expect(errors).toHaveBeenCalledOnce(); expect(picker.type).toBe("date"); expect(picker.native[0]!.type).toBe("date")
    picker.setAttribute("value", "2023-02-29")
    expect(errors).toHaveBeenCalledTimes(2)
    expect(picker.getAttribute("value")).toBe("2024-02-29")
    expect(picker.defaultValue).toBe("2024-02-29"); expect(picker.value).toBe("2024-02-29")
  })

  it("cancels queued actions across removal, supersession and native cancelled reset", async () => {
    const { picker, form, button } = elementFixture(modes[6]!), changes = vi.fn()
    picker.addEventListener("m:change", changes)
    button.addEventListener("click", event => event.preventDefault(), { once: true })
    button.click(); await flush(); expect(picker.value).toBe("2024-Q1")
    button.click(); picker.value = "2024-Q2"; await flush(); expect(picker.value).toBe("2024-Q2")
    button.click(); picker.remove(); picker.value = "2024-Q3"; picker.defaultValue = "2024-Q4"
    form.append(picker); await flush(); expect(picker.value).toBe("2024-Q3")
    expect(changes).not.toHaveBeenCalled()
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush(); expect(picker.value).toBe("2024-Q3")
    form.reset(); await flush(); expect(picker.value).toBe("2024-Q4")
  })

  it("restores only mapped attributes and profile constraints, not later application writes", () => {
    const picker = new DatePicker()
    picker.type = "year"; picker.innerHTML = '<input type="number" value="2024" aria-label="Original" placeholder="Original hint">'
    picker.placeholder = "Mapped"; picker.setAttribute("aria-label", "Mapped year")
    document.body.append(picker); const input = picker.native[0]!
    input.placeholder = "Application"; input.min = "1000"
    picker.remove()
    expect(input.placeholder).toBe("Application"); expect(input.min).toBe("1000")
    expect(input.hasAttribute("max")).toBe(false); expect(input.getAttribute("aria-label")).toBe("Original")
    picker.value = 2025; picker.defaultValue = 2020
    document.body.append(picker)
    expect(picker.value).toBe(2025); expect(picker.defaultValue).toBe(2020); expect(input.min).toBe("1000")
    expect(input.max).toBe("9999")
  })

  it("reports changed source anatomy and reconnects after repair without losing the draft", async () => {
    const { picker } = elementFixture(modes[6]!), input = picker.native[0]!, errors = vi.fn()
    picker.addEventListener("m:error", errors)
    input.value = "2024-Q"; input.dispatchEvent(new Event("input", { bubbles: true }))
    input.setAttribute("role", "textbox"); await flush()
    expect(errors).toHaveBeenCalledOnce(); expect(input.value).toBe("2024-Q")
    expect(() => picker.clear()).toThrow("not connected")
    picker.remove(); input.removeAttribute("role"); document.body.append(picker)
    expect(picker.native[0]).toBe(input); expect(picker.value).toBeNull(); expect(picker.state.badInput).toBe(true)
    expect(picker.querySelectorAll("input")).toHaveLength(1)
  })

  it("preflights incompatible year constraints before changing generated cardinality or schema", () => {
    const { picker } = elementFixture(modes[2]!), inputs = picker.native, before = picker.value
    picker.min = "2024-01-01"
    expect(() => picker.configure({ type: "year", value: 2024, defaultValue: 2020 })).toThrow("Year")
    expect(picker.type).toBe("daterange"); expect(picker.native).toBe(inputs)
    expect(picker.value).toEqual(before); expect(picker.querySelectorAll("input")).toHaveLength(2)
    picker.min = null
    picker.configure({ type: "year", value: 2024, defaultValue: 2020 })
    picker.min = "2000"; picker.max = "3000"
    expect(() => { picker.min = "3001" }).toThrow("min")
    expect(() => { picker.min = " 2000 " }).toThrow("Year")
    expect(() => { picker.max = "+3000" }).toThrow("Year")
    expect(() => { picker.step = "9".repeat(400) }).toThrow("step")
    expect(picker.min).toBe("2000"); expect(picker.native[0]!.min).toBe("2000")
    const errors = vi.fn(); picker.addEventListener("m:error", errors)
    picker.setAttribute("max", "10000")
    expect(errors).toHaveBeenCalledOnce(); expect(picker.max).toBe("3000")
    expect(picker.native[0]!.max).toBe("3000"); expect(picker.value).toBe(2024)
    expect(picker.clear()).toBe(true)
  })

  it("keeps authored cardinality fixed without removing nodes or discarding state", () => {
    const picker = new DatePicker()
    picker.innerHTML = '<label for="fixed-field">Source</label><input id="fixed-field" type="date" value="2024-02-29">'
    document.body.append(picker)
    const input = picker.native[0]!, label = picker.querySelector("label")!
    expect(() => picker.configure({ type: "daterange", value: ["2024-02-29", ""], defaultValue: ["", ""] })).toThrow("cardinality")
    expect(picker.value).toBe("2024-02-29"); expect(picker.type).toBe("date")
    expect(picker.native[0]).toBe(input); expect(input.labels![0]).toBe(label)
    picker.configure({ type: "year", value: 2024, defaultValue: 2020 })
    expect(input.type).toBe("number"); expect(picker.value).toBe(2024)
    expect(picker.native[0]).toBe(input); expect(input.labels![0]).toBe(label)
  })

  it.each(["2024-02-29T12:30:45.100", "2024-02-29T12:30:45.010", "2024-02-29T12:30:45.001"])("preserves native millisecond precision for %s", value => {
    const { picker } = elementFixture(modes[1]!)
    picker.step = "0.001"; picker.format = "hint only"; picker.value = value
    expect(picker.value).toBe(value); expect(picker.state.nativeValid).toBe(true)
  })

  it.each(["2024-02-29T12:30:45.1", "2024-02-29T12:30:45.01"])("does not silently accept native short-fraction loss for %s", value => {
    const { picker } = elementFixture(modes[1]!), before = picker.value
    const probe = document.createElement("input"); probe.type = "datetime-local"; probe.value = value
    if (probe.value === value) {
      picker.value = value; expect(picker.value).toBe(value)
    } else {
      expect(() => { picker.value = value }).toThrow("unsupported-precision")
      expect(picker.value).toBe(before)
    }
  })
})

describe("explicit native year/quarter profiles share the same owner", () => {
  it.each(["year", "quarter"] as const)("supports native %s defaults, values, validity, clear and reconnect", async type => {
    document.body.innerHTML = `<form><section data-date-picker>
      <input data-date-control type="${type === "year" ? "number" : "text"}" aria-label="Period" name="period" value="${type === "year" ? "2024" : "2024-Q1"}" required>
      <button data-date-clear type="button" hidden>Clear</button></section></form>`
    const root = document.querySelector<HTMLElement>("section")!, form = document.querySelector("form")!
    const helper = createDatePicker(root, { type }); helpers.push(helper)
    expect(helper.value).toBe(type === "year" ? 2024 : "2024-Q1")
    helper.setValue(type === "year" ? 9999 : "9999-Q4")
    helper.setDefaultValue(type === "year" ? 1 : "0001-Q1")
    expect(helper.value).toBe(type === "year" ? 9999 : "9999-Q4")
    form.reset(); await flush(); expect(helper.value).toBe(type === "year" ? 1 : "0001-Q1")
    expect(helper.clear()).toBe(true); expect(form.checkValidity()).toBe(false)
    helper.disconnect(); helper.setValue(type === "year" ? 2024 : "2024-Q2"); helper.connect()
    expect(helper.inputs).toHaveLength(1); expect(helper.value).toBe(type === "year" ? 2024 : "2024-Q2")
  })
})
