import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Ellipsis, MEllipsis, registerEllipsis } from "../src/components/ellipsis/index.js"
import * as ellipsisApi from "../src/components/ellipsis/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "ellipsis", "ellipsis.css"), "utf8")
let style: HTMLStyleElement | undefined
function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}
function ellipsis(markup = "<m-ellipsis></m-ellipsis>"): Ellipsis {
  document.body.innerHTML = markup
  const element = document.querySelector("m-ellipsis")
  if (!(element instanceof Ellipsis)) throw new Error("Ellipsis was not upgraded")
  return element
}
afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("canonical Ellipsis ViewElement", () => {
  it("exports canonical own-tag ViewElement and registers m-ellipsis", () => {
    expect(Object.keys(ellipsisApi).sort()).toEqual(["Ellipsis", "MEllipsis", "expandTriggers", "registerEllipsis"])
    expect(Object.hasOwn(Ellipsis, "tag")).toBe(true)
    expect(Ellipsis.tag).toBe("m-ellipsis")
    expect(ViewElement.prototype.isPrototypeOf(Ellipsis.prototype)).toBe(true)
    expect(customElements.get("m-ellipsis")).toBe(Ellipsis)
    expect(MEllipsis).toBe(Ellipsis)
    expect(Ellipsis.observedAttributes).toEqual(["line-clamp", "expand-trigger", "tooltip", "expanded"])
    const define = vi.fn()
    expect(() => registerEllipsis({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerEllipsis()).not.toThrow()
  })

  it("has explicit property defaults and validates values before mutating attributes", () => {
    const element = ellipsis()
    expect(element.lineClamp).toBeNull()
    expect(element.expandTrigger).toBeNull()
    expect(element.tooltip).toBe(false)
    expect(element.expanded).toBe(false)

    // Invalid lineClamp values
    for (const invalid of [0, -1, 1.5, NaN, Infinity]) {
      expect(() => { element.lineClamp = invalid }).toThrow(RangeError)
    }

    // Valid lineClamp values
    element.lineClamp = 3
    expect(element.getAttribute("line-clamp")).toBe("3")
    expect(element.style.getPropertyValue("--m-ellipsis-lines")).toBe("3")
    element.lineClamp = null
    expect(element.hasAttribute("line-clamp")).toBe(false)
    expect(element.style.getPropertyValue("--m-ellipsis-lines")).toBe("")

    // Invalid expandTrigger
    expect(() => { Reflect.set(element, "expandTrigger", "hover") }).toThrow(RangeError)

    // Valid expandTrigger
    element.expandTrigger = "click"
    expect(element.getAttribute("expand-trigger")).toBe("click")
    element.expandTrigger = null
    expect(element.hasAttribute("expand-trigger")).toBe(false)

    // Tooltip boolean attribute
    element.tooltip = true
    expect(element.hasAttribute("tooltip")).toBe(true)
    element.tooltip = false
    expect(element.hasAttribute("tooltip")).toBe(false)

    // Expanded boolean attribute
    element.expanded = true
    expect(element.hasAttribute("expanded")).toBe(true)
    element.expanded = false
    expect(element.hasAttribute("expanded")).toBe(false)
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-ellipsis") as Ellipsis
    element.textContent = "Pre-upgrade text content"
    Object.defineProperty(element, "lineClamp", { configurable: true, value: 2 })
    Object.defineProperty(element, "expandTrigger", { configurable: true, value: "click" })
    Object.defineProperty(element, "tooltip", { configurable: true, value: true })
    document.body.append(element)

    expect(element.lineClamp).toBe(2)
    expect(element.expandTrigger).toBe("click")
    expect(element.tooltip).toBe(true)
    expect(element.getAttribute("line-clamp")).toBe("2")
    expect(element.getAttribute("expand-trigger")).toBe("click")
    expect(element.hasAttribute("tooltip")).toBe(true)
    expect(element.title).toBe("Pre-upgrade text content")
  })
})

describe("Ellipsis behaviors and triggers", () => {
  it("toggles expanded on click when expandTrigger is click", () => {
    const element = ellipsis('<m-ellipsis expand-trigger="click">Clickable long text</m-ellipsis>')
    expect(element.expanded).toBe(false)
    expect(element.getAttribute("aria-expanded")).toBe("false")
    expect(element.getAttribute("role")).toBe("button")
    expect(element.getAttribute("tabindex")).toBe("0")

    element.click()
    expect(element.expanded).toBe(true)
    expect(element.getAttribute("aria-expanded")).toBe("true")

    element.click()
    expect(element.expanded).toBe(false)
    expect(element.getAttribute("aria-expanded")).toBe("false")
  })

  it("does not toggle on click if expandTrigger is null", () => {
    const element = ellipsis("<m-ellipsis>Non-clickable long text</m-ellipsis>")
    expect(element.expanded).toBe(false)
    element.click()
    expect(element.expanded).toBe(false)
    expect(element.hasAttribute("aria-expanded")).toBe(false)
  })

  it("does not toggle expanded when clicking an interactive descendant", () => {
    const element = ellipsis('<m-ellipsis expand-trigger="click">Text with <button type="button" id="btn">Action</button></m-ellipsis>')
    const button = element.querySelector("button")!
    expect(element.expanded).toBe(false)
    button.click()
    expect(element.expanded).toBe(false)
  })

  it("toggles expanded via keyboard Enter and Space when focused", () => {
    const element = ellipsis('<m-ellipsis expand-trigger="click">Keyboard text</m-ellipsis>')
    expect(element.expanded).toBe(false)

    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    expect(element.expanded).toBe(true)

    element.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }))
    expect(element.expanded).toBe(false)
  })

  it("sets and manages title when tooltip is enabled", () => {
    const element = ellipsis("<m-ellipsis>Sample sentence</m-ellipsis>")
    expect(element.hasAttribute("title")).toBe(false)

    element.tooltip = true
    expect(element.title).toBe("Sample sentence")

    element.tooltip = false
    expect(element.hasAttribute("title")).toBe(false)
  })

  it("preserves original text, native emphasis, and structure", () => {
    const element = ellipsis('<m-ellipsis line-clamp="2">Original <strong>emphasized</strong> text</m-ellipsis>')
    const strong = element.querySelector("strong")!
    expect(strong.textContent).toBe("emphasized")
    expect(element.textContent).toBe("Original emphasized text")
    expect(element.dataset.mEllipsis).toBe("")
  })

  it("works seamlessly inside details disclosure", () => {
    document.body.innerHTML = '<details class="m-ellipsis-disclosure"><summary><m-ellipsis line-clamp="2">Disclosure text</m-ellipsis><span class="m-ellipsis-hint">Hint</span></summary></details>'
    const details = document.querySelector("details")!
    const summary = document.querySelector("summary")!
    const element = summary.querySelector("m-ellipsis")!
    install()

    expect(details.open).toBe(false)
    summary.click()
    expect(details.open).toBe(true)
    summary.click()
    expect(details.open).toBe(false)
    expect(element.textContent).toBe("Disclosure text")
  })
})

describe("Ellipsis CSS stylesheet", () => {
  it("includes support guards, line-clamp, and print styles", () => {
    expect(css).toContain("@supports selector(:has(*))")
    expect(css).toContain("@supports (-webkit-line-clamp: 2) or (line-clamp: 2)")
    expect(css).toContain("--m-ellipsis-lines, 2")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain("min-inline-size: 0")
    expect(css).toContain("m-ellipsis")
    expect(css).toContain(".m-ellipsis")
    expect(css).toContain("m-ellipsis[expand-trigger=\"click\"]")
    expect(css).toContain("m-ellipsis[expanded]")
    expect(css).toContain("@media print")
  })
})
