import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

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
})

describe("CSS-native sticky Affix", () => {
  it("ships only CSS with no fixed-position controller, observer or registration", () => {
    expect(pkg.exports["./affix/style.css"]).toBe("./dist/markup-ui-affix.css")
    expect(pkg.exports["./affix"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "affix"))).toEqual(["affix.css"])
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-affix")).toBeUndefined()
    expect(css).not.toContain("@import")
    expect(css).not.toContain("position: fixed")
    expect(css).not.toContain("position: absolute")
  })

  it("uses native sticky positioning with inactive auto insets by default", () => {
    fixture()
    install()
    const element = document.querySelector("#no-inset")!
    expect(getComputedStyle(element).position).toBe("sticky")
    expect(getComputedStyle(element).getPropertyValue("--mui-affix-block-start")).toBe("auto")
    expect(getComputedStyle(element).getPropertyValue("--mui-affix-block-end")).toBe("auto")
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
    toolbar.style.setProperty("--mui-affix-block-start", "24px")
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
    expect(appCss).toContain("--mui-affix-block-end: 10px")
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
})
