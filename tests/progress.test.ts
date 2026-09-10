import { afterEach, describe, expect, it, vi } from "vitest"
import { MuiProgress, registerProgress } from "../src/components/progress/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

function progress(markup = '<mui-progress label="Upload"></mui-progress>'): MuiProgress {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-progress")
  if (!(element instanceof MuiProgress)) throw new Error("Progress was not upgraded")
  return element
}
function fill(element: MuiProgress): SVGCircleElement {
  return element.querySelector<SVGCircleElement>("[data-mui-progress-fill]")!
}

describe("standalone Progress", () => {
  it("uses one native progress owner with zero-percent defaults", () => {
    const element = progress()
    expect(element.valid).toBe(true)
    expect(element.controls).toHaveLength(1)
    expect(element.controls[0]?.value).toBe(0)
    expect(element.controls[0]?.max).toBe(100)
    expect(element.controls[0]?.getAttribute("aria-label")).toBe("Upload")
    expect(element.hasAttribute("role") || element.hasAttribute("aria-valuenow")).toBe(false)
    expect(element.querySelectorAll("[role=progressbar]")).toHaveLength(0)
    expect(element.querySelector("[data-mui-progress-text]")?.textContent).toBe("0%")
  })

  it("normalizes finite percentage bounds explicitly without inferring success status", () => {
    const element = progress()
    element.percentage = -20
    expect(element.normalizedPercentages).toEqual([0])
    expect(element.hasAttribute("data-mui-progress-clamped")).toBe(true)
    expect(element.percentage).toBe(-20)
    element.percentage = 120
    expect(element.controls[0]?.value).toBe(100)
    expect(element.status).toBe("default")
    element.percentage = 40.125
    expect(element.querySelector("[data-mui-progress-text]")?.textContent).toBe("40.13%")
    expect(element.hasAttribute("data-mui-progress-clamped")).toBe(false)
  })

  it("retains legacy value/max units while converting the visual ratio to percent", () => {
    const element = progress('<mui-progress value="25" max="50"></mui-progress>')
    expect(element.controls[0]?.value).toBe(25)
    expect(element.controls[0]?.max).toBe(50)
    expect(element.normalizedPercentages).toEqual([50])
    element.value = 100
    expect(element.controls[0]?.value).toBe(50)
    expect(element.value).toBe(100)
    expect(element.normalizedPercentages).toEqual([100])
    element.value = -1
    expect(element.normalizedPercentages).toEqual([0])
  })

  it("gives explicit percentage precedence over inactive legacy aliases", () => {
    const element = progress('<mui-progress percentage="40" value="20" max="0"></mui-progress>')
    expect(element.valid).toBe(true)
    expect(element.controls[0]?.max).toBe(100)
    expect(element.controls[0]?.value).toBe(40)
    element.removeAttribute("percentage")
    expect(element.validationErrors).toContain("max")
    expect(element.querySelector<HTMLElement>("[data-mui-progress-native-group]")?.hidden).toBe(true)
  })

  it("rejects invalid numeric properties and diagnoses zero/invalid max without a success fallback", () => {
    const element = progress('<mui-progress value="5" max="10"></mui-progress>')
    for (const value of [0, -1, NaN, Infinity]) expect(() => { element.max = value }).toThrow(RangeError)
    expect(element.max).toBe(10)
    expect(() => { element.percentage = NaN }).toThrow(RangeError)
    expect(() => { element.value = Infinity }).toThrow(RangeError)
    element.setAttribute("max", "0")
    expect(element.valid).toBe(false)
    expect(element.validationErrors).toContain("max")
    element.max = 10
    expect(element.valid).toBe(true)
    element.setAttribute("value", "bad")
    expect(element.validationErrors).toContain("value")
  })

  it("preserves authored native progress identity, native max defaults and label associations", () => {
    const element = progress('<mui-progress><label data-mui-progress-label for="native">Transfer</label><progress id="native" value="0.5"></progress></mui-progress>')
    const native = element.querySelector("progress")!
    const label = element.querySelector("label")!
    expect(element.controls[0]).toBe(native)
    expect(native.max).toBe(1)
    expect(element.normalizedPercentages).toEqual([50])
    expect(native.labels?.[0]).toBe(label)
    expect(native.hasAttribute("aria-label")).toBe(false)
    expect(label.parentElement).toBe(element)
  })

  it("adopts native indeterminate state and distinguishes explicit indeterminate from processing", () => {
    const element = progress('<mui-progress processing><progress aria-label="Transfer"></progress></mui-progress>')
    expect(element.controls[0]?.hasAttribute("value")).toBe(false)
    expect(element.controls[0]?.position).toBe(-1)
    expect(element.normalizedPercentages).toEqual([null])
    element.percentage = 35
    expect(element.controls[0]?.position).toBe(.35)
    expect(element.normalizedPercentages).toEqual([35])
    element.indeterminate = true
    expect(element.controls[0]?.position).toBe(-1)
    expect(element.querySelector("[data-mui-progress-text]")?.textContent).toBe("…")
    element.indeterminate = false
    expect(element.controls[0]?.value).toBe(35)
  })

  it("restores authored values/ARIA when host overrides are removed or the component disconnects", async () => {
    const element = progress('<mui-progress percentage="60"><progress value="2" max="4" aria-label="Native" aria-valuenow="2" tabindex="0"></progress></mui-progress>')
    const native = element.controls[0]!
    expect(native.value).toBe(60)
    expect(native.hasAttribute("aria-valuenow")).toBe(false)
    native.setAttribute("value", "3")
    await Promise.resolve()
    expect(native.value).toBe(60)
    element.removeAttribute("percentage")
    expect(native.value).toBe(3)
    expect(native.max).toBe(4)
    element.type = "circle"
    expect(native.tabIndex).toBe(-1)
    element.remove()
    expect(native.getAttribute("aria-valuenow")).toBe("2")
    expect(native.tabIndex).toBe(0)
    expect(native.getAttribute("aria-label")).toBe("Native")
  })

  it("preserves explicit native names and forwards only missing host naming/description data", () => {
    const element = progress('<mui-progress aria-label="Host" aria-describedby="help"><progress value="30" max="100" aria-label="Native"></progress></mui-progress>')
    expect(element.controls[0]?.getAttribute("aria-label")).toBe("Native")
    expect(element.controls[0]?.getAttribute("aria-describedby")).toBe("help")
    element.setAttribute("aria-labelledby", "host-name")
    expect(element.controls[0]?.hasAttribute("aria-labelledby")).toBe(false)
    element.removeAttribute("aria-describedby")
    expect(element.controls[0]?.hasAttribute("aria-describedby")).toBe(false)
    const generated = progress('<mui-progress aria-labelledby="title" aria-valuetext="Halfway" percentage="50"></mui-progress>')
    expect(generated.controls[0]?.getAttribute("aria-labelledby")).toBe("title")
    expect(generated.controls[0]?.hasAttribute("aria-label")).toBe(false)
    expect(generated.controls[0]?.getAttribute("aria-valuetext")).toBe("Halfway")
  })

  it("rejects duplicate wrapper semantics and interactive native progress descendants", () => {
    const element = progress('<mui-progress role="progressbar" percentage="50"></mui-progress>')
    expect(element.validationErrors).toContain("role")
    expect(element.querySelector<HTMLElement>("[data-mui-progress-native-group]")?.hidden).toBe(true)
    element.removeAttribute("role")
    expect(element.valid).toBe(true)
    const invalid = progress('<mui-progress><progress value="2" max="4"><button type="button">Wrong place</button></progress></mui-progress>')
    expect(invalid.validationErrors).toContain("controls")
  })

  it("renders circle geometry as decorative SVG while retaining exactly one native owner", () => {
    const element = progress('<mui-progress type="circle" percentage="50" label="Upload"></mui-progress>')
    const svg = element.querySelector("svg")!
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(svg.getAttribute("viewBox")).toBe("0 0 100 100")
    expect(Number(fill(element).getAttribute("r"))).toBeCloseTo(50 - 7 / 1.07 / 2)
    expect(Number(fill(element).getAttribute("stroke-width"))).toBeCloseTo(7 / 1.07)
    expect(element.strokeWidth).toBe(7)
    expect(fill(element).getAttribute("stroke-dasharray")).toBe("50 100")
    expect(fill(element).getAttribute("transform")).toBe("rotate(90 50 50)")
    expect(element.controls).toHaveLength(1)
    expect(element.controls[0]?.value).toBe(50)
    expect(element.querySelector("[data-mui-progress-graphic]")?.getAttribute("aria-hidden")).toBe("true")
    expect(element.querySelector("[data-mui-progress-graphic]")?.hasAttribute("inert")).toBe(true)
  })

  it("uses actual angular dashboard gaps, offsets and empty-arc behavior", () => {
    const element = progress('<mui-progress type="dashboard" percentage="50"></mui-progress>')
    expect(parseFloat(fill(element).getAttribute("stroke-dasharray")!)).toBeCloseTo(39.583333)
    expect(fill(element).getAttribute("transform")).toBe("rotate(127.5 50 50)")
    element.gapDegree = 360
    expect(fill(element).getAttribute("visibility")).toBe("hidden")
    expect(element.querySelector("[data-mui-progress-rail]")?.getAttribute("visibility")).toBe("hidden")
    element.gapDegree = 0
    element.gapOffsetDegree = 30
    element.offsetDegree = 45
    expect(fill(element).getAttribute("transform")).toBe("rotate(165 50 50)")
    element.gapOffsetDegree = Number.MAX_VALUE
    element.offsetDegree = Number.MAX_VALUE
    expect(fill(element).getAttribute("transform")).not.toContain("Infinity")
  })

  it("supports the pinned offset-degress spelling and source aliases with current names taking precedence", () => {
    const element = progress('<mui-progress type="circle" percentage="20" offset-degress="45" indicator-position="inside"></mui-progress>')
    expect(element.offsetDegree).toBe(45)
    expect(element.indicatorPlacement).toBe("inside")
    element.offsetDegree = 90
    element.indicatorPlacement = "outside"
    expect(element.offsetDegress).toBe(90)
    expect(element.indicatorPosition).toBe("outside")
    expect(fill(element).getAttribute("transform")).toBe("rotate(180 50 50)")
  })

  it("never paints a zero-percent round-cap dot", () => {
    const element = progress('<mui-progress type="circle" percentage="0"></mui-progress>')
    expect(fill(element).getAttribute("visibility")).toBe("hidden")
    element.percentage = 1
    expect(fill(element).getAttribute("visibility")).toBe("visible")
    element.indeterminate = true
    expect(element.controls[0]?.hasAttribute("value")).toBe(false)
    expect(fill(element).hasAttribute("data-mui-progress-indeterminate-fill")).toBe(true)
  })

  it("retains the native value and semantic owner when statuses replace decorative text visually", () => {
    const element = progress('<mui-progress percentage="42.25" label="Upload"></mui-progress>')
    const owner = element.controls[0]
    for (const status of ["info", "success", "warning", "error"]) {
      element.status = status
      expect(element.controls).toEqual([owner])
      expect(owner?.value).toBe(42.25)
      expect(owner?.getAttribute("aria-label")).toBe("Upload")
      expect(element.hasAttribute("role")).toBe(false)
      expect(element.querySelector("[data-mui-progress-text]")?.textContent).toBe("42.25%")
      expect(element.querySelector("[data-mui-progress-text]")?.getAttribute("aria-hidden")).toBe("true")
    }
  })

  it("implements multiple circles with separate named native measures and consistent order", () => {
    const element = progress('<mui-progress type="multiple-circle" percentage="[20,80,50]" label="Stage"></mui-progress>')
    expect(element.normalizedPercentages).toEqual([20, 80, 50])
    expect(element.controls.map((node) => node.value)).toEqual([20, 80, 50])
    expect(element.controls.map((node) => node.getAttribute("aria-label"))).toEqual(["Stage 1", "Stage 2", "Stage 3"])
    expect([...element.querySelectorAll<SVGCircleElement>("[data-mui-progress-fill]")].map((node) => node.getAttribute("r"))).toEqual(["46.5", "38.5", "30.5"])
    element.percentage = [30, 60]
    expect(element.querySelectorAll("[data-mui-progress-ring]")).toHaveLength(2)
    expect(element.controls).toHaveLength(2)
    element.percentage = []
    expect(element.valid).toBe(true)
    expect(element.controls).toHaveLength(0)
  })

  it("supports authored native multiple ratios and per-measure indeterminate state", () => {
    const element = progress('<mui-progress type="multiple-circle"><progress value="1" max="4" aria-label="Files"></progress><progress max="10" aria-label="Network"></progress></mui-progress>')
    expect(element.normalizedPercentages).toEqual([25, null])
    expect(element.controls[0]?.getAttribute("aria-label")).toBe("Files")
    expect(element.controls[1]?.getAttribute("aria-label")).toBe("Network")
    expect(element.controls[1]?.position).toBe(-1)
  })

  it("bounds array cardinality, enforces matching modes and rejects rings that cannot fit", () => {
    const element = progress()
    expect(() => { element.percentage = Array(17).fill(1) }).toThrow(RangeError)
    element.setAttribute("percentage", "[20,40]")
    expect(element.validationErrors).toContain("percentage")
    element.type = "multiple-circle"
    expect(element.valid).toBe(true)
    element.percentage = Array(16).fill(50)
    expect(element.validationErrors).toContain("geometry")
    element.strokeWidth = 1
    element.circleGap = 0
    expect(element.valid).toBe(true)
    expect(element.controls).toHaveLength(16)
    element.setAttribute("percentage", `[${Array(17).fill("1").join(",")}]`)
    expect(element.validationErrors).toContain("percentage")
  })

  it("validates array data, gradients and paints instead of parsing arbitrary style objects", () => {
    const element = progress()
    for (const value of ['[null]', '["2"]', '[NaN]', '[1,', "bad"]) {
      element.setAttribute("percentage", value)
      expect(element.validationErrors).toContain("percentage")
    }
    element.percentage = 50
    expect(() => { element.color = { stops: ["red"] } as never }).toThrow(RangeError)
    expect(() => { element.color = { stops: ["red", "not-color"] } }).toThrow(RangeError)
    expect(() => { element.railColor = ["red; color:blue"] }).toThrow(RangeError)
    element.setAttribute("color", '["red","blue"]')
    expect(element.validationErrors).toContain("color")
  })

  it("supports two-stop gradients and independent scalar/array rails with unique native SVG IDs", () => {
    const first = progress('<mui-progress type="multiple-circle" percentage="[30,70]"></mui-progress>')
    first.color = [{ stops: ["red", "blue"] }, "green"]
    first.railColor = ["silver", "gray"]
    const firstFill = fill(first)
    expect(firstFill.getAttribute("stroke")).toMatch(/^url\(#mui-progress-gradient-/)
    const ids = [...first.querySelectorAll("linearGradient")].map((node) => node.id)
    const gradient = first.querySelector("linearGradient")!
    expect(["x1", "y1", "x2", "y2"].map((name) => gradient.getAttribute(name))).toEqual(["100%", "100%", "0%", "0%"])
    expect(first.querySelector("[data-mui-progress-rail]")?.getAttribute("color")).toBe("silver")
    const second = document.createElement("mui-progress") as MuiProgress
    second.type = "circle"
    second.percentage = 50
    second.color = { stops: ["red", "blue"] }
    document.body.append(second)
    expect(ids).not.toContain(second.querySelector("linearGradient")!.id)
    expect(first.controls[0]?.style.getPropertyValue("--_mui-progress-fill-start")).toBe("red")
    expect(first.controls[0]?.style.getPropertyValue("--_mui-progress-fill-end")).toBe("blue")
  })

  it("keeps gradients/labels safe when native controls arrive after generated measures", async () => {
    const element = progress('<mui-progress type="multiple-circle" percentage="[30,70]" label="Step"></mui-progress>')
    const native = document.createElement("progress")
    native.setAttribute("aria-label", "Authored first")
    native.value = .5
    element.append(native)
    await Promise.resolve()
    expect(element.controls[0]).toBe(native)
    expect(element.querySelector("[data-mui-progress-native-group]")?.firstElementChild).toBe(native)
    expect(element.controls).toHaveLength(2)
    expect(native.value).toBe(30)
  })

  it("preserves authored indicator nodes and listeners outside the native progress and decorative SVG", () => {
    const element = document.createElement("mui-progress") as MuiProgress
    element.percentage = 30
    const indicator = document.createElement("strong")
    indicator.textContent = "3 of 10"
    const click = vi.fn()
    indicator.addEventListener("click", click)
    element.append(indicator)
    document.body.append(element)
    expect(element.querySelector("[data-mui-progress-slot]")?.contains(indicator)).toBe(true)
    expect(element.controls[0]?.contains(indicator)).toBe(false)
    expect(element.querySelector("[data-mui-progress-graphic]")?.contains(indicator)).toBe(false)
    element.percentage = 40
    element.showIndicator = false
    expect(element.contains(indicator)).toBe(true)
    element.showIndicator = true
    indicator.click()
    expect(click).toHaveBeenCalledOnce()
  })

  it("does not create a second progressbar inside custom indicator content", () => {
    const element = progress('<mui-progress><span><progress value="1" max="2"></progress></span></mui-progress>')
    expect(element.validationErrors).toContain("indicator")
    expect(element.querySelector<HTMLElement>("[data-mui-progress-native-group]")?.hidden).toBe(true)
  })

  it("preserves labels and author nodes when a generated visual part is removed", async () => {
    const element = progress('<mui-progress percentage="50"><progress id="native" value="1" max="4" aria-label="Native"></progress><strong>Custom</strong></mui-progress>')
    const native = element.controls[0]!
    const custom = element.querySelector("strong")!
    element.querySelector("[data-mui-progress-graphic]")!.remove()
    await Promise.resolve()
    expect(element.controls[0]).toBe(native)
    expect(element.contains(custom)).toBe(true)
    expect(native.value).toBe(50)
  })

  it("preserves templates inertly without cloning or using them as fallback indicator content", () => {
    const element = progress('<mui-progress percentage="50"><template data-mui-progress-indicator><button>Inert</button></template></mui-progress>')
    expect(element.querySelector("template")?.parentElement).toBe(element)
    expect(element.querySelector("button")).toBeNull()
    expect(element.querySelector("[data-mui-progress-text]")?.textContent).toBe("50%")
  })

  it("validates geometry and appearance inputs while preserving unrelated author styles", () => {
    const element = progress('<mui-progress style="margin: 4px" percentage="50"></mui-progress>')
    element.height = 20
    element.borderRadius = 4
    element.fillBorderRadius = "2px"
    element.indicatorTextColor = "purple"
    expect(element.style.getPropertyValue("--_mui-progress-height")).toBe("20px")
    expect(element.style.getPropertyValue("--_mui-progress-radius")).toBe("4px")
    expect(element.style.margin).toBe("4px")
    expect(() => { element.gapDegree = 361 }).toThrow(RangeError)
    expect(() => { element.viewBoxWidth = 0 }).toThrow(RangeError)
    expect(() => { element.height = NaN }).toThrow(RangeError)
    expect(() => { element.borderRadius = "bad" }).toThrow(RangeError)
    expect(() => { element.borderRadius = "auto" }).toThrow(RangeError)
    element.height = null
    expect(element.style.getPropertyValue("--_mui-progress-height")).toBe("")
  })

  it("keeps property changes silent and leaves application busy state untouched", () => {
    const element = progress('<section aria-busy="true"><mui-progress percentage="10"></mui-progress></section>')
    const notification = vi.fn()
    for (const name of ["click", "input", "change", "mui:change"]) element.addEventListener(name, notification)
    element.percentage = 100
    element.status = "success"
    element.processing = true
    expect(notification).not.toHaveBeenCalled()
    expect(document.querySelector("section")?.getAttribute("aria-busy")).toBe("true")
    expect(element.hasAttribute("aria-live")).toBe(false)
  })

  it("disconnects observation, restores authored state and reconnects without duplicate owners", async () => {
    const element = progress('<mui-progress percentage="40" color="red"><progress value="2" max="5" aria-label="Native"></progress></mui-progress>')
    const native = element.controls[0]!
    element.remove()
    expect(native.value).toBe(2)
    expect(native.max).toBe(5)
    expect(native.style.getPropertyValue("--_mui-progress-fill-start")).toBe("")
    native.value = 3
    element.percentage = 60
    await Promise.resolve()
    expect(native.value).toBe(3)
    document.body.append(element)
    expect(element.controls[0]).toBe(native)
    expect(native.value).toBe(60)
    expect(element.controls).toHaveLength(1)
  })

  it("supports pre-upgrade properties with native dimensions and no stylesheet injection", () => {
    document.body.innerHTML = '<test-late-progress><strong>Stage</strong></test-late-progress>'
    const element = document.querySelector("test-late-progress") as MuiProgress
    const content = element.querySelector("strong")
    Object.assign(element, { type: "circle", percentage: 45, label: "Upload", strokeWidth: 8, gapDegree: 60, gapOffsetDegree: 20, viewBoxWidth: 120, showIndicator: false, processing: true, color: { stops: ["red", "blue"] } })
    customElements.define("test-late-progress", class extends MuiProgress {})
    expect(element.valid).toBe(true)
    expect(element.controls[0]?.value).toBe(45)
    expect(element.controls[0]?.getAttribute("aria-label")).toBe("Upload")
    expect(element.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 120 120")
    expect(element.contains(content)).toBe(true)
    expect(element.shadowRoot).toBeNull()
    expect(document.querySelector("style")).toBeNull()
  })

  it("reports collisions and preserves the enhanced definition before the legacy aggregate", () => {
    expect(() => registerProgress()).not.toThrow()
    const define = vi.fn()
    expect(() => registerProgress({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
    registerElements(customElements)
    expect(customElements.get("mui-progress")).toBe(MuiProgress)
    expect(progress().controls).toHaveLength(1)
  })
})
