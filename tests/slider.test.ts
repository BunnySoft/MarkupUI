import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Slider, registerSlider, createSlider, createSliderPair } from "../src/components/slider/index.js"
import type { SliderController, SliderPairController, SliderOptions, SliderPairChange } from "../src/components/slider/index.js"

const helpers: Array<SliderController | SliderPairController> = []
const flush = () => new Promise(resolve => setTimeout(resolve, 15))
function markup() {
  const parsed = new DOMParser().parseFromString(readFileSync(join("demo", "components", "slider.html"), "utf8"), "text/html")
  document.body.append(document.importNode(parsed.querySelector("main")!, true))
  return document.getElementById("ranges") as HTMLFormElement
}
function single(id = "volume-root", options: SliderOptions = {}) {
  const form = markup(), root = document.getElementById(id)!, helper = createSlider(root, options)
  helpers.push(helper)
  return { root, helper, control: helper.control, output: root.querySelector<HTMLOutputElement>("output")!, form }
}
function pair(options: SliderOptions = {}) {
  const form = markup(), root = document.getElementById("window-pair") as HTMLFieldSetElement
  const helper = createSliderPair(root, options); helpers.push(helper)
  return { root, helper, start: helper.controls[0], end: helper.controls[1], form }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("Slider stylesheet contract", () => {
  const css = readFileSync(join("src", "components", "slider", "slider.css"), "utf8")
  it("keeps author tokens authoritative and uses the supplementary dark accent", () => {
    expect(css).not.toMatch(/--m-slider-[\w-]+\s*:/)
    expect(css).toMatch(/data-m-theme="?dark"?/)
    expect(css).toContain("#2a947d")
    expect(css).not.toContain("var(--m-text-primary")
  })
  it("retains native rail/thumb painting and room for intrinsic datalist ticks", () => {
    expect(css).not.toMatch(/appearance\s*:|slider-thumb|slider-runnable-track|range-thumb|range-track|position:\s*absolute/)
    expect(css).toMatch(/min-block-size:\s*18px/)
    expect(css).not.toMatch(/(?:^|[;{])\s*block-size:\s*18px/)
  })
  it("includes pair padding in authored widths without a global reset", () => {
    expect(css).toMatch(/\.m-slider,\s*\.m-slider-pair\s*\{[^}]*box-sizing:\s*border-box/)
    expect(css).toMatch(/\[data-slider-control\]\s*\{[^}]*box-sizing:\s*border-box/)
  })
  it("keeps native contrast and focus visible in forced colors and print", () => {
    const fallback = css.split(/@media\s*\(forced-colors:\s*active\),\s*print/)[1] ?? ""
    expect(fallback).toMatch(/accent-color:\s*auto;\s*opacity:\s*1/)
    expect(fallback).toMatch(/outline-color:\s*Highlight/)
    expect(fallback).toMatch(/background:\s*Canvas/)
    expect(fallback).toMatch(/color-scheme:\s*light/)
    expect(css.split("@media")[0]).not.toMatch(/opacity\s*:/)
  })
  it("preserves vertical length, hidden readouts and instant motion policy", () => {
    expect(css).toMatch(/writing-mode:\s*vertical-lr/)
    expect(css).toMatch(/inline-size:\s*var\(--m-slider-length,\s*12rem\)/)
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/)
    expect(css).not.toMatch(/(?:animation|transition)(?:-[a-z]+)?\s*:/)
  })
})

describe("native slider ownership", () => {
  it("retains the native midpoint rather than inventing a zero or null default", () => {
    const { control, helper } = single()
    expect(control.hasAttribute("value")).toBe(false)
    expect(control.defaultValue).toBe("")
    expect(helper.value).toBe(50)
    expect(control.hasAttribute("role")).toBe(false)
    expect(control.hasAttribute("aria-valuenow")).toBe(false)
  })
  it("preserves original control, labels, authored listeners and native attributes", () => {
    const { root, helper, control } = single()
    helper.disconnect()
    control.valueAsNumber = 65
    const before = control.outerHTML, label = control.labels![0], event = vi.fn()
    control.addEventListener("input", event)
    const bound = createSlider(root); helpers.push(bound)
    expect(bound.control).toBe(control)
    expect(control.outerHTML).toBe(before)
    expect(control.labels![0]).toBe(label)
    expect(bound.value).toBe(65)
    control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(event).toHaveBeenCalledTimes(1)
  })
  it("does not register or upgrade the legacy slider", () => {
    const before = customElements.get("m-slider")
    single()
    expect(customElements.get("m-slider")).toBe(before)
  })
  it("rejects duplicate and cross-module owners and permits explicit recreation", async () => {
    const { root, helper } = single()
    expect(() => createSlider(root)).toThrow("owner")
    const other = await import("../src/components/slider/slider.js" + "?ownership-copy")
    expect(other.createSlider).not.toBe(createSlider)
    expect(() => other.createSlider(root)).toThrow("owner")
    helper.disconnect(); helper.disconnect()
    helpers.push(other.createSlider(root))
  })
  it("requires native range type, real label and no duplicate wrapper roles", () => {
    const { root, helper, control } = single()
    helper.disconnect(); control.type = "number"
    expect(() => createSlider(root)).toThrow("range")
    control.type = "range"; root.setAttribute("role", "slider")
    expect(() => createSlider(root)).toThrow("role")
    root.removeAttribute("role"); control.labels![0]!.remove()
    expect(() => createSlider(root)).toThrow("labelled")
  })
  it("requires two labelled controls and the first native pair legend", () => {
    const { root, helper, end } = pair()
    helper.disconnect()
    root.prepend(document.createElement("legend"))
    expect(() => createSliderPair(root)).toThrow("legend")
    root.firstElementChild!.remove(); end.remove()
    expect(() => createSliderPair(root)).toThrow("exactly 2")
  })
})

describe("native sanitization and silent setters", () => {
  it("delegates min/max clamping to the actual range", () => {
    const { helper, control } = single()
    helper.setValue(999)
    expect(helper.value).toBe(100)
    helper.setValue(-999)
    expect(helper.value).toBe(0)
    expect(control.defaultValue).toBe("")
  })
  it.each([null, undefined, NaN, Infinity, -Infinity, "20", [20]])("rejects non-finite/non-number scalar %j", value => {
    const { helper } = single()
    expect(() => helper.setValue(value as number)).toThrow("finite")
    expect(helper.value).toBe(50)
  })
  it("does not intercept native property assignment or fabricate setter events", () => {
    const { control, helper, output } = single()
    const events = vi.fn(); control.addEventListener("input", events); control.addEventListener("change", events)
    helper.setValue(70)
    expect(output.value).toBe("70")
    control.valueAsNumber = 35
    expect(helper.value).toBe(35)
    expect(output.value).toBe("70")
    helper.refresh()
    expect(output.value).toBe("35")
    expect(events).not.toHaveBeenCalled()
    expect(Object.hasOwn(control, "value")).toBe(false)
  })
  it("retains native treatment of off-grid, any-step and degenerate bounds", () => {
    const { control, helper } = single()
    control.valueAsNumber = 53
    const baseline = control.valueAsNumber
    helper.setValue(53)
    expect(helper.value).toBe(baseline)
    control.step = "any"; helper.setValue(53.125)
    expect(helper.value).toBe(53.125)
    control.min = "5"; control.max = "5"; helper.setValue(99)
    expect(helper.value).toBe(5)
  })
  it("uses native invalid-constraint rules, not an arithmetic fallback engine", () => {
    const { helper, control } = single()
    control.min = "invalid"; control.max = "invalid"; control.step = "invalid"
    helper.setValue(200)
    expect(helper.value).toBe(100)
    control.min = "10"; control.max = "5"
    helper.setValue(-10)
    expect(helper.value).toBe(10)
  })
})

describe("two-track pair contract", () => {
  it("allows crossing without sorting, rewriting bounds or inventing a tuple form field", () => {
    const { helper, start, end, form } = pair()
    const before = [start.min, start.max, end.min, end.max]
    helper.setValue([90, 10])
    expect(helper.value).toEqual([90, 10])
    expect(helper.ordered).toBe(false)
    expect([start.min, start.max, end.min, end.max]).toEqual(before)
    const data = new FormData(form)
    expect(data.getAll("start")).toEqual(["90"])
    expect(data.getAll("end")).toEqual(["10"])
    expect(form.querySelectorAll('input[name="start"],input[name="end"]')).toHaveLength(2)
  })
  it("preserves authored defaults after narrowing and before post-reset refresh", async () => {
    const { helper, start, end, form } = pair()
    helper.setValue([65, 75])
    expect([start.defaultValue, end.defaultValue]).toEqual(["20", "80"])
    expect([start.min, start.max, end.min, end.max]).toEqual(["0", "100", "0", "100"])
    form.reset()
    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([20, 80])
    await flush()
    expect(helper.value).toEqual([20, 80])
  })
  it("keeps cancelled reset and changed native defaults independent of current values", async () => {
    const { helper, start, end, form } = pair()
    helper.setValue([70, 75])
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(helper.value).toEqual([70, 75])
    start.defaultValue = "15"; end.defaultValue = "85"
    form.reset(); await flush()
    expect(helper.value).toEqual([15, 85])
  })
  it.each([{ value: null }, { value: 4 }, { value: [10] }, { value: [10, 20, 30] }, { value: [10, NaN] }, { value: ["10", 20] }])("rejects invalid pair shape %j atomically", ({ value }) => {
    const { helper } = pair()
    expect(() => helper.setValue(value as [number, number])).toThrow("finite")
    expect(helper.value).toEqual([20, 80])
  })
  it("uses one aggregate notification per native committed change, never setter/reset events", async () => {
    const { root, helper, start, form } = pair()
    const changes: SliderPairChange[] = [], native = vi.fn()
    root.addEventListener("m:slider-pair-change", event => changes.push((event as CustomEvent).detail))
    start.addEventListener("input", native); start.addEventListener("change", native)
    helper.setValue([65, 75]); form.reset(); await flush()
    expect(changes).toEqual([])
    start.valueAsNumber = 30
    start.dispatchEvent(new Event("input", { bubbles: true }))
    start.dispatchEvent(new Event("change", { bubbles: true }))
    await flush()
    expect(native).toHaveBeenCalledTimes(2)
    expect(changes).toEqual([{ value: [30, 80], ordered: true, index: 0 }])
  })
  it("requires explicit rebinding if the endpoint order changes", () => {
    const { root, helper, end } = pair()
    root.querySelector(".m-slider-pair__fields")!.prepend(end.parentElement!)
    expect(() => helper.refresh()).toThrow("order changed")
  })
})

describe("non-live formatted native readouts", () => {
  it("updates output and optional aria-valuetext without a tooltip or live region", () => {
    const { control, output, helper } = single("volume-root", { formatValue: value => `${value} percent` })
    expect(output.value).toBe("50 percent")
    expect(output.defaultValue).toBe("50")
    expect(output.getAttribute("aria-live")).toBe("off")
    expect(control.getAttribute("aria-valuetext")).toBe("50 percent")
    helper.setValue(75)
    expect(output.value).toBe("75 percent")
    expect(output.children).toHaveLength(0)
    expect(control.getAttribute("aria-valuenow")).toBeNull()
  })
  it("requires plain-text formatting and proper non-live output association", () => {
    const { root, helper, output } = single()
    helper.disconnect()
    expect(() => createSlider(root, { formatValue: () => 5 as unknown as string })).toThrow("plain text")
    output.setAttribute("aria-live", "polite")
    expect(() => createSlider(root)).toThrow("aria-live=off")
    output.setAttribute("aria-live", "off"); output.htmlFor.value = "missing"
    expect(() => createSlider(root)).toThrow("distinct")
  })
  it("formats text without interpreting markup and freezes the initial formatter choice", () => {
    const options: SliderOptions = { formatValue: value => `<${value}>` }
    const { output, helper } = single("volume-root", options)
    options.formatValue = () => "later"
    helper.setValue(30)
    expect(output.value).toBe("<30>")
    expect(output.children).toHaveLength(0)
  })
  it("restores only owned text/attributes and preserves edited native range/default state", () => {
    const { control, output, helper } = single("volume-root", { formatValue: value => `${value}%` })
    helper.setValue(35)
    control.setAttribute("aria-valuetext", "author annotation")
    helper.disconnect()
    expect(control.valueAsNumber).toBe(35)
    expect(control.defaultValue).toBe("")
    expect(control.getAttribute("aria-valuetext")).toBe("author annotation")
    expect(output.hidden).toBe(true)
    expect(output.value).toBe("50")
    expect(output.defaultValue).toBe("50")
  })
})

describe("native forms and lifetime", () => {
  it("keeps fieldset disabling native and still permits explicit programmatic updates", () => {
    const { root, helper, start, end, form } = pair()
    root.disabled = true
    helper.setValue([35, 65])
    expect(helper.value).toEqual([35, 65])
    expect(start.disabled).toBe(false); expect(end.disabled).toBe(false)
    expect(new FormData(form).has("start")).toBe(false)
  })
  it("follows each endpoint's actual form owner without changing reset bounds", async () => {
    const { helper, end, form } = pair()
    end.setAttribute("form", "other-ranges")
    helper.setValue([65, 75])
    form.reset(); await flush()
    expect(helper.value).toEqual([20, 75])
    ;(document.getElementById("other-ranges") as HTMLFormElement).reset(); await flush()
    expect(helper.value).toEqual([20, 80])
  })
  it("follows changed external form IDs and default bounds", async () => {
    const { helper, control, form } = single("external-root")
    helper.setValue(8); form.reset(); await flush()
    expect(helper.value).toBe(8)
    const other = document.getElementById("other-ranges") as HTMLFormElement
    other.id = "renamed"; control.setAttribute("form", other.id)
    control.defaultValue = "4"; other.reset(); await flush()
    expect(helper.value).toBe(4)
  })
  it("keeps authored ticks and list associations without inventing mark-only snapping", () => {
    const { root, control, helper } = single()
    const list = root.querySelector("datalist"), options = list!.querySelectorAll("option")
    helper.setValue(35)
    expect(control.list).toBe(list)
    expect(root.querySelector("datalist")).toBe(list)
    expect(options).toHaveLength(3)
    expect(control.step).toBe("5")
    expect(helper.value).toBe(35)
  })
  it("disconnects removed roots and cancels pending aggregate notifications", async () => {
    const { root, helper, start } = pair()
    const change = vi.fn(); root.addEventListener("m:slider-pair-change", change)
    start.valueAsNumber = 40
    start.dispatchEvent(new Event("change", { bubbles: true }))
    root.remove(); await flush()
    expect(helper.connected).toBe(false)
    expect(change).not.toHaveBeenCalled()
    expect(start.valueAsNumber).toBe(40)
    expect(() => helper.setValue([10, 20])).toThrow("disconnected")
  })
})

describe("canonical Slider ViewElement", () => {
  it("is registered with CustomElementRegistry as m-slider and extends ViewElement", () => {
    expect(customElements.get("m-slider")).toBe(Slider)
    expect(Slider.tag).toBe("m-slider")
    const slider = document.createElement("m-slider")
    expect(slider).toBeInstanceOf(Slider)
  })

  it("initializes with canonical default values", () => {
    const slider = document.createElement("m-slider") as Slider
    document.body.append(slider)
    expect(slider.min).toBe(0)
    expect(slider.max).toBe(100)
    expect(slider.step).toBe(1)
    expect(slider.value).toBe(0)
    expect(slider.disabled).toBe(false)
    expect(slider.vertical).toBe(false)
    expect(slider.reverse).toBe(false)
  })

  it("generates an inner native range control when none is authored", () => {
    const slider = document.createElement("m-slider") as Slider
    document.body.append(slider)
    const control = slider.querySelector("input[type=range]") as HTMLInputElement
    expect(control).not.toBeNull()
    expect(control.hasAttribute("data-slider-control")).toBe(true)
    expect(control.min).toBe("0")
    expect(control.max).toBe("100")
    expect(control.step).toBe("1")
    expect(control.value).toBe("0")
    expect(control.disabled).toBe(false)
  })

  it("adopts an authored native range input", () => {
    const slider = document.createElement("m-slider") as Slider
    const authored = document.createElement("input")
    authored.type = "range"
    authored.setAttribute("aria-label", "Authored level")
    authored.min = "10"
    authored.max = "50"
    authored.step = "2"
    authored.value = "24"
    authored.disabled = true
    slider.append(authored)
    document.body.append(slider)
    expect(slider.error).toBeNull()
    expect(slider.native).toBe(authored)
    expect(slider.min).toBe(10)
    expect(slider.max).toBe(50)
    expect(slider.step).toBe(2)
    expect(slider.value).toBe(24)
    expect(slider.disabled).toBe(true)
  })

  it("reflects property changes to attributes and control", () => {
    const slider = document.createElement("m-slider") as Slider
    document.body.append(slider)

    slider.value = 42
    expect(slider.getAttribute("value")).toBe("42")
    expect(slider.value).toBe(42)

    slider.min = 10
    expect(slider.getAttribute("min")).toBe("10")
    expect(slider.min).toBe(10)

    slider.max = 200
    expect(slider.getAttribute("max")).toBe("200")
    expect(slider.max).toBe(200)

    slider.step = 5
    expect(slider.getAttribute("step")).toBe("5")
    expect(slider.step).toBe(5)

    slider.disabled = true
    expect(slider.hasAttribute("disabled")).toBe(true)
    expect(slider.disabled).toBe(true)
    slider.disabled = false
    expect(slider.hasAttribute("disabled")).toBe(false)
    expect(slider.disabled).toBe(false)

    slider.vertical = true
    expect(slider.hasAttribute("vertical")).toBe(true)
    expect(slider.vertical).toBe(true)
    expect(slider.hasAttribute("data-vertical")).toBe(true)
    slider.vertical = false
    expect(slider.hasAttribute("vertical")).toBe(false)
    expect(slider.hasAttribute("data-vertical")).toBe(false)

    slider.reverse = true
    expect(slider.hasAttribute("reverse")).toBe(true)
    expect(slider.reverse).toBe(true)
    const ctrl = slider.querySelector("input")!
    expect(ctrl.dir).toBe("rtl")
    slider.reverse = false
    expect(slider.hasAttribute("reverse")).toBe(false)
    expect(ctrl.hasAttribute("dir")).toBe(false)
  })

  it("validates numeric property assignments", () => {
    const slider = document.createElement("m-slider") as Slider
    document.body.append(slider)
    expect(() => { slider.value = NaN }).toThrow(RangeError)
    expect(() => { slider.value = Infinity }).toThrow(RangeError)
    expect(() => { slider.min = NaN }).toThrow(RangeError)
    expect(() => { slider.max = Infinity }).toThrow(RangeError)
    expect(() => { slider.step = 0 }).toThrow(RangeError)
    expect(() => { slider.step = -1 }).toThrow(RangeError)
  })

  it("dispatches m:change event when control value changes", () => {
    const slider = document.createElement("m-slider") as Slider
    document.body.append(slider)
    const listener = vi.fn()
    slider.addEventListener("m:change", listener)

    const input = slider.querySelector("input")!
    input.value = "60"
    input.dispatchEvent(new Event("input", { bubbles: true }))

    expect(listener).toHaveBeenCalledTimes(1)
    const event = listener.mock.calls[0][0] as CustomEvent
    expect(event.detail).toEqual({ value: 60 })
    expect(event.bubbles).toBe(true)
    expect(event.cancelable).toBe(false)
    expect(event.composed).toBe(false)
    expect(slider.value).toBe(60)
  })

  it("supports stepUp and stepDown methods", () => {
    const slider = document.createElement("m-slider") as Slider
    document.body.append(slider)
    slider.value = 50
    slider.step = 5
    const listener = vi.fn()
    slider.addEventListener("m:change", listener)

    slider.stepUp()
    expect(slider.value).toBe(55)
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: 55 } }))

    slider.stepDown()
    expect(slider.value).toBe(50)
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: 50 } }))
  })

  it("synchronizes output element inside m-slider", () => {
    const slider = document.createElement("m-slider") as Slider
    const output = document.createElement("output")
    output.setAttribute("data-slider-output", "")
    slider.append(output)
    document.body.append(slider)

    slider.value = 75
    expect(output.value).toBe("75")
    expect(output.hidden).toBe(false)
  })

  it("delegates focus and blur to control", () => {
    const slider = document.createElement("m-slider") as Slider
    document.body.append(slider)
    const ctrl = slider.querySelector("input")!
    const focusSpy = vi.spyOn(ctrl, "focus")
    const blurSpy = vi.spyOn(ctrl, "blur")

    slider.focus()
    expect(focusSpy).toHaveBeenCalled()

    slider.blur()
    expect(blurSpy).toHaveBeenCalled()
  })

  it("synchronizes with form reset", async () => {
    const form = document.createElement("form")
    const slider = document.createElement("m-slider") as Slider
    form.append(slider)
    document.body.append(form)

    slider.value = 80
    expect(slider.value).toBe(80)

    form.reset()
    await flush()
    expect(slider.value).toBe(0)
  })
})

