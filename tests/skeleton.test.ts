import { afterEach, describe, expect, it, vi } from "vitest"
import { MuiSkeleton, registerSkeleton } from "../src/components/skeleton/index.js"
import { registerElements } from "../src/components/elements.js"

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

function skeleton(markup = "<mui-skeleton></mui-skeleton>"): MuiSkeleton {
  document.body.innerHTML = markup
  const element = document.querySelector("mui-skeleton")
  if (!(element instanceof MuiSkeleton)) throw new Error("Skeleton was not upgraded")
  return element
}
function group(element: MuiSkeleton): HTMLElement {
  return element.querySelector(":scope > [data-mui-skeleton-group]")!
}
function bars(element: MuiSkeleton): Element[] {
  return [...group(element).querySelectorAll(":scope > [data-mui-skeleton-item]")]
}

describe("standalone Skeleton", () => {
  it("creates one decorative inert native placeholder without making the host a loading controller", () => {
    const element = skeleton()
    expect(element.repeat).toBe(1)
    expect(element.valid).toBe(true)
    expect(bars(element)).toHaveLength(1)
    expect(bars(element)[0]?.localName).toBe("span")
    expect(group(element).getAttribute("aria-hidden")).toBe("true")
    expect(group(element).hasAttribute("inert")).toBe(true)
    expect(element.hasAttribute("aria-hidden") || element.hasAttribute("aria-busy") || element.hasAttribute("role")).toBe(false)
    expect(element.querySelector("button,[tabindex],[aria-live]")).toBeNull()
  })

  it("normalizes bare finite dimensions to pixels and retains unit-bearing geometry", () => {
    const element = skeleton('<mui-skeleton width="120" height="20px"></mui-skeleton>')
    expect(element.width).toBe("120")
    expect(element.style.getPropertyValue("--_mui-skeleton-width")).toBe("120px")
    expect(element.style.getPropertyValue("--_mui-skeleton-height")).toBe("20px")
    element.width = "50%"
    element.height = 0
    expect(element.style.getPropertyValue("--_mui-skeleton-width")).toBe("50%")
    expect(element.style.getPropertyValue("--_mui-skeleton-height")).toBe("0px")
    element.width = "2e2"
    expect(element.style.getPropertyValue("--_mui-skeleton-width")).toBe("200px")
  })

  it("accepts native CSS lengths, calculations, variables and auto without a stylesheet renderer", () => {
    const element = skeleton()
    for (const width of ["2rem", "10vw", "calc(100% - 8px)", "var(--example-width)", "auto"]) {
      element.width = width
      expect(element.valid).toBe(true)
      expect(element.style.getPropertyValue("--_mui-skeleton-width")).not.toBe("")
    }
    expect(document.querySelector("style")).toBeNull()
  })

  it("rejects invalid dimensions before mutating a valid property assignment", () => {
    const element = skeleton('<mui-skeleton width="80px" height="20px"></mui-skeleton>')
    for (const width of [-1, NaN, Infinity, "", "-4px", "bogus", "10px; color:red", "inherit", "unset"]) {
      expect(() => { element.width = width }).toThrow(RangeError)
      expect(element.width).toBe("80px")
      expect(element.valid).toBe(true)
    }
    expect(() => { element.height = -2 }).toThrow(RangeError)
    expect(element.height).toBe("20px")
  })

  it("exposes invalid HTML attributes and hides placeholders rather than silently guessing", () => {
    const element = skeleton('<mui-skeleton width="wrong" height="-10px" repeat="200" size="tiny">Owned content</mui-skeleton>')
    expect(element.valid).toBe(false)
    expect(element.validationErrors).toEqual(["width", "height", "repeat", "size"])
    expect(element.dataset.muiSkeletonInvalid).toBe("width height repeat size")
    expect(group(element).hidden).toBe(true)
    expect(bars(element)).toHaveLength(0)
    expect(element.textContent).toContain("Owned content")
    expect(element.getAttribute("width")).toBe("wrong")
    expect(element.repeat).toBeUndefined()
  })

  it("prepares relative height sizing with a bounded count and clears it for zero or invalid input", () => {
    const element = skeleton('<mui-skeleton height="50%" repeat="3"></mui-skeleton>')
    expect(element.hasAttribute("data-mui-skeleton-relative-height")).toBe(true)
    expect(element.style.getPropertyValue("--_mui-skeleton-repeat")).toBe("3")
    element.width = 80
    expect(element.style.getPropertyValue("--_mui-skeleton-repeat")).toBe("3")
    element.repeat = 0
    expect(element.hasAttribute("data-mui-skeleton-relative-height")).toBe(false)
    expect(element.style.getPropertyValue("--_mui-skeleton-repeat")).toBe("")
    element.repeat = 2
    element.setAttribute("height", "bad")
    expect(element.hasAttribute("data-mui-skeleton-relative-height")).toBe(false)
    expect(group(element).hidden).toBe(true)
  })

  it("recovers from declarative errors without changing application loading state", () => {
    const element = skeleton('<section aria-busy="true"><mui-skeleton width="bad" repeat="101"></mui-skeleton><p>Loading results</p></section>')
    element.width = 80
    element.repeat = 2
    expect(element.valid).toBe(true)
    expect(element.hasAttribute("data-mui-skeleton-invalid")).toBe(false)
    expect(group(element).hidden).toBe(false)
    expect(bars(element)).toHaveLength(2)
    expect(document.querySelector("section")?.getAttribute("aria-busy")).toBe("true")
  })

  it("bounds repeat to whole decimal integers from zero to one hundred", () => {
    const element = skeleton()
    element.repeat = "100"
    expect(bars(element)).toHaveLength(100)
    for (const repeat of [101, -1, 1.5, Infinity, NaN, "", "1e2", "2.0", "many"]) {
      expect(() => { element.repeat = repeat }).toThrow(RangeError)
      expect(element.repeat).toBe(100)
      expect(bars(element)).toHaveLength(100)
    }
    element.setAttribute("repeat", "1000000000000000000000000")
    expect(element.valid).toBe(false)
    expect(group(element).hidden).toBe(true)
    expect(bars(element).length).toBeLessThanOrEqual(100)
  })

  it("makes zero repeat explicit and resets to one only when the attribute is removed", () => {
    const element = skeleton('<mui-skeleton repeat="3"></mui-skeleton>')
    element.repeat = 0
    expect(element.valid).toBe(true)
    expect(bars(element)).toHaveLength(0)
    expect(group(element).hidden).toBe(true)
    element.repeat = null
    expect(element.repeat).toBe(1)
    expect(bars(element)).toHaveLength(1)
    expect(group(element).hidden).toBe(false)
  })

  it("preserves generated bar identity while growing and shrinking valid repetition", () => {
    const element = skeleton('<mui-skeleton repeat="2"></mui-skeleton>')
    const first = bars(element)[0]
    const second = bars(element)[1]
    element.repeat = 4
    expect(bars(element)[0]).toBe(first)
    expect(bars(element)[1]).toBe(second)
    element.repeat = 1
    expect(bars(element)[0]).toBe(first)
  })

  it("keeps author nodes and listeners outside the decorative group", () => {
    const element = document.createElement("mui-skeleton") as MuiSkeleton
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Application control"
    const listener = vi.fn()
    button.addEventListener("click", listener)
    const text = document.createTextNode("Authored note")
    element.append(text, button)
    document.body.append(element)
    expect(text.parentNode).toBe(element)
    expect(button.parentElement).toBe(element)
    expect(group(element).contains(button)).toBe(false)
    expect(element.hasAttribute("aria-hidden") || element.hasAttribute("inert")).toBe(false)
    element.repeat = 3
    button.click()
    expect(listener).toHaveBeenCalledOnce()
    expect(button.parentElement).toBe(element)
  })

  it("preserves explicit host ARIA without inventing busy state or a live announcer", () => {
    const element = skeleton('<mui-skeleton role="status" aria-label="Chart placeholder" aria-hidden="false" aria-live="off"></mui-skeleton>')
    element.width = 50
    element.animated = false
    expect(element.getAttribute("role")).toBe("status")
    expect(element.getAttribute("aria-label")).toBe("Chart placeholder")
    expect(element.getAttribute("aria-hidden")).toBe("false")
    expect(element.getAttribute("aria-live")).toBe("off")
    expect(element.hasAttribute("aria-busy")).toBe(false)
    expect(group(element).getAttribute("aria-hidden")).toBe("true")
  })

  it("keeps controls inserted into the owned group inert without deleting author nodes", async () => {
    const element = skeleton()
    const button = document.createElement("button")
    button.textContent = "Not an active loading control"
    group(element).append(button)
    await Promise.resolve()
    element.repeat = 0
    expect(group(element).contains(button)).toBe(true)
    expect(group(element).hasAttribute("inert")).toBe(true)
    expect(group(element).getAttribute("aria-hidden")).toBe("true")
    expect(bars(element)).toHaveLength(0)
  })

  it("leaves native templates inert and does not clone their controls", async () => {
    const element = skeleton('<mui-skeleton repeat="3"><template data-mui-skeleton-item><button>Inert</button></template></mui-skeleton>')
    const template = element.querySelector("template")
    expect(template?.parentElement).toBe(element)
    expect(element.querySelector("button")).toBeNull()
    element.repeat = 4
    await Promise.resolve()
    expect(element.querySelector("template")).toBe(template)
    expect(element.querySelector("button")).toBeNull()
    expect(bars(element)).toHaveLength(4)
  })

  it("preserves unrelated author styles and releases only private dimension overrides", () => {
    const element = skeleton('<mui-skeleton width="60px" height="20px" style="color: red; --mui-skeleton-width: 75%; --mui-skeleton-height: 2em"></mui-skeleton>')
    element.width = null
    element.height = undefined
    expect(element.style.getPropertyValue("--_mui-skeleton-width")).toBe("")
    expect(element.style.getPropertyValue("--_mui-skeleton-height")).toBe("")
    expect(element.style.getPropertyValue("--mui-skeleton-width")).toBe("75%")
    expect(element.style.getPropertyValue("--mui-skeleton-height")).toBe("2em")
    expect(element.style.color).toBe("red")
  })

  it("needs no inline styles when dimensions are supplied only by external CSS or presets", () => {
    const element = skeleton('<mui-skeleton size="small" repeat="2"></mui-skeleton>')
    expect(element.hasAttribute("style")).toBe(false)
    expect(element.querySelector("[style]")).toBeNull()
    expect(element.shadowRoot).toBeNull()
  })

  it("validates the size enum and reflects shape/animation flags independently", () => {
    const element = skeleton()
    expect(element.size).toBeUndefined()
    expect(element.animated && element.sharp).toBe(true)
    for (const size of ["small", "medium", "large"]) {
      element.size = size
      expect(element.getAttribute("size")).toBe(size)
    }
    expect(() => { element.size = "tiny" }).toThrow(RangeError)
    expect(element.size).toBe("large")
    for (const name of ["text", "round", "circle"] as const) {
      element[name] = true
      expect(element.hasAttribute(name)).toBe(true)
      element[name] = false
    }
    element.animated = false
    element.sharp = false
    expect(element.getAttribute("animated")).toBe("false")
    expect(element.getAttribute("sharp")).toBe("false")
    element.size = null
    expect(element.size).toBeUndefined()
  })

  it("keeps assignment silent and does not attach keyboard or click behavior", () => {
    const element = skeleton()
    const events = vi.fn()
    for (const name of ["click", "change", "input", "mui:change"]) element.addEventListener(name, events)
    element.repeat = 2
    element.width = 40
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
    element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(events).not.toHaveBeenCalled()
  })

  it("cleans up observation on disconnect and reuses bars on reconnect", async () => {
    const element = skeleton('<mui-skeleton repeat="2" width="40px"></mui-skeleton>')
    const previous = bars(element)
    element.remove()
    element.repeat = 3
    element.width = 50
    await Promise.resolve()
    expect(bars(element)).toEqual(previous)
    expect(element.style.getPropertyValue("--_mui-skeleton-width")).toBe("40px")
    document.body.append(element)
    expect(bars(element)[0]).toBe(previous[0])
    expect(bars(element)).toHaveLength(3)
    expect(element.style.getPropertyValue("--_mui-skeleton-width")).toBe("50px")
  })

  it("adopts late author content and regenerates only its own removed group", async () => {
    const element = skeleton()
    const groupBefore = group(element)
    const content = document.createElement("p")
    content.textContent = "Native content"
    element.append(content)
    await Promise.resolve()
    expect(content.parentElement).toBe(element)
    expect(group(element)).toBe(groupBefore)
    element.replaceChildren(content)
    await Promise.resolve()
    expect(group(element)).not.toBe(groupBefore)
    expect(content.parentElement).toBe(element)
    expect(bars(element)).toHaveLength(1)
  })

  it("reconciles removed generated bars without recreating surviving rows", async () => {
    const element = skeleton('<mui-skeleton repeat="2"></mui-skeleton>')
    const first = bars(element)[0]
    bars(element)[1]!.remove()
    await Promise.resolve()
    expect(bars(element)).toHaveLength(2)
    expect(bars(element)[0]).toBe(first)
  })

  it("handles pre-definition properties with bounded geometry and no replacement of author nodes", () => {
    document.body.innerHTML = "<test-late-skeleton><span>Caption</span></test-late-skeleton>"
    const element = document.querySelector("test-late-skeleton") as MuiSkeleton
    const caption = element.querySelector("span")
    Object.assign(element, { width: 80, height: "2em", repeat: "3", size: "small", text: true, round: true, circle: false, animated: false, sharp: false })
    customElements.define("test-late-skeleton", class extends MuiSkeleton {})
    expect(element.valid).toBe(true)
    expect(bars(element)).toHaveLength(3)
    expect(element.style.getPropertyValue("--_mui-skeleton-width")).toBe("80px")
    expect(element.style.getPropertyValue("--_mui-skeleton-height")).toBe("2em")
    expect(element.text && element.round).toBe(true)
    expect(element.animated || element.sharp).toBe(false)
    expect(element.contains(caption)).toBe(true)
  })

  it("reports registration conflicts and preserves enhanced definitions before the aggregate", () => {
    expect(() => registerSkeleton()).not.toThrow()
    const define = vi.fn()
    expect(() => registerSkeleton({ get: () => class extends HTMLElement {}, define })).toThrow("before the legacy MarkupUI bundle")
    expect(define).not.toHaveBeenCalled()
    registerElements(customElements)
    expect(customElements.get("mui-skeleton")).toBe(MuiSkeleton)
    expect(bars(skeleton())).toHaveLength(1)
  })
})
