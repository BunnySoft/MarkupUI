import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createSlider, createSliderPair } from "../src/components/slider/index.js"
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
    expect(css).not.toMatch(/--mui-slider-[\w-]+\s*:/)
    expect(css).toMatch(/data-mui-theme="?dark"?/)
    expect(css).toContain("#2a947d")
    expect(css).not.toContain("var(--mui-text-primary")
  })
  it("retains native rail/thumb painting and room for intrinsic datalist ticks", () => {
    expect(css).not.toMatch(/appearance\s*:|slider-thumb|slider-runnable-track|range-thumb|range-track|position:\s*absolute/)
    expect(css).toMatch(/min-block-size:\s*18px/)
    expect(css).not.toMatch(/(?:^|[;{])\s*block-size:\s*18px/)
  })
  it("includes pair padding in authored widths without a global reset", () => {
    expect(css).toMatch(/\.mui-slider,\s*\.mui-slider-pair\s*\{[^}]*box-sizing:\s*border-box/)
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
    expect(css).toMatch(/inline-size:\s*var\(--mui-slider-length,\s*12rem\)/)
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
    const before = customElements.get("mui-slider")
    single()
    expect(customElements.get("mui-slider")).toBe(before)
  })
  it("rejects duplicate and cross-module owners and permits explicit recreation", async () => {
    const { root, helper } = single()
    expect(() => createSlider(root)).toThrow("owner")
    vi.resetModules()
    const other = await import("../src/components/slider/index.js")
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
    root.addEventListener("mui:slider-pair-change", event => changes.push((event as CustomEvent).detail))
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
    root.querySelector(".mui-slider-pair__fields")!.prepend(end.parentElement!)
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
    const change = vi.fn(); root.addEventListener("mui:slider-pair-change", change)
    start.valueAsNumber = 40
    start.dispatchEvent(new Event("change", { bubbles: true }))
    root.remove(); await flush()
    expect(helper.connected).toBe(false)
    expect(change).not.toHaveBeenCalled()
    expect(start.valueAsNumber).toBe(40)
    expect(() => helper.setValue([10, 20])).toThrow("disconnected")
  })
})
