import { afterEach, describe, expect, it, vi } from "vitest"
import { MuiSpin, registerSpin } from "../src/components/spin/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => { document.body.replaceChildren(); vi.useRealTimers(); vi.restoreAllMocks() })

function spin(markup = "<mui-spin></mui-spin>"): MuiSpin {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-spin")
  if (!(element instanceof MuiSpin)) throw new Error("Spin was not upgraded")
  return element
}
function wrapped(delay = 100): MuiSpin {
  return spin(`<mui-spin delay="${delay}"><div data-mui-spin-content><button type="button">Action</button></div></mui-spin>`)
}

describe("standalone Spin", () => {
  it("provides a decorative original SVG and readable fallback without automatic live/busy roles", () => {
    const element = spin()
    expect(element.active).toBe(true)
    expect(element.dataset.muiSpinMode).toBe("standalone")
    const svg = element.querySelector("svg")!
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(svg.getAttribute("aria-hidden")).toBe("true")
    expect(svg.getAttribute("focusable")).toBe("false")
    expect(svg.getAttribute("viewBox")).toBe("0 0 200 200")
    expect(svg.querySelector("circle")?.getAttribute("r")).toBe("91")
    expect(svg.querySelector("animate,animateTransform")).toBeNull()
    expect(element.querySelector("[data-mui-spin-text]")?.textContent).toBe("Loading")
    expect(element.hasAttribute("role") || element.hasAttribute("aria-busy") || element.hasAttribute("aria-live")).toBe(false)
    expect(element.querySelector("[role],[aria-live]")).toBeNull()
  })

  it("honors the documented standalone show/delay distinction", () => {
    vi.useFakeTimers()
    const element = spin('<mui-spin show="false" delay="200"></mui-spin>')
    expect(element.show).toBe(false)
    expect(element.active).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
    element.hidden = true
    expect(element.active).toBe(false)
    expect(element.indicatorElement?.hidden).toBe(true)
    element.hidden = false
    expect(element.active).toBe(true)
  })

  it("delays only a real wrapped request and activates at the deadline", () => {
    vi.useFakeTimers()
    const element = wrapped()
    expect(element.dataset.muiSpinState).toBe("waiting")
    expect(element.active).toBe(false)
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(99)
    expect(element.active).toBe(false)
    vi.advanceTimersByTime(1)
    expect(element.active).toBe(true)
    expect(element.indicatorElement?.hidden).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("cancels brief loads and starts a fresh delay after a new show request", () => {
    vi.useFakeTimers()
    const element = wrapped()
    vi.advanceTimersByTime(50)
    element.show = false
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(200)
    expect(element.active).toBe(false)
    element.show = true
    vi.advanceTimersByTime(99)
    expect(element.active).toBe(false)
    vi.advanceTimersByTime(1)
    expect(element.active).toBe(true)
  })

  it("ignores a stale callback from an earlier request generation", () => {
    vi.useFakeTimers()
    const schedule = vi.spyOn(globalThis, "setTimeout")
    const element = wrapped()
    const stale = schedule.mock.calls.find((call) => call[1] === 100)![0] as () => void
    element.show = false
    element.show = true
    stale()
    expect(element.active).toBe(false)
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(100)
    expect(element.active).toBe(true)
  })

  it("does not restart the delay for repeated show assignments or unrelated visual/text changes", () => {
    vi.useFakeTimers()
    const element = wrapped()
    vi.advanceTimersByTime(40)
    element.show = true
    element.description = "Still loading"
    element.size = "large"
    element.stroke = "red"
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(60)
    expect(element.active).toBe(true)
  })

  it("restarts a changed pending delay but does not flash an already active indicator", () => {
    vi.useFakeTimers()
    const element = wrapped()
    vi.advanceTimersByTime(50)
    element.delay = 200
    vi.advanceTimersByTime(199)
    expect(element.active).toBe(false)
    vi.advanceTimersByTime(1)
    expect(element.active).toBe(true)
    element.delay = 300
    expect(element.active).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("activates immediately when pending delay becomes zero", () => {
    vi.useFakeTimers()
    const element = wrapped()
    element.delay = 0
    expect(element.active).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("cancels native-hidden requests and restarts cleanly after revealing the host", () => {
    vi.useFakeTimers()
    const element = wrapped()
    element.hidden = true
    expect(vi.getTimerCount()).toBe(0)
    expect(element.hasAttribute("data-mui-spin-active")).toBe(false)
    element.hidden = false
    expect(element.active).toBe(false)
    vi.advanceTimersByTime(100)
    expect(element.active).toBe(true)
  })

  it("disposes timers/observation and restarts rather than resuming stale delay on reconnect", () => {
    vi.useFakeTimers()
    const element = wrapped()
    const content = element.contentElement
    const indicator = element.indicatorElement
    vi.advanceTimersByTime(70)
    element.remove()
    expect(vi.getTimerCount()).toBe(0)
    expect(element.active).toBe(false)
    expect(element.hasAttribute("data-mui-spin-active")).toBe(false)
    document.body.append(element)
    expect(element.contentElement).toBe(content)
    expect(element.indicatorElement).toBe(indicator)
    vi.advanceTimersByTime(99)
    expect(element.active).toBe(false)
    vi.advanceTimersByTime(1)
    expect(element.active).toBe(true)
  })

  it("cancels delays on mode changes and keeps standalone display independent of show", async () => {
    vi.useFakeTimers()
    const element = wrapped()
    element.show = false
    element.contentElement!.remove()
    await Promise.resolve()
    expect(element.dataset.muiSpinMode).toBe("standalone")
    expect(element.active).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
    const button = document.createElement("button")
    button.textContent = "Late target"
    element.append(button)
    await Promise.resolve()
    expect(element.dataset.muiSpinMode).toBe("wrapped")
    expect(element.active).toBe(false)
  })

  it("preserves native targets, input state, classes and all author-owned busy/blocking attributes", () => {
    const element = spin('<mui-spin show="false"><div data-mui-spin-content class="panel" aria-busy="false" aria-hidden="false" inert><input value="Initial"><button type="button">Action</button></div></mui-spin>')
    const content = element.contentElement!
    const input = content.querySelector("input")!
    input.value = "Edited"
    element.show = true
    expect(element.active).toBe(true)
    element.show = false
    element.remove()
    expect(content.getAttribute("aria-busy")).toBe("false")
    expect(content.getAttribute("aria-hidden")).toBe("false")
    expect(content.hasAttribute("inert")).toBe(true)
    expect(content.className).toBe("panel")
    expect(input.value).toBe("Edited")
  })

  it("leaves active wrapped controls usable with native form semantics and no focus trap", () => {
    const element = spin('<form><mui-spin><div data-mui-spin-content><button type="submit">Save</button><button type="reset">Reset</button><input value="Initial"></div></mui-spin></form>')
    const content = element.contentElement!
    const submit = vi.fn((event: Event) => event.preventDefault())
    document.querySelector("form")!.addEventListener("submit", submit)
    const button = content.querySelector<HTMLButtonElement>('[type="submit"]')!
    button.focus()
    button.click()
    expect(submit).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(button)
    expect(content.hasAttribute("inert") || content.hasAttribute("aria-hidden") || content.hasAttribute("aria-busy")).toBe(false)
    const input = content.querySelector("input")!
    input.value = "Edited"
    content.querySelector<HTMLButtonElement>('[type="reset"]')!.click()
    expect(input.value).toBe("Initial")
  })

  it("adopts raw targets and late explicit content without replacing nodes/listeners", async () => {
    const element = spin('<mui-spin show="false"><button type="button">Target</button></mui-spin>')
    const button = element.querySelector("button")!
    const click = vi.fn()
    button.addEventListener("click", click)
    const content = document.createElement("section")
    content.dataset.muiSpinContent = ""
    content.textContent = "New"
    element.prepend(content)
    await Promise.resolve()
    expect(element.contentElement).toBe(content)
    expect(content.contains(button)).toBe(true)
    button.click()
    expect(click).toHaveBeenCalledOnce()
    expect(element.querySelectorAll("[data-mui-spin-content]")).toHaveLength(1)
  })

  it("uses description prop precedence without destroying authored description content or ARIA", () => {
    const element = spin('<mui-spin description="Override"><span data-mui-spin-description role="status" id="status"><strong>Authored</strong></span></mui-spin>')
    const description = element.querySelector<HTMLElement>("[data-mui-spin-description]")!
    const text = description.querySelector("strong")
    expect(element.querySelector("[data-mui-spin-text]")?.textContent).toBe("Override")
    expect(description.parentElement?.hidden).toBe(true)
    expect(description.hidden).toBe(false)
    element.description = null
    expect(description.parentElement?.hidden).toBe(false)
    expect(description.querySelector("strong")).toBe(text)
    expect(description.getAttribute("role")).toBe("status")
    expect(description.id).toBe("status")
  })

  it("keeps labels safe and avoids duplicate fallback text when a host name is explicitly supplied", () => {
    const element = spin('<mui-spin role="status" aria-label="Uploading"></mui-spin>')
    expect(element.querySelector<HTMLElement>("[data-mui-spin-text]")?.hidden).toBe(true)
    expect(element.getAttribute("role")).toBe("status")
    expect(element.querySelectorAll("[role]")).toHaveLength(0)
    element.removeAttribute("aria-label")
    element.label = "Retrieving"
    expect(element.querySelector("[data-mui-spin-text]")?.textContent).toBe("Retrieving")
    element.description = "<img src=x>"
    expect(element.querySelector("[data-mui-spin-text]")?.textContent).toBe("<img src=x>")
    expect(element.querySelector("img")).toBeNull()
    element.description = " "
    expect(element.querySelector("[data-mui-spin-text]")?.textContent).toBe("Retrieving")
  })

  it("preserves custom SVG/icon nodes and never adds a second default icon", async () => {
    const element = spin('<mui-spin><svg data-mui-spin-icon role="img" aria-label="Custom symbol" viewBox="0 0 24 24"><circle r="8" cx="12" cy="12"></circle></svg></mui-spin>')
    const svg = element.querySelector("svg")!
    const circle = svg.querySelector("circle")
    expect(element.querySelector("[data-mui-spin-default]")).toBeNull()
    element.rotate = false
    element.size = 48
    expect(element.querySelector("svg")).toBe(svg)
    expect(svg.querySelector("circle")).toBe(circle)
    expect(svg.getAttribute("aria-label")).toBe("Custom symbol")
    svg.remove()
    await Promise.resolve()
    expect(element.querySelector("[data-mui-spin-default]")).not.toBeNull()
  })

  it("applies original SVG radius/scale/stroke geometry and preset stroke defaults", () => {
    const element = spin()
    element.size = "small"
    expect(element.strokeWidth).toBe(20)
    element.size = "large"
    expect(element.strokeWidth).toBe(16)
    element.size = 48
    expect(element.strokeWidth).toBe(18)
    element.strokeWidth = 10
    element.radius = 80
    element.scale = 2
    element.stroke = "red"
    const svg = element.querySelector("svg")!
    const circle = svg.querySelector("circle")!
    expect(svg.getAttribute("viewBox")).toBe("0 0 80 80")
    expect(svg.getAttribute("color")).toBe("red")
    expect(svg.getAttribute("stroke")).toBe("currentColor")
    expect(circle.getAttribute("cx")).toBe("40")
    expect(circle.getAttribute("r")).toBe("75")
    expect(circle.getAttribute("stroke-width")).toBe("10")
    expect(Number(circle.getAttribute("pathLength"))).toBeCloseTo(75 / 80 * Math.PI * 200)
    expect(circle.getAttribute("stroke-dasharray")).toBe("567")
    expect(circle.getAttribute("stroke-dashoffset")).toBe("142")
    expect(circle.hasAttribute("data-mui-spin-arc")).toBe(true)
    expect(element.style.getPropertyValue("--_mui-spin-size")).toBe("48px")
  })

  it("normalizes CSS arc motion without SMIL, style injection or replacing the circle", () => {
    const element = spin()
    const circle = element.querySelector("circle")!
    expect(Number(circle.getAttribute("pathLength"))).toBeCloseTo(.91 * Math.PI * 200)
    element.strokeWidth = 0
    expect(element.querySelector("circle")).toBe(circle)
    expect(Number(circle.getAttribute("pathLength"))).toBeCloseTo(Math.PI * 200)
    element.radius = 80
    element.strokeWidth = 10
    element.scale = 2
    expect(element.querySelector("circle")).toBe(circle)
    expect(Number(circle.getAttribute("pathLength"))).toBeCloseTo(75 / 80 * Math.PI * 200)
    expect(element.querySelector("animate,animateTransform,style,[style]")).toBeNull()
  })

  it("rejects invalid numeric/color property assignments before changing their attributes", () => {
    const element = spin('<mui-spin size="24" delay="10" stroke="red"></mui-spin>')
    for (const value of [-1, Infinity, NaN, "24px", "tiny"]) {
      expect(() => { element.size = value }).toThrow(RangeError)
      expect(element.getAttribute("size")).toBe("24")
    }
    for (const value of [-1, 1.5, Infinity, 2_147_483_648]) expect(() => { element.delay = value }).toThrow(RangeError)
    expect(element.delay).toBe(10)
    expect(() => { element.radius = 0 }).toThrow(RangeError)
    expect(() => { element.scale = -1 }).toThrow(RangeError)
    expect(() => { element.strokeWidth = -1 }).toThrow(RangeError)
    expect(() => { element.stroke = "red; position:fixed" }).toThrow(RangeError)
    expect(element.stroke).toBe("red")
  })

  it("diagnoses invalid attributes/combined geometry and cancels pending work instead of faking success", () => {
    vi.useFakeTimers()
    const element = wrapped()
    element.setAttribute("size", "bad")
    element.setAttribute("delay", "-2")
    element.setAttribute("radius", "5")
    element.setAttribute("stroke", "not-a-color")
    expect(element.valid).toBe(false)
    expect(element.validationErrors).toEqual(["size", "delay", "stroke-width", "stroke"])
    expect(element.dataset.muiSpinState).toBe("invalid")
    expect(element.active).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    element.size = "medium"
    element.delay = 10
    element.strokeWidth = 2
    element.stroke = null
    expect(element.valid).toBe(true)
    vi.advanceTimersByTime(10)
    expect(element.active).toBe(true)
  })

  it("validates derived viewBox geometry and permits explicit zero stroke/size", () => {
    const element = spin()
    element.radius = 1e308
    expect(element.validationErrors).toContain("scale")
    expect(element.active).toBe(false)
    element.radius = null
    element.strokeWidth = 0
    element.size = 0
    expect(element.valid).toBe(true)
    expect(element.querySelector("circle")?.getAttribute("stroke-width")).toBe("0")
  })

  it("preserves templates inertly and never treats markers on them as rendered regions", () => {
    const element = spin('<mui-spin><template data-mui-spin-content><button>Inert</button></template><template data-mui-spin-icon><svg></svg></template><template data-mui-spin-description>Inert text</template></mui-spin>')
    expect(element.querySelectorAll(":scope > template")).toHaveLength(3)
    expect(element.querySelector("button")).toBeNull()
    expect(element.dataset.muiSpinMode).toBe("standalone")
    expect(element.querySelector("[data-mui-spin-text]")?.textContent).toBe("Loading")
  })

  it("does not resurrect removed authored content or stale custom descriptions on whole replacement", async () => {
    const element = spin('<mui-spin show="false"><div data-mui-spin-content><strong>Old</strong></div><span data-mui-spin-description>Old description</span></mui-spin>')
    const old = element.querySelector("strong")!
    element.innerHTML = '<button type="button">New</button>'
    await Promise.resolve()
    expect(element.contains(old)).toBe(false)
    expect(element.textContent).not.toContain("Old")
    expect(element.querySelectorAll("[data-mui-spin-indicator]")).toHaveLength(1)
    expect(element.querySelector("button")?.textContent).toBe("New")
  })

  it("reclassifies changed region markers without deleting the original node", async () => {
    const element = spin('<mui-spin show="false"><span data-mui-spin-description>Description</span></mui-spin>')
    const description = element.querySelector<HTMLElement>("[data-mui-spin-description]")!
    description.removeAttribute("data-mui-spin-description")
    await Promise.resolve()
    expect(element.contentElement?.contains(description)).toBe(true)
    expect(element.active).toBe(false)
  })

  it("starts only the final pre-upgrade timing configuration", () => {
    vi.useFakeTimers()
    document.body.innerHTML = "<test-late-spin><button type='button'>Target</button></test-late-spin>"
    const element = document.querySelector("test-late-spin") as MuiSpin
    const target = element.querySelector("button")
    Object.assign(element, { show: true, delay: 100, size: 48, strokeWidth: 10, radius: 80, scale: 1, stroke: "blue", description: "Loading data", label: "Fetch", rotate: false })
    customElements.define("test-late-spin", class extends MuiSpin {})
    expect(element.active).toBe(false)
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(100)
    expect(element.active).toBe(true)
    expect(element.querySelector("button")).toBe(target)
    expect(element.description).toBe("Loading data")
    expect(element.rotate).toBe(false)
  })

  it("keeps assignments silent and uses no style injection or shadow root", () => {
    const element = spin()
    const event = vi.fn()
    for (const name of ["click", "input", "change", "mui:change"]) element.addEventListener(name, event)
    element.show = false
    element.description = "Working"
    element.strokeWidth = 12
    expect(event).not.toHaveBeenCalled()
    expect(element.hasAttribute("style")).toBe(false)
    expect(element.querySelector("[style],style")).toBeNull()
    expect(element.shadowRoot).toBeNull()
  })

  it("clears only its numeric size variable and preserves unrelated author styling", () => {
    const element = spin('<mui-spin size="48" style="color: red; --mui-spin-size: 3rem"></mui-spin>')
    element.size = "small"
    expect(element.style.getPropertyValue("--_mui-spin-size")).toBe("")
    expect(element.style.getPropertyValue("--mui-spin-size")).toBe("3rem")
    expect(element.style.color).toBe("red")
  })

  it("reports explicit collisions and preserves enhanced definitions before the aggregate", () => {
    expect(() => registerSpin()).not.toThrow()
    const define = vi.fn()
    expect(() => registerSpin({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
    registerElements(customElements)
    expect(customElements.get("mui-spin")).toBe(MuiSpin)
    expect(spin().active).toBe(true)
  })
})