describe("shared Slider transactions", () => {
  it("prepares both clamped values before accepting formatter output", () => {
    const { helper, start, end } = pair({ formatValue: (value, index) => {
      if (index === 1 && value === 100) throw new Error("Reject upper endpoint")
      return `${value}%`
    } })
    const outputs = [...document.querySelectorAll("#window-pair output")].map(output => output.textContent)
    expect(() => helper.setValue([-999, 999])).toThrow("Reject upper endpoint")
    expect(helper.value).toEqual([20, 80])
    expect([start.defaultValue, end.defaultValue]).toEqual(["20", "80"])
    expect([...document.querySelectorAll("#window-pair output")].map(output => output.textContent)).toEqual(outputs)
    expect(helper.error).toBe("Reject upper endpoint")
    helper.setValue([-999, 70])
    expect(helper.value).toEqual([0, 70])
    expect(helper.error).toBeNull()
  })

  it("prepares defaults and constraints atomically without changing authored state on failure", () => {
    let reject = false
    const { helper, start, end } = pair({ formatValue: (value, index) => {
      if (reject && index === 1) throw new Error("Reject preparation")
      return String(value)
    } })
    reject = true
    expect(() => helper.setMax(60)).toThrow("Reject preparation")
    expect([start.max, end.max]).toEqual(["100", "100"])
    expect(helper.value).toEqual([20, 80])
    expect(() => helper.setDefaultValue(["60", "75"])).toThrow("Reject preparation")
    expect([start.defaultValue, end.defaultValue]).toEqual(["20", "80"])
    reject = false
    helper.setValue([30, 70])
    helper.setDefaultValue(["15", "85"])
    expect(helper.value).toEqual([30, 70])
  })

  it("retains the accepted formatter on failure and restores authored valuetext when clearing it", () => {
    const { helper, control, output } = single("volume-root", { formatValue: value => `${value}%` })
    expect(() => helper.setFormatValue(() => { throw new Error("Bad formatter") })).toThrow("Bad formatter")
    helper.setValue(35)
    expect(output.value).toBe("35%")
    helper.setFormatValue(undefined)
    expect(output.value).toBe("35")
    expect(control.hasAttribute("aria-valuetext")).toBe(false)
  })

  it("does not commit stale formatting after a nested accepted value update", () => {
    const { helper, output } = single()
    let nested = false
    expect(() => helper.setFormatValue(value => {
      if (!nested) { nested = true; helper.setValue(70) }
      return `${value}%`
    })).toThrow("superseded")
    expect(helper.value).toBe(70)
    expect(output.value).toBe("70")
    helper.setValue(40)
    expect(output.value).toBe("40")
  })

  it("does not write after a formatter disconnects the owner", () => {
    const { helper, control, output } = single()
    const before = output.value
    expect(() => helper.setFormatValue(value => { helper.disconnect(); return String(value) })).toThrow("superseded")
    expect(helper.connected).toBe(false)
    expect(control.valueAsNumber).toBe(50)
    expect(output.value).toBe(before)
    expect(output.hidden).toBe(true)
    expect(() => helper.setMin(10)).toThrow("disconnected")
    expect(() => helper.setDisabled(true)).toThrow("disconnected")
  })
})

