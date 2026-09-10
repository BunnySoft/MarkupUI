import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createInputNumber } from "../src/components/input-number/index.js"
import type { InputNumberController } from "../src/components/input-number/index.js"

const helpers: InputNumberController[] = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(id = "quantity-root") {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "input-number.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  const beforeCount = document.querySelectorAll("input").length, root = document.getElementById(id)!
  const helper = createInputNumber(root); helpers.push(helper)
  return { root, helper, control: helper.control, beforeCount,
    up: root.querySelector<HTMLButtonElement>("[data-number-increment]")!,
    down: root.querySelector<HTMLButtonElement>("[data-number-decrement]")!,
    clear: root.querySelector<HTMLButtonElement>("[data-number-clear]")!,
    form: document.getElementById("numbers") as HTMLFormElement }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Input Number stylesheet contract", () => {
  const css = readFileSync(join("src", "components", "input-number", "input-number.css"), "utf8")
  it("keeps size, round and status defaults private for author tokens", () => {
    expect(css).not.toMatch(/--mui-number-[\w-]+\s*:/)
    for (const height of [22, 28, 34, 40]) expect(css).toMatch(new RegExp(`--_n-h:\\s*${height}px`))
    expect(css).toMatch(/data-mui-theme="?dark"?/)
    expect(css).not.toContain("var(--mui-text-primary")
  })
  it("does not suppress native spinners, reorder actions or hide the number control", () => {
    expect(css).not.toMatch(/appearance\s*:|spin-button|[;{]\s*order\s*:|position:\s*absolute|pointer-events:\s*none/)
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
  })
  it("does not mistake a bounded stepper for a disabled number field", () => {
    expect(css).toContain(":has([data-number-control]:disabled)")
    expect(css).not.toContain(":has(:disabled)")
  })
  it("provides explicit forced-color boundaries and keyboard action focus", () => {
    const forced = css.split(/@media\s*\(forced-colors:\s*active\)/)[1]?.split("@media print")[0] ?? ""
    expect(forced).toMatch(/outline:\s*1px solid CanvasText/)
    expect(forced).toMatch(/outline:\s*2px solid Highlight/)
    expect(forced).toMatch(/color:\s*GrayText;\s*opacity:\s*1/)
    expect(css).toMatch(/button:focus-visible\s*\{[^}]*outline:/)
  })
  it("includes frame padding in authored widths and bounds the original native field", () => {
    expect(css).toMatch(/\.mui-input-number\s*\{[^}]*box-sizing:\s*border-box/)
    expect(css).toMatch(/\[data-number-control\]\s*\{[^}]*max-inline-size:\s*100%/)
  })
})

describe("authored native number ownership", () => {
  it("preserves control/listeners/labels/defaults and never inserts a stepping probe", () => {
    const { root, helper, control, beforeCount } = fixture()
    helper.disconnect()
    control.value = "0.25"
    const before = control.outerHTML, label = control.labels![0], listener = vi.fn()
    control.addEventListener("input", listener)
    const enhanced = createInputNumber(root); helpers.push(enhanced)
    expect(enhanced.control).toBe(control)
    expect(control.outerHTML).toBe(before)
    expect(control.labels![0]).toBe(label)
    expect(control.defaultValue).toBe("0.1")
    expect(enhanced.state.value).toBe(.25)
    enhanced.refresh(); enhanced.state
    expect(document.querySelectorAll("input")).toHaveLength(beforeCount)
    expect(root.querySelectorAll("input")).toHaveLength(1)
    expect(root.hasAttribute("role")).toBe(false)
    expect(control.hasAttribute("aria-valuenow")).toBe(false)
    control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(listener).toHaveBeenCalledTimes(1)
  })
  it("does not register or replace the legacy widget", () => {
    const before = customElements.get("mui-input-number")
    fixture()
    expect(customElements.get("mui-input-number")).toBe(before)
  })
  it("rejects duplicate/cross-module ownership and allows explicit recreation", async () => {
    const { root, helper } = fixture()
    expect(() => createInputNumber(root)).toThrow("owner")
    vi.resetModules()
    const other = await import("../src/components/input-number/index.js")
    expect(() => other.createInputNumber(root)).toThrow("owner")
    helper.disconnect(); helper.disconnect()
    helpers.push(other.createInputNumber(root))
  })
  it.each(["text", "range", "hidden"])("rejects %s controls instead of parsing text", type => {
    const { root, helper, control } = fixture()
    helper.disconnect(); control.type = type
    expect(() => createInputNumber(root)).toThrow("number")
  })
  it("requires real labels and type=button actions outside labels", () => {
    const { root, helper, control, up } = fixture()
    helper.disconnect(); up.type = "submit"
    expect(() => createInputNumber(root)).toThrow("type=button")
    up.type = "button"; control.labels![0]!.remove()
    expect(() => createInputNumber(root)).toThrow("labelled")
  })
  it("rejects late duplicate marked inputs rather than silently changing form ownership", () => {
    const { root, helper, control } = fixture()
    const duplicate = control.cloneNode()
    root.append(duplicate)
    expect(() => helper.refresh()).toThrow("labelled native")
    duplicate.remove(); helper.refresh()
    expect(helper.error).toBeNull()
  })
})

