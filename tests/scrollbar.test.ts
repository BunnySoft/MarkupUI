import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "scrollbar", "scrollbar.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "scrollbar.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "scrollbar.css"), "utf8")
const app = readFileSync(resolve("demo", "components", "scrollbar.js"), "utf8")
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
})

describe("native-only Scrollbar", () => {
  it("ships only external CSS with no rail/controller/registration dependency", () => {
    expect(pkg.exports["./scrollbar/style.css"]).toBe("./dist/markup-ui-scrollbar.css")
    expect(pkg.exports["./scrollbar"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "scrollbar"))).toEqual(["scrollbar.css"])
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-scrollbar")).toBeUndefined()
    expect(css).not.toContain("@import")
    expect(css).not.toContain("::-webkit-scrollbar")
    expect(demo).not.toContain("data-scrollbar-rail")
  })

  it("uses native overflow on the actual named/focusable scroll region", () => {
    fixture()
    install()
    const region = document.querySelector("#vertical-scroll")!
    expect(getComputedStyle(region).overflow).toBe("auto")
    expect(region.getAttribute("role")).toBe("region")
    expect(region.getAttribute("aria-labelledby")).toBe("vertical-heading")
    expect(region.getAttribute("tabindex")).toBe("0")
    expect(document.querySelector("#vertical-content")!.hasAttribute("tabindex")).toBe(false)
    expect(document.querySelector("#vertical-content")!.hasAttribute("role")).toBe(false)
  })

  it("preserves authored wrapper/content/classes and listeners through reconnection", () => {
    fixture()
    const root = document.querySelector("#vertical-scroll")!
    const nodes = [...root.querySelectorAll("*")]
    const before = root.innerHTML
    const link = document.querySelector<HTMLElement>("#vertical-last")!
    let clicks = 0
    link.addEventListener("click", event => { event.preventDefault(); clicks++ })
    install()
    root.remove()
    document.body.append(root)
    link.click()
    expect(root.innerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(nodes)
    expect(clicks).toBe(1)
    expect(document.querySelector("#vertical-content")!.classList.contains("padded-content")).toBe(true)
  })

  it("uses native scroll events and properties without aliases or cached refs", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#vertical-scroll")!
    let target: EventTarget | null = null
    root.addEventListener("scroll", event => { target = event.target }, { passive: true })
    root.scrollTop = 125
    root.scrollLeft = -12
    root.dispatchEvent(new Event("scroll"))
    expect(target).toBe(root)
    expect(root.scrollTop).toBe(125)
    expect(root.scrollLeft).toBe(-12)
    expect(app).not.toContain("mui:scroll")
    expect(app).not.toContain(".sync(")
    expect(app).not.toContain("containerRef")
  })

  it("leaves dimensions, content width and optional containment in application CSS", () => {
    expect(css).not.toContain("block-size: 14rem")
    expect(css).not.toContain("fit-content")
    expect(css).not.toContain("overscroll-behavior")
    expect(appCss).toContain(".wide-content { inline-size: 60rem")
    expect(appCss).toContain(".inner-panel.contain-scroll { overscroll-behavior: contain; }")
    expect(appCss).toContain(".native-panel.taller { block-size: 22rem; }")
    expect(app).not.toContain("ResizeObserver")
    expect(app).not.toContain("setInterval")
  })

  it("keeps standards styling optional and does not hide native bars by default", () => {
    fixture()
    install()
    expect(document.querySelector("#vertical-scroll")!.hasAttribute("data-thin")).toBe(false)
    expect(document.querySelector("#styled-scroll")!.hasAttribute("data-thin")).toBe(true)
    expect(css).toContain("@supports (scrollbar-width: thin)")
    expect(css).toContain("@supports (scrollbar-color: auto)")
    expect(css).toContain("@supports (scrollbar-gutter: stable)")
    expect(css).not.toContain("scrollbar-width: none")
    expect(css).not.toContain("overflow: hidden")
    expect(css).not.toContain("touch-action")
  })

  it("keeps nested scrollers distinct and preserves native direction rather than sign normalization", () => {
    fixture()
    install()
    expect(document.querySelector("#inner-scroll")!.closest("#outer-scroll")?.id).toBe("outer-scroll")
    expect(document.querySelector("#rtl-scroll")!.getAttribute("dir")).toBe("rtl")
    expect(getComputedStyle(document.querySelector("#inner-scroll")!).overflow).toBe("auto")
    expect(app).not.toContain("Math.abs")
    expect(app).not.toContain("scrollLeft *")
    expect(app).not.toContain('addEventListener("wheel"')
    expect(app).not.toContain('addEventListener("keydown"')
  })

  it("preserves native forms, validity, disabled controls and reset", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#native-form")!
    const input = document.querySelector<HTMLInputElement>("#native-note")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    input.value = ""
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(0)
    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["note", "Edited"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(input.value).toBe("Original")
    expect(disabledClicks).toBe(0)
  })

  it("keeps hidden regions/templates inert without generated placeholders", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#hidden-scroll")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#native-template")!).display).toBe("none")
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert content template")
    expect(document.querySelectorAll("[data-scrollbar-rail], [aria-controls], [aria-valuenow]")).toHaveLength(0)
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("uses explicit native scrolling commands with reduced-motion guidance", () => {
    expect(app).toContain("vertical.scrollBy(")
    expect(app).toContain("vertical.scrollTo(0, 0)")
    expect(app).toContain("link.scrollIntoView(")
    expect(app).toContain("prefers-reduced-motion: reduce")
    expect(app).toContain("link.focus({ preventScroll: true })")
    expect(css).not.toContain("scroll-behavior: smooth")
    expect(css).not.toContain("animation:")
  })

  it("does not require a content wrapper or mutate late author children", () => {
    const root = document.createElement("section")
    root.className = "mui-scrollbar"
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Direct native content"
    root.append(button)
    document.body.append(root)
    install()
    expect(root.firstElementChild).toBe(button)
    expect(root.children).toHaveLength(1)
    expect(root.querySelector(".mui-scrollbar-content")).toBeNull()
  })

  it("expands for print and restores native forced-color appearance without global resets", () => {
    fixture()
    const outside = document.querySelector("#outside-content")!
    const before = getComputedStyle(outside).overflow
    install()
    expect(getComputedStyle(outside).overflow).toBe(before)
    expect(css).toContain("@media print")
    expect(css).toContain("overflow: visible !important")
    expect(css).toContain("max-block-size: none !important")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("scrollbar-color: auto")
    expect(css).toContain("scrollbar-width: auto")
  })

  it("uses the pinned light/dark thumb colors only through the opt-in standards rule", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const light = rules.find(rule => rule.selectorText === ':where([data-mui-theme="light"])')!
    const dark = rules.find(rule => rule.selectorText === ':where([data-mui-theme="dark"])')!
    expect(light.style.getPropertyValue("--_mui-scrollbar-thumb")).toBe("rgba(0, 0, 0, .25)")
    expect(dark.style.getPropertyValue("--_mui-scrollbar-thumb")).toBe("rgba(255, 255, 255, .2)")
    const root = rules.find(rule => rule.selectorText === ":where(.mui-scrollbar)")!
    expect(root.style.getPropertyValue("scrollbar-color")).toBe("")
    expect(root.style.getPropertyValue("scrollbar-width")).toBe("")
  })

  it("keeps a transparent default track and gives authored colors precedence", () => {
    expect(css).toContain("var(--mui-scrollbar-thumb-color, var(--_mui-scrollbar-thumb,")
    expect(css).toContain("var(--mui-scrollbar-track-color, transparent)")
    expect(css).not.toContain("#71717a")
    expect(css).not.toContain("#e4e4e7")
  })

  it("does not impersonate custom-thumb hover or promise pixel-sized native rails", () => {
    expect(css).not.toContain(":hover")
    expect(css).not.toContain("::-webkit-scrollbar")
    expect(css).not.toContain("scrollbar-width: 5px")
    expect(css).not.toContain("scrollbar-width: none")
    expect(css).not.toContain("pointer-events")
  })
})