describe("canonical Slider single owner and range mapping", () => {
  function element(range = false, content = "") {
    const slider = document.createElement("m-slider") as Slider
    slider.range = range
    slider.innerHTML = content
    document.body.append(slider)
    expect(slider.error).toBeNull()
    return slider
  }

  it("keeps generated zero versus authored midpoint, and preserves explicit generated defaults", async () => {
    const form = document.createElement("form")
    const generated = document.createElement("m-slider") as Slider
    generated.value = 25
    form.append(generated); document.body.append(form)
    expect(generated.defaultValue).toBe("25")
    generated.value = 75
    form.reset(); await flush()
    expect(generated.value).toBe(25)
    const authored = document.createElement("m-slider") as Slider
    authored.innerHTML = '<input type="range" aria-label="Midpoint" min="10" max="50">'
    const midpoint = authored.querySelector("input")!.valueAsNumber
    document.body.append(authored)
    expect(authored.error).toBeNull()
    expect(authored.value).toBe(midpoint)
    expect(authored.defaultValue).toBe("")
    expect((authored.native as HTMLInputElement).hasAttribute("value")).toBe(false)
  })

  it("reads direct native writes live without reflecting them into defaults or replaying stale host value", async () => {
    const slider = document.createElement("m-slider") as Slider
    slider.value = 20
    slider.setAttribute("aria-label", "Level")
    slider.reverse = true; slider.vertical = true
    document.body.append(slider)
    const control = slider.native as HTMLInputElement
    control.valueAsNumber = 75
    expect(slider.value).toBe(75)
    expect(slider.defaultValue).toBe("20")
    slider.remove(); document.body.append(slider); await flush()
    expect(slider.native).toBe(control)
    expect(slider.value).toBe(75)
    expect(control.dir).toBe("rtl")
    expect(slider.hasAttribute("data-vertical")).toBe(true)
    expect(control.getAttribute("aria-label")).toBe("Level")
  })

  it("rejects a second Web owner for the canonical native root", () => {
    const slider = element()
    expect(() => createSlider(slider)).toThrow("owner")
    const range = element(true)
    expect(() => createSliderPair(range.querySelector("fieldset")!)).toThrow("owner")
  })

  it("maps generated range defaults, independent clamps, crossing and native indexed stepping", () => {
    const slider = element(true)
    expect(slider.value).toEqual([0, 100])
    expect(slider.defaultValue).toEqual(["0", "100"])
    const controls = slider.native as readonly [HTMLInputElement, HTMLInputElement]
    expect(controls.map(control => control.getAttribute("aria-label"))).toEqual(["Start", "End"])
    slider.value = [90, 10]
    expect(slider.value).toEqual([90, 10])
    expect(slider.ordered).toBe(false)
    slider.value = [-999, 999]
    expect(slider.value).toEqual([0, 100])
    expect(controls.map(control => [control.min, control.max])).toEqual([["0", "100"], ["0", "100"]])
    slider.stepDown(2, 1)
    expect(slider.value).toEqual([0, 98])
    slider.step = "any"; slider.value = [0.125, 99.875]
    expect(slider.value).toEqual([0.125, 99.875])
    expect(() => slider.stepUp()).toThrow()
    expect(() => slider.value = 25).toThrow("2 finite")
    expect(() => slider.value = [NaN, 25]).toThrow("2 finite")
    expect(slider.value).toEqual([0.125, 99.875])
  })

  it("retains pair defaults, per-endpoint bounds, labels, listeners and actual native form owners", async () => {
    const form = document.createElement("form")
    form.id = "pair-form"
    const external = document.createElement("form"); external.id = "external-form"
    document.body.append(form, external)
    const slider = document.createElement("m-slider") as Slider
    slider.range = true
    slider.innerHTML = `<fieldset><legend>Endpoints</legend>
      <label for="canonical-start">Start</label><input id="canonical-start" type="range" name="start" min="0" max="40" value="20" aria-describedby="canonical-help">
      <label for="canonical-end">End</label><input id="canonical-end" type="range" name="end" form="external-form" min="50" max="100" value="80">
      <p id="canonical-help">Help</p></fieldset>`
    const controls = [...slider.querySelectorAll("input")]
    const label = slider.querySelector("label")
    const native = vi.fn(); controls[0]!.addEventListener("input", native)
    form.append(slider)
    expect(slider.error).toBeNull()
    expect(slider.native).toEqual(controls)
    expect(slider.labels[0]).toBe(label)
    expect(slider.form).toBe(form)
    slider.value = [99, 0]
    expect(slider.value).toEqual([40, 50])
    expect(slider.defaultValue).toEqual(["20", "80"])
    form.reset(); await flush()
    expect(slider.value).toEqual([20, 50])
    external.reset(); await flush()
    expect(slider.value).toEqual([20, 80])
    slider.disabled = true
    expect((slider.querySelector("fieldset") as HTMLFieldSetElement).disabled).toBe(true)
    expect(controls[0]!.disabled).toBe(false)
    expect(new FormData(form).has("start")).toBe(false)
    slider.disabled = false
    controls[0]!.dispatchEvent(new Event("input", { bubbles: true }))
    expect(native).toHaveBeenCalledTimes(1)
    expect(controls[0]!.getAttribute("aria-describedby")).toBe("canonical-help")
    expect(slider.querySelector("label")).toBe(label)
  })

  it("shares event semantics: silent setters/reset, deduplicated native changes and one deferred pair commit", async () => {
    const form = document.createElement("form"), slider = document.createElement("m-slider") as Slider
    slider.range = true; slider.value = [20, 80]
    form.append(slider); document.body.append(form)
    const changes = vi.fn(), commits = vi.fn(), native = vi.fn()
    slider.addEventListener("m:change", changes); slider.addEventListener("m:slider-pair-change", commits)
    const controls = slider.native as readonly [HTMLInputElement, HTMLInputElement]
    controls[0].addEventListener("input", native); controls[0].addEventListener("change", native)
    slider.value = [90, 10]; form.reset(); await flush()
    expect(changes).not.toHaveBeenCalled(); expect(commits).not.toHaveBeenCalled()
    controls[0].value = "35"
    controls[0].dispatchEvent(new Event("input", { bubbles: true }))
    controls[0].dispatchEvent(new Event("change", { bubbles: true }))
    expect(changes).toHaveBeenCalledTimes(1)
    expect(commits).not.toHaveBeenCalled()
    await flush()
    expect(changes.mock.calls[0]![0].detail).toEqual({ value: [35, 80], ordered: true, index: 0 })
    expect(commits.mock.calls[0]![0].detail).toEqual({ value: [35, 80], ordered: true, index: 0 })
    expect(commits.mock.calls[0]![0].bubbles).toBe(false)
    expect(native).toHaveBeenCalledTimes(2)
    slider.stepUp()
    expect(changes).toHaveBeenCalledTimes(2)
    expect(native).toHaveBeenCalledTimes(2)
    controls[0].dispatchEvent(new Event("change", { bubbles: true }))
    slider.remove(); document.body.append(slider); await flush()
    expect(commits).toHaveBeenCalledTimes(1)
  })

  it("keeps native default writes and canceled resets independent of live values", async () => {
    const form = document.createElement("form"), slider = document.createElement("m-slider") as Slider
    slider.range = true
    form.append(slider); document.body.append(form)
    slider.value = [25, 75]; slider.defaultValue = ["10", "90"]
    expect(slider.value).toEqual([25, 75])
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await flush()
    expect(slider.value).toEqual([25, 75])
    form.reset(); await flush()
    expect(slider.value).toEqual([10, 90])
    slider.name = "endpoint"
    expect(new FormData(form).getAll("endpoint")).toEqual(["10", "90"])
  })

  it("retains authored native ARIA/direction unless explicitly mapped, and preserves later author edits", () => {
    const slider = element(false, '<input type="range" aria-label="Original" aria-valuetext="Native annotation" aria-describedby="help" dir="rtl">')
    const control = slider.native as HTMLInputElement
    slider.min = 10
    expect(control.getAttribute("aria-label")).toBe("Original")
    expect(control.getAttribute("aria-valuetext")).toBe("Native annotation")
    expect(control.getAttribute("aria-describedby")).toBe("help")
    expect(control.dir).toBe("rtl")
    slider.setAttribute("aria-label", "Mapped")
    slider.removeAttribute("aria-label")
    expect(control.getAttribute("aria-label")).toBe("Original")
    slider.formatValue = value => `${value}%`
    control.setAttribute("aria-valuetext", "Later author")
    slider.remove()
    expect(control.getAttribute("aria-valuetext")).toBe("Later author")
  })

  it("pre-upgrade replays range/value/constraints/defaults/formatValue before connection", () => {
    const parsed = new DOMParser().parseFromString("<m-slider></m-slider>", "text/html")
    const slider = parsed.querySelector("m-slider") as Slider
    slider.range = true; slider.value = [25, 75]; slider.min = 10; slider.max = 90; slider.step = "any"
    slider.defaultValue = ["15", "85"]; slider.formatValue = value => `${value}%`
    expect(Object.hasOwn(slider, "range")).toBe(true)
    document.body.append(document.adoptNode(slider))
    expect(slider).toBeInstanceOf(Slider)
    expect(slider.error).toBeNull()
    expect(slider.value).toEqual([25, 75])
    expect(slider.defaultValue).toEqual(["15", "85"])
    expect(slider.step).toBe("any")
    expect((slider.native as readonly HTMLInputElement[]).map(control => control.getAttribute("aria-valuetext"))).toEqual(["25%", "75%"])
    expect(Object.hasOwn(slider, "range")).toBe(false)
  })

  it("reports unsupported readonly and invalid attribute gates, and explicitly recovers", () => {
    const slider = element()
    const errors = vi.fn(); slider.addEventListener("m:error", errors)
    expect(() => slider.readonly = true).toThrow("readonly")
    slider.setAttribute("readonly", "")
    expect(slider.error).toContain("readonly")
    expect(errors).toHaveBeenCalledTimes(1)
    slider.readonly = false; slider.refresh()
    expect(slider.error).toBeNull()
    slider.setAttribute("step", "0")
    expect(slider.error).toContain("step")
    expect((slider.native as HTMLInputElement).step).toBe("1")
    slider.step = "any"
    expect(slider.error).toBeNull()
    expect(() => slider.range = true).toThrow("materialized")
  })

  it("keeps the accepted element callback/value/constraints after callback rejection", () => {
    const slider = element(true)
    let rejectConstraint = false
    slider.formatValue = (value, index) => {
      if (value === 60 || rejectConstraint && index === 1) throw new Error("Reject preparation")
      return `${value}%`
    }
    const accepted = slider.formatValue
    expect(() => slider.formatValue = () => { throw new Error("Reject candidate") }).toThrow("Reject candidate")
    expect(slider.formatValue).toBe(accepted)
    expect(() => slider.value = [20, 60]).toThrow("Reject preparation")
    expect(slider.value).toEqual([0, 100])
    rejectConstraint = true
    expect(() => slider.max = 60).toThrow("Reject preparation")
    expect(slider.max).toBe(100)
    expect(slider.hasAttribute("max")).toBe(false)
    rejectConstraint = false
    slider.value = [20, 80]
    expect(slider.error).toBeNull()
  })

  it("gates stale connect callbacks and recovers without duplicate generated controls", () => {
    const slider = document.createElement("m-slider") as Slider
    const errors = vi.fn(); slider.addEventListener("m:error", errors)
    let changed = false
    slider.formatValue = value => {
      if (!changed) { changed = true; slider.value = 90 }
      return String(value)
    }
    document.body.append(slider)
    expect(slider.error).toContain("superseded")
    expect(errors).toHaveBeenCalledTimes(1)
    slider.formatValue = undefined; slider.refresh()
    expect(slider.error).toBeNull()
    expect(slider.value).toBe(90)
    expect(slider.querySelectorAll("input")).toHaveLength(1)
  })

  it("retains native focus, validity and ancestor fieldset disabling", () => {
    const fieldset = document.createElement("fieldset")
    const slider = document.createElement("m-slider") as Slider
    slider.name = "level"
    fieldset.append(slider); document.body.append(fieldset)
    const control = slider.native as HTMLInputElement
    slider.focus(); expect(document.activeElement).toBe(control)
    slider.blur(); expect(document.activeElement).not.toBe(control)
    expect(slider.checkValidity()).toBe(control.checkValidity())
    expect(slider.reportValidity()).toBe(control.reportValidity())
    control.setCustomValidity("Invalid level")
    expect(slider.checkValidity()).toBe(false)
    control.setCustomValidity("")
    fieldset.disabled = true
    expect(control.matches(":disabled")).toBe(true)
    expect(slider.disabled).toBe(false)
    slider.value = 70
    expect(slider.value).toBe(70)
    expect(slider.hasAttribute("role")).toBe(false)
    expect(slider.hasAttribute("tabindex")).toBe(false)
  })

  it("reports replaced native controls and rebinds explicitly without duplicating listeners", async () => {
    const slider = element()
    const old = slider.native as HTMLInputElement
    const replacement = old.cloneNode(false) as HTMLInputElement
    const errors = vi.fn(), changes = vi.fn()
    slider.addEventListener("m:error", errors); slider.addEventListener("m:change", changes)
    old.replaceWith(replacement); await flush()
    expect(slider.error).toContain("controls/order changed")
    expect(errors).toHaveBeenCalledTimes(1)
    slider.refresh()
    expect(slider.native).toBe(replacement)
    expect(slider.error).toBeNull()
    replacement.value = "40"
    replacement.dispatchEvent(new Event("input", { bubbles: true }))
    expect(changes).toHaveBeenCalledTimes(1)
  })

  it("does not claim a nested Slider's native control", async () => {
    const slider = element(false, '<m-slider id="nested-slider" value="25"></m-slider>')
    const nested = slider.querySelector<Slider>("m-slider")!
    expect(nested.error).toBeNull()
    expect(nested.value).toBe(25)
    expect(slider.value).toBe(0)
    slider.value = 75; await flush()
    expect(nested.value).toBe(25)
    expect(slider.native).not.toBe(nested.native)
  })

  it("fails registration conflicts without replacing the existing constructor", () => {
    const existing = class extends HTMLElement {}
    const registry = { get: vi.fn(() => existing), define: vi.fn() }
    expect(() => registerSlider(registry)).toThrow("different implementation")
    expect(registry.define).not.toHaveBeenCalled()
  })
})