describe("native nullable value, validity and defaults", () => {
  it("does not turn empty into zero or conflate it with native validity", () => {
    const { helper, control } = fixture()
    helper.setValue(null)
    expect(helper.state).toMatchObject({ value: null, text: "", empty: true, badInput: false, valid: false, valueMissing: true })
    helper.setValue(0)
    expect(helper.state).toMatchObject({ value: 0, empty: false, valueMissing: false })
    expect(control.defaultValue).toBe("0.1")
  })
  it("retains out-of-range and off-grid values without input-time rounding/clamping", () => {
    const { helper, control } = fixture()
    helper.setValue(2)
    expect(helper.state).toMatchObject({ value: 2, rangeOverflow: true, valid: false })
    control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(control.valueAsNumber).toBe(2)
    helper.setValue(.15)
    expect(helper.state).toMatchObject({ value: .15, stepMismatch: true, valid: false })
    control.dispatchEvent(new Event("change", { bubbles: true }))
    expect(control.valueAsNumber).toBe(.15)
  })
  it.each(["1", NaN, Infinity, -Infinity, undefined, true])("rejects non-finite/non-number setter %j atomically", value => {
    const { helper } = fixture()
    expect(() => helper.setValue(value as number)).toThrow("finite")
    expect(helper.state.value).toBe(.1)
  })
  it("allows finite huge values without pretending to offer arbitrary precision", () => {
    const { helper, control } = fixture()
    control.removeAttribute("min"); control.removeAttribute("max")
    helper.setValue(1e308)
    expect(helper.state.value).toBe(1e308)
    expect(Number.isFinite(control.valueAsNumber)).toBe(true)
  })
  it("keeps property assignments and explicit refresh silent", () => {
    const { helper, control } = fixture()
    const events = vi.fn(); control.addEventListener("input", events); control.addEventListener("change", events)
    helper.setValue(.4)
    control.value = "0.7"; helper.refresh()
    expect(helper.state.value).toBe(.7)
    expect(events).not.toHaveBeenCalled()
    expect(Object.hasOwn(control, "value")).toBe(false)
  })
  it("protects tracked composition without installing a keyboard/value interception engine", () => {
    const { helper, control, up } = fixture()
    control.dispatchEvent(new CompositionEvent("compositionstart"))
    expect(up.disabled).toBe(true)
    expect(helper.step(1)).toBe(false)
    expect(helper.clear()).toBe(false)
    expect(() => helper.setValue(.2)).toThrow("composing")
    expect(control.value).toBe("0.1")
    control.dispatchEvent(new CompositionEvent("compositionend"))
    expect(up.disabled).toBe(false)
  })
})

