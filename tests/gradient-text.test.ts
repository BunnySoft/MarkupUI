import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { GradientText, MGradientText, registerGradientText } from "../src/components/gradient-text/index.js"
import * as gradientTextApi from "../src/components/gradient-text/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "gradient-text", "gradient-text.css"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren(); vi.restoreAllMocks() })

describe("CSS-only Gradient Text", () => {
  it("exports gradient text CSS", () => {
    expect(pkg.exports["./gradient-text/style.css"]).toBe("./dist/markup-ui-gradient-text.css")
    expect(pkg.dependencies).toEqual({})
  })

  it("preserves native semantic elements, text and inline content", () => {
    document.body.innerHTML = '<h1 class="m-gradient-text" lang="en">Heading <strong>Strong</strong> <em>Emphasis</em></h1><p><span class="m-gradient-text">Original text</span></p>'
    const heading = document.querySelector("h1")!
    const before = heading.outerHTML
    const strong = heading.querySelector("strong")
    install()
    expect(heading.outerHTML).toBe(before)
    expect(heading.querySelector("strong")).toBe(strong)
    expect(document.querySelector("[role],[aria-hidden],[aria-live],[aria-level]")).toBeNull()
    expect(heading.lang).toBe("en")
  })

  it("keeps a foreground fallback outside feature detection and a clipped solid underpaint inside it", () => {
    const base = css.slice(0, css.indexOf("@supports"))
    expect(base).toContain("color: var(--m-gradient-text-fallback")
    expect(base).toContain("-webkit-text-fill-color: currentColor")
    expect(base).not.toContain("-webkit-text-fill-color: transparent")
    expect(css).toContain("@supports ((background-clip: text)")
    expect(css).toContain("background-color: currentColor")
    expect(css).not.toMatch(/(?:^|[;{])\s*color:\s*transparent/m)
  })

  it("has explicit print/forced-color foreground restoration without disabling system color preferences", () => {
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("background: none !important")
    expect(css).toContain("-webkit-text-fill-color: currentColor !important")
    expect(css).toContain("color: #000 !important")
    expect(css).toContain("color: CanvasText !important")
    expect(css).not.toContain("forced-color-adjust: none")
  })

  it("preserves native font size, selection and direction while establishing an enhanced paint box", () => {
    document.body.innerHTML = '<section dir="rtl" lang="ar"><h2 class="m-gradient-text">عنوان</h2></section><p id="outside">Outside</p>'
    const heading = document.querySelector("h2")!
    const before = { size: getComputedStyle(heading).fontSize, outside: getComputedStyle(document.querySelector("#outside")!).color }
    install()
    expect(getComputedStyle(heading).fontSize).toBe(before.size)
    expect(heading.tagName).toBe("H2")
    expect(css.slice(css.indexOf("@supports"))).toContain("display: inline-block")
    expect(css).not.toContain("font-size:")
    expect(getComputedStyle(document.querySelector("#outside")!).color).toBe(before.outside)
    expect(document.querySelector("section")?.dir).toBe("rtl")
    expect(document.querySelector("section")?.lang).toBe("ar")
    expect(css).not.toContain("white-space: nowrap")
    expect(css).not.toContain("user-select: none")
  })

  it("matches theme endpoint roles and retains surface-aware light compositing", () => {
    document.body.innerHTML = '<span class="m-gradient-text" data-m-theme="dark">Text</span>'
    install()
    const theme = getComputedStyle(document.querySelector("span")!)
    for (const [type, from, to] of [
      ["primary", "#63e2b7", "#2a947d"], ["success", "#63e2b7", "#2a947d"],
      ["info", "#70c0e8", "#3889c5"], ["warning", "#f2c97d", "#f08a00"],
      ["error", "#e88080", "#d03a52"],
    ]) {
      expect(theme.getPropertyValue(`--_m-gradient-${type}-start`)).toBe(from)
      expect(theme.getPropertyValue(`--_m-gradient-${type}-end`)).toBe(to)
    }
    expect(css).toContain("font-weight: var(--m-gradient-text-weight, 500)")
    expect(css).toContain("var(--_m-gradient-color) 60%, var(--m-gradient-text-surface, #fff)")
    expect(css).toContain("252deg) in srgb")
    expect(css).not.toContain("@property")
  })

  it("keeps native link attributes and listeners instead of intercepting activation", () => {
    document.body.innerHTML = '<a class="m-gradient-text" href="#target" target="_blank" rel="noopener">Native link</a>'
    const link = document.querySelector("a")!
    const before = link.outerHTML
    let clicks = 0
    link.addEventListener("click", (event) => { event.preventDefault(); clicks++ })
    install()
    link.click()
    expect(link.outerHTML).toBe(before)
    expect(clicks).toBe(1)
    expect(link.getAttribute("href")).toBe("#target")
    expect(css).not.toContain("outline: none")
  })

  it("restores descendant text fill and preserves nested native content", () => {
    document.body.innerHTML = '<span class="m-gradient-text">Parent <code>Code</code><a href="#target">Link</a></span>'
    const code = document.querySelector("code")!
    install()
    expect(document.querySelector("code")).toBe(code)
    expect(css).toContain(".m-gradient-text :not(.m-gradient-text)")
    expect(css).toContain("::selection")
    expect(document.querySelector("script")).toBeNull()
  })

  it("uses no animation, image asset loader or generated duplicate text", () => {
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("url(")
    expect(css).not.toContain("content:")
    expect(css).toContain('data-type="danger"')
  })
})

describe("canonical GradientText ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(gradientTextApi.GradientText).toBe(GradientText)
    expect(gradientTextApi.MGradientText).toBe(MGradientText)
    expect(MGradientText).toBe(GradientText)
    expect(GradientText.tag).toBe("m-gradient-text")
    expect(ViewElement.prototype.isPrototypeOf(GradientText.prototype)).toBe(true)
    expect(customElements.get("m-gradient-text")).toBe(GradientText)
    expect(GradientText.observedAttributes).toEqual(["type", "size", "weight"])
    expect(() => registerGradientText()).not.toThrow()

    const define = vi.fn()
    expect(() => registerGradientText({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("handles typed properties, defaults, validation, and CSS custom property synchronization for type", () => {
    const element = document.createElement("m-gradient-text") as GradientText
    document.body.append(element)
    expect(element.type).toBe("primary")
    expect(element.dataset.type).toBe("primary")

    for (const valid of ["info", "success", "warning", "error", "danger"] as const) {
      element.type = valid
      expect(element.type).toBe(valid)
      expect(element.getAttribute("type")).toBe(valid)
      expect(element.dataset.type).toBe(valid)
    }

    expect(() => { Reflect.set(element, "type", "invalid") }).toThrow(RangeError)
    expect(() => { Reflect.set(element, "type", null) }).toThrow(RangeError)

    element.setAttribute("type", "invalid")
    expect(() => element.type).toThrow(RangeError)

    element.setAttribute("type", "warning")
    expect(element.type).toBe("warning")
    expect(element.dataset.type).toBe("warning")

    element.removeAttribute("type")
    expect(element.type).toBe("primary")
  })

  it("handles typed properties, defaults, validation, and style synchronization for size", () => {
    const element = document.createElement("m-gradient-text") as GradientText
    document.body.append(element)
    expect(element.size).toBeNull()
    expect(element.style.fontSize).toBe("")

    element.size = 24
    expect(element.size).toBe(24)
    expect(element.getAttribute("size")).toBe("24")
    expect(element.style.fontSize).toBe("24px")

    element.size = "2rem"
    expect(element.size).toBe("2rem")
    expect(element.getAttribute("size")).toBe("2rem")
    expect(element.style.fontSize).toBe("2rem")

    element.size = null
    expect(element.size).toBeNull()
    expect(element.hasAttribute("size")).toBe(false)
    expect(element.style.fontSize).toBe("")

    element.setAttribute("size", "36")
    expect(element.size).toBe(36)
    expect(element.style.fontSize).toBe("36px")

    element.setAttribute("size", "1.5em")
    expect(element.size).toBe("1.5em")
    expect(element.style.fontSize).toBe("1.5em")

    element.removeAttribute("size")
    expect(element.size).toBeNull()
    expect(element.style.fontSize).toBe("")

    for (const invalid of [-1, -10, NaN, Infinity, true as any, {} as any]) {
      expect(() => { element.size = invalid }).toThrow(RangeError)
    }

    element.setAttribute("size", "-5")
    expect(() => element.size).toThrow(RangeError)
  })

  it("handles typed properties, defaults, validation, and CSS custom property synchronization for weight", () => {
    const element = document.createElement("m-gradient-text") as GradientText
    document.body.append(element)
    expect(element.weight).toBeNull()
    expect(element.style.getPropertyValue("--m-gradient-text-weight")).toBe("")

    element.weight = 600
    expect(element.weight).toBe(600)
    expect(element.getAttribute("weight")).toBe("600")
    expect(element.style.getPropertyValue("--m-gradient-text-weight")).toBe("600")

    element.weight = "bold"
    expect(element.weight).toBe("bold")
    expect(element.getAttribute("weight")).toBe("bold")
    expect(element.style.getPropertyValue("--m-gradient-text-weight")).toBe("bold")

    element.weight = null
    expect(element.weight).toBeNull()
    expect(element.hasAttribute("weight")).toBe(false)
    expect(element.style.getPropertyValue("--m-gradient-text-weight")).toBe("")

    element.setAttribute("weight", "700")
    expect(element.weight).toBe(700)
    expect(element.style.getPropertyValue("--m-gradient-text-weight")).toBe("700")

    element.removeAttribute("weight")
    expect(element.weight).toBeNull()
    expect(element.style.getPropertyValue("--m-gradient-text-weight")).toBe("")

    for (const invalid of [0, -1, -500, NaN, Infinity, true as any, {} as any]) {
      expect(() => { element.weight = invalid }).toThrow(RangeError)
    }

    element.setAttribute("weight", "-100")
    expect(() => element.weight).toThrow(RangeError)
    element.setAttribute("weight", "0")
    expect(() => element.weight).toThrow(RangeError)
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-gradient-text") as GradientText
    Object.defineProperty(element, "type", { configurable: true, value: "warning" })
    Object.defineProperty(element, "size", { configurable: true, value: 20 })
    Object.defineProperty(element, "weight", { configurable: true, value: 700 })
    document.body.append(element)

    expect(element.type).toBe("warning")
    expect(element.size).toBe(20)
    expect(element.weight).toBe(700)
    expect(element.getAttribute("type")).toBe("warning")
    expect(element.getAttribute("size")).toBe("20")
    expect(element.getAttribute("weight")).toBe("700")
    expect(element.style.fontSize).toBe("20px")
    expect(element.style.getPropertyValue("--m-gradient-text-weight")).toBe("700")
    expect(element.dataset.type).toBe("warning")
  })

  it("exposes MarkupUIGradientText global", async () => {
    await import("../src/components/gradient-text/global.js")
    const globalApi = (globalThis as any).MarkupUIGradientText
    expect(globalApi).toBeDefined()
    expect(globalApi.GradientText).toBe(GradientText)
    expect(globalApi.registerGradientText).toBe(registerGradientText)
  })

  it("generates component API documentation matching the ViewElement specification", () => {
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "gradient-text.json"), "utf8"))
    expect(docs.elements).toHaveLength(1)
    const [element] = docs.elements
    expect(element.type).toBe("GradientText")
    expect(element.web.primary).toBe("m-gradient-text")
    expect(element.properties.type).toMatchObject({
      name: "type",
      type: "enum",
      attribute: "type",
      default: "primary",
      nullable: false,
      writable: true,
      values: expect.arrayContaining(["primary", "info", "success", "warning", "error", "danger"]),
    })
    expect(element.properties.size).toMatchObject({
      name: "size",
      type: "number",
      typeName: "string | number | null",
      attribute: "size",
      default: null,
      nullable: true,
      writable: true,
    })
    expect(element.properties.weight).toMatchObject({
      name: "weight",
      type: "number",
      typeName: "string | number | null",
      attribute: "weight",
      default: null,
      nullable: true,
      writable: true,
    })
    expect(element.regions).toEqual([
      { name: "content", accepts: ["phrasing content"], min: 0, max: null },
    ])
    expect(element.events).toEqual([])
    expect(element.actions).toEqual([])
  })

  it("renders API documentation in demo element", async () => {
    const { renderComponentApi } = await import("../demo/component-api.js")
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "gradient-text.json"), "utf8"))
    const container = document.createElement("div")
    renderComponentApi(container, docs.elements)
    expect(container.textContent).toContain("GradientText")
    expect(container.textContent).toContain("m-gradient-text")
    expect(container.textContent).toContain("type")
    expect(container.textContent).toContain("size")
    expect(container.textContent).toContain("weight")
  })

  it("verifies demo page structure adheres to requirements", () => {
    const demoHtml = readFileSync(resolve("demo", "components", "gradient-text.html"), "utf8")
    expect(demoHtml).toContain('data-demo-page')
    expect(demoHtml).toContain('class="component-docs"')
    expect(demoHtml).toContain('<h1>Gradient Text</h1>')
    expect(demoHtml).toContain('href="#examples">Examples</a>')
    expect(demoHtml).toContain('href="#required-files">Setup</a>')
    expect(demoHtml).toContain('href="#api-heading">API</a>')
    expect(demoHtml).toContain('<details class="component-setup" id="required-files">')
    expect(demoHtml).toContain('<div data-demo-preview>')
    expect(demoHtml).toContain('<m-gradient-text')
    expect(demoHtml).toContain('<section aria-labelledby="api-heading">')
    expect(demoHtml).toContain('<h2 id="api-heading">API</h2>')
    expect(demoHtml).toContain('<div id="gradient-text-api"><p>Loading API documentation.</p></div>')
  })
})
