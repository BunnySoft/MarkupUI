import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "layout", "layout.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "layout.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "layout.css"), "utf8")
const app = readFileSync(resolve("demo", "components", "layout.js"), "utf8")
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

describe("CSS-only native Layout", () => {
  it("ships only CSS with no registration, provider or scrollbar dependency", () => {
    expect(pkg.exports["./layout/style.css"]).toBe("./dist/markup-ui-layout.css")
    expect(pkg.exports["./layout"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "layout"))).toEqual(["layout.css"])
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-layout.js")
    expect(customElements.get("mui-layout")).toBeUndefined()
  })

  it("preserves authored landmarks, content and native element identity", () => {
    fixture()
    const shell = document.querySelector("#shell")!
    const children = [...shell.childNodes]
    const before = shell.outerHTML
    install()
    expect(shell.outerHTML).toBe(before)
    expect([...shell.childNodes]).toEqual(children)
    expect(document.querySelectorAll("main")).toHaveLength(1)
    expect(document.querySelector("#workspace")?.getAttribute("aria-labelledby")).toBe("workspace-heading")
    expect(document.querySelector("#nested-shell")?.getAttribute("role")).toBeNull()
    expect(document.querySelector("nav")?.getAttribute("aria-label")).toBe("Project navigation")
  })

  it("uses column shells and explicit row layouts without automatic child detection", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#shell")!).flexDirection).toBe("column")
    expect(getComputedStyle(document.querySelector("#shell-body")!).flexDirection).toBe("row")
    expect(getComputedStyle(document.querySelector("#nested-shell")!).flexDirection).toBe("column")
    expect(css).not.toContain(":has(")
    expect(css).not.toContain("row-reverse")
    expect(css).not.toContain("order:")
  })

  it("adapts collapse to native details open/toggle without copying content", () => {
    fixture()
    const sidebar = document.querySelector<HTMLDetailsElement>("#sidebar")!
    const link = document.querySelector("#navigation-link")
    install()
    expect(sidebar.open).toBe(true)
    document.querySelector<HTMLElement>("#sidebar-trigger")!.click()
    expect(sidebar.open).toBe(false)
    sidebar.open = true
    expect(sidebar.querySelector("#navigation-link")).toBe(link)
    expect(css).toContain("details.mui-layout-sider:not([open])")
    expect(css).toContain("--mui-layout-sider-collapsed-width, 48px")
    expect(css).not.toContain("transform:")
    expect(css).not.toContain("transition:")
  })

  it("confines native scrolling to an explicit region with author naming and focus", () => {
    fixture()
    install()
    const activity = document.querySelector("#activity")!
    expect(getComputedStyle(activity).overflow).toBe("auto")
    expect(activity.getAttribute("role")).toBe("region")
    expect(activity.getAttribute("aria-labelledby")).toBe("scroll-heading")
    expect(activity.getAttribute("tabindex")).toBe("0")
    expect(document.querySelector("#shell")?.hasAttribute("tabindex")).toBe(false)
    expect(app).toContain("activity.scrollTo(")
    expect(app).toContain('prefers-reduced-motion: reduce')
    expect(app).not.toContain("mui:scroll")
  })

  it("keeps native forms, disabled controls and reset behavior intact", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#native-form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(submits).toBe(1)
    expect(disabledClicks).toBe(0)
  })

  it("keeps end-side DOM order and logical borders instead of reversing a row", () => {
    fixture()
    install()
    const root = document.querySelector("#rtl-shell")!
    expect(root.lastElementChild?.id).toBe("end-sidebar")
    expect(root.getAttribute("dir")).toBe("rtl")
    expect(css).toContain("border-inline-start:")
    expect(css).toContain("inset-inline-end: 0")
    expect(css).not.toContain("margin-left")
    expect(css).not.toContain("flex-direction: row-reverse")
  })

  it("keeps hidden roots and templates hidden without consuming template contents", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#hidden-shell")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#native-template")!).display).toBe("none")
    const template = document.querySelector<HTMLTemplateElement>("#native-template")!
    expect(template.content.textContent).toBe("Inert authored template")
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("requires explicit containing blocks and does not change responsive disclosure state", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#absolute-shell")!).position).toBe("absolute")
    expect(appCss).toContain(".absolute-container { position: relative;")
    expect(appCss).toContain(".sticky-header { position: sticky;")
    expect(appCss).toContain("@media (max-width: 40rem)")
    expect(appCss).not.toContain("display: none")
    expect(document.querySelector<HTMLDetailsElement>("#sidebar")!.open).toBe(true)
  })

  it("preserves authored classes, late listeners and native reconnect behavior", () => {
    fixture()
    install()
    const content = document.querySelector("#workspace")!
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Late action"
    let clicks = 0
    button.addEventListener("click", () => clicks++)
    content.append(button)
    content.remove()
    document.body.append(content)
    button.click()
    expect(content.lastElementChild).toBe(button)
    expect(clicks).toBe(1)
    expect(content.classList.contains("demo-padding")).toBe(true)
  })

  it("provides forced-color and print fallbacks without altering unscoped content", () => {
    fixture()
    const before = getComputedStyle(document.querySelector("#outside")!).display
    install()
    expect(getComputedStyle(document.querySelector("#outside")!).display).toBe(before)
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("color: CanvasText")
    expect(css).toContain("@media print")
    expect(css).toContain("overflow: visible !important")
  })
})
