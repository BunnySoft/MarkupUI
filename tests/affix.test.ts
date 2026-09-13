import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Affix, MAffix, registerAffix } from "../src/components/affix/index.js"
import * as affixApi from "../src/components/affix/index.js"
import type { AffixChangeDetail } from "../src/components/affix/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync(resolve("src", "components", "affix", "affix.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "affix.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "affix.css"), "utf8")
const app = readFileSync(resolve("demo", "components", "affix.js"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined

function fixture(): void {
  document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>"))
}
function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}
afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("CSS-native sticky Affix", () => {
  it("ships native sticky CSS with no fixed or absolute positions", () => {
    expect(pkg.exports["./affix/style.css"]).toBe("./dist/markup-ui-affix.css")
    expect(pkg.dependencies).toEqual({})
    expect(css).not.toContain("@import")
    expect(css).not.toContain("position: fixed")
    expect(css).not.toContain("position: absolute")
  })

  it("uses native sticky positioning with inactive auto insets by default", () => {
    fixture()
    install()
    const element = document.querySelector("#no-inset")!
    expect(getComputedStyle(element).position).toBe("sticky")
    expect(getComputedStyle(element).getPropertyValue("--m-affix-block-start")).toBe("auto")
    expect(getComputedStyle(element).getPropertyValue("--m-affix-block-end")).toBe("auto")
    expect(css).not.toContain("inline-size: 100%")
    expect(css).not.toMatch(/display:\s*(?:block|flex|grid|contents)/)
  })

  it("keeps authored nodes, listeners, order and native semantics during offset changes", () => {
    fixture()
    const toolbar = document.querySelector<HTMLElement>("#window-toolbar")!
    const before = toolbar.innerHTML
    const children = [...toolbar.childNodes]
    const link = document.querySelector<HTMLElement>("#notes-link")!
    let clicks = 0
    link.addEventListener("click", event => { event.preventDefault(); clicks++ })
    install()
    toolbar.style.setProperty("--m-affix-block-start", "24px")
    toolbar.remove()
    document.body.append(toolbar)
    link.click()
    expect(clicks).toBe(1)
    expect(toolbar.innerHTML).toBe(before)
    expect([...toolbar.childNodes]).toEqual(children)
    expect(toolbar.hasAttribute("role")).toBe(false)
    expect(toolbar.hasAttribute("tabindex")).toBe(false)
    expect(document.querySelectorAll("main")).toHaveLength(1)
  })

  it("uses explicit native scroll regions rather than listen-to/trigger attributes", () => {
    fixture()
    install()
    const nested = document.querySelector("#nested-scroll")!
    expect(nested.getAttribute("role")).toBe("region")
    expect(nested.getAttribute("aria-labelledby")).toBe("nested-heading")
    expect(nested.getAttribute("tabindex")).toBe("0")
    expect(document.querySelector("#nested-toolbar")!.closest("#nested-scroll")).toBe(nested)
    expect(css).not.toContain("listen-to")
    expect(css).not.toContain("trigger-top")
    expect(css).not.toContain("trigger-bottom")
  })

  it("authors bottom-sticky late in flow and includes the early-position counterexample", () => {
    fixture()
    install()
    expect(document.querySelector("#bottom-content")!.lastElementChild?.id).toBe("bottom-toolbar")
    expect(document.querySelector("#early-bottom-scroll .scroll-content")!.firstElementChild?.id).toBe("early-bottom")
    expect(appCss).toContain("--m-affix-block-end: 10px")
    expect(appCss).toContain("scroll-padding-block-end: 6rem")
    expect(css).not.toContain("order:")
  })

  it("shows constrained/transformed ancestry and delegates geometry to native CSS", () => {
    fixture()
    install()
    expect(document.querySelector("#both-toolbar")!.parentElement?.id).toBe("short-boundary")
    expect(document.querySelector("#constraint-scroll")!.getAttribute("dir")).toBe("rtl")
    expect(appCss).toContain("transform: translateZ(0)")
    expect(appCss).toContain(".overflow-capture { overflow: hidden")
    expect(css).not.toContain("transform")
    expect(css).not.toContain("transition")
  })

  it("keeps labels, required validity, native submission/reset and disabled controls intact", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#native-form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    input.value = ""
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(0)
    input.value = "Updated"
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["project", "Updated"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(input.value).toBe("Original")
    expect(disabledClicks).toBe(0)
    expect(input.labels?.[0]?.textContent).toBe("Project name")
  })

  it("preserves hidden roots and inert templates", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#hidden-affix")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#native-template")!).display).toBe("none")
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert authored template")
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("provides explicit anchor offsets and respects reduced motion in application scroll actions", () => {
    expect(appCss).toContain("scroll-padding-block-start: 6rem")
    expect(appCss).toContain("scroll-margin-block: 1rem")
    expect(app).toContain("prefers-reduced-motion: reduce")
    expect(app).toContain(' ? "auto" : "smooth"')
    expect(app).not.toContain('addEventListener("scroll"')
    expect(app).not.toContain('addEventListener("resize"')
    expect(app).not.toContain("ResizeObserver")
    expect(app).not.toContain("setInterval")
  })

  it("returns to normal flow and clears offsets/layers when printed", () => {
    expect(css).toContain("@media print")
    expect(css).toContain("position: static !important")
    expect(css).toContain("inset-block: auto !important")
    expect(css).toContain("z-index: auto !important")
    expect(appCss).toContain(".demo-scroll { block-size: auto; overflow: visible; }")
    expect(css).not.toContain("animation")
  })

  it("leaves authored paint and typography alone within the unchanged CSS budget", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:color|background(?:-[\w-]+)?|font(?:-[\w-]+)?|padding(?:-[\w-]+)?|border(?:-[\w-]+)?)\s*:/m)
    expect(css).not.toContain("overflow")
    expect(css).not.toContain("content:")
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(500)
  })

  it("honors element-local inset/layer tokens without leaking offsets into nested affixes", () => {
    document.body.innerHTML = '<div class="m-affix" id="outer" style="--m-affix-block-start:24px;--m-affix-block-end:12px;--m-affix-z-index:7"><div class="m-affix" id="inner">Authored content</div></div>'
    const outer = document.querySelector<HTMLElement>("#outer")!
    const inner = document.querySelector<HTMLElement>("#inner")!
    const authored = outer.getAttribute("style")
    install()
    const parentStyle = getComputedStyle(outer), childStyle = getComputedStyle(inner)
    expect(parentStyle.getPropertyValue("--m-affix-block-start")).toBe("24px")
    expect(parentStyle.getPropertyValue("--m-affix-block-end")).toBe("12px")
    expect(parentStyle.getPropertyValue("--m-affix-z-index")).toBe("7")
    expect(childStyle.getPropertyValue("--m-affix-block-start")).toBe("auto")
    expect(childStyle.getPropertyValue("--m-affix-block-end")).toBe("auto")
    expect(childStyle.getPropertyValue("--m-affix-z-index")).toBe("1")
    expect(outer.getAttribute("style")).toBe(authored)
    expect(outer.firstElementChild).toBe(inner)
    expect(inner.textContent).toBe("Authored content")
  })
})