describe("native decimal/grid stepping", () => {
  it("uses native decimal steps without floating-point addition artifacts", () => {
    const { helper, control } = fixture()
    expect(helper.step(1)).toBe(true)
    expect(control.value).toBe("0.2")
    expect(helper.step(1)).toBe(true)
    expect(control.value).toBe("0.3")
    expect(helper.step(-1)).toBe(true)
    expect(control.value).toBe("0.2")
  })
  it("lets native stepping align an off-grid input", () => {
    const { helper } = fixture()
    helper.setValue(.15); helper.step(1)
    expect(helper.state.value).toBe(.2)
    helper.setValue(.15); helper.step(-1)
    expect(helper.state.value).toBe(.1)
  })
  it("copies the native value-attribute step base into the local probe", () => {
    const { helper, control } = fixture("grid-root")
    helper.setValue(.3)
    expect(control.getAttribute("value")).toBe("0.15")
    expect(helper.state.stepMismatch).toBe(true)
    helper.step(1)
    expect(helper.state.value).toBe(.35)
    control.defaultValue = "0.1"
    helper.setValue(.3)
    helper.step(1)
    expect(helper.state.value).toBe(.5)
  })
  it("disables no-op boundaries and does not normalize text or notify at a numeric no-op", () => {
    const { helper, control, up } = fixture()
    control.value = "1.00"; helper.refresh()
    const events = vi.fn(); control.addEventListener("change", events)
    expect(up.disabled).toBe(true)
    expect(helper.step(1)).toBe(false)
    expect(control.value).toBe("1.00")
    expect(events).not.toHaveBeenCalled()
  })
  it("surfaces step=any native errors and disables unavailable actions", () => {
    const { helper, control, up, down } = fixture("any-root")
    expect(helper.state.stepError).toContain("InvalidStateError")
    expect(up.disabled).toBe(true); expect(down.disabled).toBe(true)
    expect(() => helper.step(1)).toThrow()
    expect(control.value).toBe("2.5")
  })
  it("leaves malformed/contradictory constraints to native interpretation", () => {
    const { helper, control, up, down } = fixture()
    control.min = "invalid"; control.max = "invalid"; control.step = "-2"
    control.defaultValue = "0"
    helper.setValue(2); helper.step(1)
    expect(helper.state.value).toBe(3)
    control.min = "5"; control.max = "1"; helper.refresh()
    expect(up.disabled).toBe(true); expect(down.disabled).toBe(true)
    expect(helper.step(1)).toBe(false)
    expect(control.valueAsNumber).toBe(3)
  })
  it("does not treat blank as zero until an explicit native step is requested", () => {
    const { helper, control } = fixture()
    helper.setValue(null)
    expect(helper.state.value).toBeNull()
    helper.step(1)
    expect(control.valueAsNumber).toBe(.1)
    expect(helper.state.empty).toBe(false)
  })
  it("emits one input/change for a real custom step and preserves defaults", async () => {
    const { up, control } = fixture()
    const events: string[] = []
    for (const type of ["input", "change", "mui:change"]) control.addEventListener(type, () => events.push(type))
    up.click(); await flush()
    expect(events).toEqual(["input", "change"])
    expect(control.value).toBe("0.2")
    expect(control.defaultValue).toBe("0.1")
  })
  it("returns focus to the real field when a boundary disables the active button", async () => {
    const { helper, control, up } = fixture()
    helper.setValue(.9)
    up.focus(); up.click(); await flush()
    expect(control.valueAsNumber).toBe(1)
    expect(up.disabled).toBe(true)
    expect(document.activeElement).toBe(control)
  })
  it("respects late native click cancellation and never submits", async () => {
    const { root, up, control, form } = fixture()
    const submit = vi.fn(); form.addEventListener("submit", submit)
    root.addEventListener("click", event => event.preventDefault(), { once: true })
    up.click(); await flush()
    expect(control.value).toBe("0.1")
    expect(submit).not.toHaveBeenCalled()
  })
})

