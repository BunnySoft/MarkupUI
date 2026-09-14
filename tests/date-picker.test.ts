import { afterEach, describe, expect, it, vi } from "vitest"
import { DatePicker, registerDatePicker, datePickerTypes, createDatePicker, isDatePickerTypeSupported } from "../src/components/date-picker/index.js"
import type { DatePickerType, NativeDateType } from "../src/components/date-picker/index.js"
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
    vi.resetModules(); const other = await import("../src/components/date-picker/index.js")
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
    expect(DatePicker.observedAttributes).toEqual(["value", "type", "placeholder", "clearable", "disabled", "format"])
    const picker = new DatePicker()
    expect(picker.value).toBeNull()
    expect(picker.type).toBe("date")
    expect(picker.placeholder).toBeNull()
    expect(picker.clearable).toBe(false)
    expect(picker.disabled).toBe(false)
    expect(picker.format).toBeNull()
  })

  it("reflects properties to attributes and validates values", () => {
    const picker = new DatePicker()
    picker.value = "2024-03-01"
    expect(picker.getAttribute("value")).toBe("2024-03-01")
    picker.value = null
    expect(picker.hasAttribute("value")).toBe(false)

    for (const type of datePickerTypes) {
      picker.type = type
      expect(picker.getAttribute("type")).toBe(type)
    }
    expect(() => { (picker as any).type = "invalid" }).toThrow(RangeError)

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

    picker.value = "2024-01-01,2024-01-15"
    expect(inputs[0].value).toBe("2024-01-01")
    expect(inputs[1].value).toBe("2024-01-15")

    const listener = vi.fn()
    picker.addEventListener("m:change", listener)

    inputs[1].value = "2024-01-20"
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }))

    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toEqual({ value: "2024-01-01,2024-01-20" })
    expect(picker.value).toBe("2024-01-01,2024-01-20")
  })

  it("supports clearable and clear() method", () => {
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

    expect(picker.value).toBeNull()
    expect(input.value).toBe("")
    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toEqual({ value: "" })

    picker.value = "2024-08-01"
    expect(input.value).toBe("2024-08-01")
    picker.clear()
    expect(picker.value).toBeNull()
    expect(input.value).toBe("")
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it("adopts authored native inputs", () => {
    const picker = document.createElement("m-date-picker") as DatePicker
    picker.innerHTML = '<input data-date-control id="custom-field" type="date" value="2024-06-01">'
    document.body.append(picker)

    const input = picker.querySelector<HTMLInputElement>("#custom-field")!
    expect(input).not.toBeNull()
    expect(picker.querySelectorAll("input")).toHaveLength(1)
    expect(picker.value).toBeNull()
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