describe("canonical Affix ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(affixApi.Affix).toBe(Affix)
    expect(affixApi.MAffix).toBe(MAffix)
    expect(Affix.tag).toBe("m-affix")
    expect(ViewElement.prototype.isPrototypeOf(Affix.prototype)).toBe(true)
    expect(customElements.get("m-affix")).toBe(Affix)
    expect(Affix.observedAttributes).toEqual(["offset-top", "offset-bottom"])
    expect(() => registerAffix()).not.toThrow()
    const define = vi.fn()
    expect(() => registerAffix({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("handles offsetTop property defaults, attributes, validation, and CSS custom property synchronization", () => {
    const element = document.createElement("m-affix") as Affix
    document.body.append(element)
    expect(element.offsetTop).toBeNull()
    expect(element.style.getPropertyValue("--m-affix-block-start")).toBe("")

    element.offsetTop = 20
    expect(element.offsetTop).toBe(20)
    expect(element.getAttribute("offset-top")).toBe("20")
    expect(element.style.getPropertyValue("--m-affix-block-start")).toBe("20px")

    element.offsetTop = null
    expect(element.offsetTop).toBeNull()
    expect(element.hasAttribute("offset-top")).toBe(false)
    expect(element.style.getPropertyValue("--m-affix-block-start")).toBe("")

    element.setAttribute("offset-top", "15")
    expect(element.offsetTop).toBe(15)
    expect(element.style.getPropertyValue("--m-affix-block-start")).toBe("15px")

    element.removeAttribute("offset-top")
    expect(element.offsetTop).toBeNull()
    expect(element.style.getPropertyValue("--m-affix-block-start")).toBe("")

    expect(() => { element.offsetTop = NaN }).toThrow(RangeError)
    expect(() => { element.offsetTop = Infinity }).toThrow(RangeError)
    element.setAttribute("offset-top", "invalid")
    expect(() => element.offsetTop).toThrow(RangeError)
  })

  it("handles offsetBottom property defaults, attributes, validation, and CSS custom property synchronization", () => {
    const element = document.createElement("m-affix") as Affix
    document.body.append(element)
    expect(element.offsetBottom).toBeNull()
    expect(element.style.getPropertyValue("--m-affix-block-end")).toBe("")

    element.offsetBottom = 30
    expect(element.offsetBottom).toBe(30)
    expect(element.getAttribute("offset-bottom")).toBe("30")
    expect(element.style.getPropertyValue("--m-affix-block-end")).toBe("30px")

    element.offsetBottom = null
    expect(element.offsetBottom).toBeNull()
    expect(element.hasAttribute("offset-bottom")).toBe(false)
    expect(element.style.getPropertyValue("--m-affix-block-end")).toBe("")

    element.setAttribute("offset-bottom", "45")
    expect(element.offsetBottom).toBe(45)
    expect(element.style.getPropertyValue("--m-affix-block-end")).toBe("45px")

    element.removeAttribute("offset-bottom")
    expect(element.offsetBottom).toBeNull()
    expect(element.style.getPropertyValue("--m-affix-block-end")).toBe("")

    expect(() => { element.offsetBottom = NaN }).toThrow(RangeError)
    expect(() => { element.offsetBottom = Infinity }).toThrow(RangeError)
    element.setAttribute("offset-bottom", "invalid")
    expect(() => element.offsetBottom).toThrow(RangeError)
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-affix") as Affix
    Object.defineProperty(element, "offsetTop", { configurable: true, value: 50 })
    Object.defineProperty(element, "offsetBottom", { configurable: true, value: 100 })
    document.body.append(element)

    expect(element.offsetTop).toBe(50)
    expect(element.offsetBottom).toBe(100)
    expect(element.getAttribute("offset-top")).toBe("50")
    expect(element.getAttribute("offset-bottom")).toBe("100")
    expect(element.style.getPropertyValue("--m-affix-block-start")).toBe("50px")
    expect(element.style.getPropertyValue("--m-affix-block-end")).toBe("100px")
  })

  it("emits m:change event when affixed state transitions", () => {
    const element = document.createElement("m-affix") as Affix
    element.offsetTop = 20
    document.body.append(element)

    const change = vi.fn()
    element.addEventListener("m:change", change)

    // Sticking: element top <= offsetTop
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      top: 10, bottom: 50, left: 0, right: 100, width: 100, height: 40,
    } as DOMRect)
    element.update()

    expect(change).toHaveBeenCalledTimes(1)
    const event = change.mock.calls[0]![0] as CustomEvent<AffixChangeDetail>
    expect(event.detail).toEqual({ affixed: true })
    expect(event.bubbles).toBe(true)
    expect(event.cancelable).toBe(false)
    expect(event.composed).toBe(false)

    // Unsticking: element top > offsetTop
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 140, left: 0, right: 100, width: 100, height: 40,
    } as DOMRect)
    element.update()

    expect(change).toHaveBeenCalledTimes(2)
    expect((change.mock.calls[1]![0] as CustomEvent<AffixChangeDetail>).detail).toEqual({ affixed: false })

    // No change should not fire event
    element.update()
    expect(change).toHaveBeenCalledTimes(2)
  })

  it("emits m:change with bottom offset sticking", () => {
    const element = document.createElement("m-affix") as Affix
    element.offsetBottom = 30
    document.body.append(element)

    const change = vi.fn()
    element.addEventListener("m:change", change)

    // Sticking at bottom: viewport bottom - element bottom <= offsetBottom
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      top: 740, bottom: 780, left: 0, right: 100, width: 100, height: 40,
    } as DOMRect)
    element.update()

    expect(change).toHaveBeenCalledWith(expect.objectContaining({ detail: { affixed: true } }))
  })

  it("cleans up scroll and resize listeners when disconnected", () => {
    const element = document.createElement("m-affix") as Affix
    document.body.append(element)
    const removeListener = vi.spyOn(window, "removeEventListener")
    element.remove()
    expect(removeListener).toHaveBeenCalledWith("scroll", expect.any(Function))
    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function))
  })

  it("exposes MarkupUIAffix global", async () => {
    await import("../src/components/affix/global.js")
    const globalApi = (globalThis as any).MarkupUIAffix
    expect(globalApi).toBeDefined()
    expect(globalApi.Affix).toBe(Affix)
    expect(globalApi.registerAffix).toBe(registerAffix)
  })

  it("generates component API documentation matching the ViewElement specification", () => {
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "affix.json"), "utf8"))
    expect(docs.elements).toHaveLength(1)
    const [element] = docs.elements
    expect(element.type).toBe("Affix")
    expect(element.web.primary).toBe("m-affix")
    expect(element.properties.offsetTop).toMatchObject({
      name: "offsetTop",
      type: "number",
      typeName: "number | null",
      attribute: "offset-top",
      default: null,
      nullable: true,
      writable: true,
    })
    expect(element.properties.offsetBottom).toMatchObject({
      name: "offsetBottom",
      type: "number",
      typeName: "number | null",
      attribute: "offset-bottom",
      default: null,
      nullable: true,
      writable: true,
    })
    expect(element.regions).toEqual([
      { name: "content", accepts: ["flow content"], min: 0, max: null },
    ])
    expect(element.events).toEqual([
      {
        name: "Change",
        web: "m:change",
        bubbles: true,
        cancelable: false,
        composed: false,
        detail: { affixed: "boolean" },
      },
    ])
    expect(element.actions).toEqual(["update"])
  })

  it("renders API documentation in demo element", async () => {
    const { renderComponentApi } = await import("../demo/component-api.js")
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "affix.json"), "utf8"))
    const container = document.createElement("div")
    renderComponentApi(container, docs.elements)
    expect(container.textContent).toContain("Affix")
    expect(container.textContent).toContain("m-affix")
    expect(container.textContent).toContain("offset-top")
    expect(container.textContent).toContain("offset-bottom")
    expect(container.textContent).toContain("m:change")
  })
})