describe("native readonly/disabled, clear and lifecycle", () => {
  it("blocks UI steps/clear for readonly or disabled but allows explicit programmatic assignment", () => {
    const { helper, control, up } = fixture()
    control.readOnly = true; helper.refresh()
    expect(up.disabled).toBe(true)
    expect(helper.step(1)).toBe(false)
    expect(helper.clear()).toBe(false)
    helper.setValue(.4)
    expect(control.valueAsNumber).toBe(.4)
    control.readOnly = false; control.disabled = true; helper.refresh()
    expect(helper.step(-1)).toBe(false)
    expect(helper.clear()).toBe(false)
    helper.setValue(.5)
    expect(control.valueAsNumber).toBe(.5)
  })
  it("reflects native fieldset disabling and its first-legend exception", async () => {
    const { root, helper, control, up } = fixture("grid-root")
    const fieldset = document.getElementById("grid-fieldset") as HTMLFieldSetElement
    fieldset.disabled = true; await flush()
    expect(up.disabled).toBe(true)
    expect(control.disabled).toBe(false)
    fieldset.querySelector("legend")!.append(root); await flush()
    expect(control.matches(":disabled")).toBe(false)
    expect(up.disabled).toBe(false)
    expect(helper.step(1)).toBe(true)
  })
  it("clear sends input/change/clear once and focuses before hiding its button", async () => {
    const { helper, clear, control } = fixture()
    const events: string[] = []
    for (const type of ["input", "change", "mui:input-number-clear"]) control.addEventListener(type, () => events.push(type))
    clear.focus(); clear.click(); await flush()
    expect(helper.state.value).toBeNull()
    expect(clear.hidden).toBe(true)
    expect(document.activeElement).toBe(control)
    expect(events).toEqual(["input", "change", "mui:input-number-clear"])
    expect(helper.clear()).toBe(false)
  })
  it("refreshes changed defaults and cancelled native resets without user notifications", async () => {
    const { helper, control, form } = fixture()
    helper.setValue(.7); control.defaultValue = "0.4"
    const event = vi.fn(); control.addEventListener("change", event)
    form.reset(); await flush()
    expect(helper.state.value).toBe(.4)
    helper.setValue(.8)
    form.addEventListener("reset", e => e.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(helper.state.value).toBe(.8)
    expect(event).not.toHaveBeenCalled()
  })
  it("follows external form association and changed form IDs", async () => {
    const { helper, control, form } = fixture("external-root")
    helper.setValue(14); form.reset(); await flush()
    expect(helper.state.value).toBe(14)
    const other = document.getElementById("other-numbers") as HTMLFormElement
    other.id = "renamed"; control.setAttribute("form", other.id)
    other.reset(); await flush()
    expect(helper.state.value).toBe(10)
  })
  it("submits only the real native number string, including readonly but excluding disabled", () => {
    const { control, helper, form } = fixture()
    helper.setValue(.3); control.readOnly = true
    expect(new FormData(form).getAll("quantity")).toEqual(["0.3"])
    control.disabled = true
    expect(new FormData(form).has("quantity")).toBe(false)
  })
  it("preserves author overrides of derived controls on disposal", async () => {
    const { helper, control, up, clear } = fixture()
    helper.setValue(1)
    up.disabled = true; clear.hidden = true
    await flush()
    helper.setValue(.5); helper.disconnect()
    expect(up.disabled).toBe(true)
    expect(clear.hidden).toBe(true)
    expect(control.valueAsNumber).toBe(.5)
    expect(control.defaultValue).toBe("0.1")
  })
  it("disconnects removed roots and retains the native control state", async () => {
    const { root, helper, control, up } = fixture()
    helper.setValue(.5); root.remove(); await flush()
    expect(helper.connected).toBe(false)
    expect(control.valueAsNumber).toBe(.5)
    expect(up.hidden).toBe(true)
    expect(() => helper.setValue(.2)).toThrow("disconnected")
    expect(helper.step(1)).toBe(false)
  })
})
