import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "page-header", "page-header.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "page-header.html"), "utf8")
const app = readFileSync(resolve("demo", "components", "page-header.js"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void {
  document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>"))
}
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("CSS-only Page Header", () => {
  it("ships only a stylesheet without a controller or component dependency", () => {
    expect(pkg.exports["./page-header/style.css"]).toBe("./dist/markup-ui-page-header.css")
    expect(pkg.exports["./page-header"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "page-header"))).toEqual(["page-header.css"])
    expect(customElements.get("mui-page-header")).toBeUndefined()
    expect(app).not.toContain("import ")
    expect(app).not.toContain("history.")
    expect(app).not.toContain("mui:back")
  })

  it("preserves author-selected heading levels, region nodes and attributes", () => {
    fixture()
    const header = document.querySelector("#page-banner")!
    const before = header.outerHTML
    const nodes = [...header.querySelectorAll("*")]
    install()
    expect(header.outerHTML).toBe(before)
    expect([...header.querySelectorAll("*")]).toEqual(nodes)
    expect(document.querySelector("#project-title")?.tagName).toBe("H1")
    expect(document.querySelector("#record-title")?.tagName).toBe("H2")
    expect(document.querySelector("#rtl-title")?.tagName).toBe("H2")
    expect(document.querySelector("[role],[aria-level]")).toBeNull()
  })

  it("maps every documented content surface without generating a breadcrumb or renderer", () => {
    fixture()
    install()
    for (const region of ["header", "avatar", "title", "subtitle", "extra", "content", "footer", "back"]) {
      expect(document.querySelector(`#page-banner .mui-page-header-${region}`)).not.toBeNull()
    }
    expect(document.querySelector("nav")?.getAttribute("aria-label")).toBe("Breadcrumb")
    expect(document.querySelector("[aria-current]")?.getAttribute("aria-current")).toBe("page")
    expect(document.querySelector("#page-banner .mui-page-header-extra")?.textContent).toContain("Draft")
  })

  it("leaves absent/empty regions and native title attributes unambiguous", () => {
    document.body.innerHTML = '<header class="mui-page-header" title="Native advisory title"><div class="mui-page-header-main"><div class="mui-page-header-lead"><div class="mui-page-header-titles"><h2 class="mui-page-header-title"></h2></div></div></div></header>'
    const before = document.body.innerHTML
    install()
    expect(document.body.innerHTML).toBe(before)
    expect(document.querySelector(".mui-page-header-title")?.textContent).toBe("")
    expect(document.querySelector(".mui-page-header-back")).toBeNull()
    expect(document.querySelector(".mui-page-header-subtitle")).toBeNull()
  })

  it("preserves native back-link destinations and keyboard-related attributes", () => {
    fixture()
    const link = document.querySelector<HTMLAnchorElement>("#destination-back")!
    const before = link.outerHTML
    let clicks = 0
    link.addEventListener("click", (event) => { event.preventDefault(); clicks++ })
    install()
    link.click()
    expect(clicks).toBe(1)
    expect(link.outerHTML).toBe(before)
    expect(link.getAttribute("href")).toBe("#workspace")
    expect(link.target).toBe("_self")
    expect(link.rel).toBe("help")
    expect(link.tabIndex).toBe(0)
    expect(link.textContent).toContain("Workspace")
  })

  it("keeps native back type=button separate from form submission and disabled controls", () => {
    fixture()
    const form = document.querySelector("form")!
    const back = document.querySelector<HTMLButtonElement>("#application-back")!
    let backClicks = 0
    let submits = 0
    let disabledClicks = 0
    back.addEventListener("click", () => backClicks++)
    form.addEventListener("submit", (event) => { event.preventDefault(); submits++ })
    document.querySelector("#disabled-action")!.addEventListener("click", () => disabledClicks++)
    install()
    back.click()
    document.querySelector<HTMLButtonElement>("#disabled-action")!.click()
    expect(backClicks).toBe(1)
    expect(submits).toBe(0)
    expect(disabledClicks).toBe(0)
    document.querySelector<HTMLButtonElement>("#save-record")!.click()
    expect(submits).toBe(1)
    expect(back.type).toBe("button")
  })

  it("retains reset, input value and authored native default-submit behavior", () => {
    fixture()
    const input = document.querySelector<HTMLInputElement>("#record-name")!
    const form = document.querySelector("form")!
    const untyped = document.createElement("button")
    untyped.className = "mui-page-header-back"
    untyped.textContent = "Authored default submit"
    document.querySelector("#record-header .mui-page-header-lead")!.append(untyped)
    let submits = 0
    form.addEventListener("submit", (event) => { event.preventDefault(); submits++ })
    install()
    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#reset-record")!.click()
    expect(input.value).toBe("Initial record")
    untyped.click()
    expect(submits).toBe(1)
    expect(untyped.hasAttribute("type")).toBe(false)
  })

  it("preserves native avatar/back SVG paints, titles and accessibility ownership", () => {
    fixture()
    const avatar = document.querySelector("#page-banner .mui-page-header-avatar")!
    const before = avatar.outerHTML
    install()
    expect(avatar.outerHTML).toBe(before)
    expect(avatar.getAttribute("aria-hidden")).toBe("true")
    expect(avatar.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 40 40")
    expect(avatar.querySelector("path")?.getAttribute("fill")).toBe("#175fbb")
    expect(css).not.toContain("fill:")
    expect(css).not.toContain("stroke:")
    expect(css).not.toContain("transform:")
  })

  it("preserves hidden regions and inert templates despite layout display rules", () => {
    document.body.innerHTML = '<header class="mui-page-header"><div class="mui-page-header-main" hidden>Hidden row</div><div class="mui-page-header-footer" hidden>Hidden footer</div><template class="mui-page-header"><button>Inert action</button></template></header><header class="mui-page-header" hidden>Hidden header</header>'
    install()
    for (const node of document.querySelectorAll("[hidden],template")) expect(getComputedStyle(node).display).toBe("none")
    expect(document.querySelector("button")).toBeNull()
    expect(document.querySelector("template")?.content.querySelector("button")?.textContent).toBe("Inert action")
  })

  it("keeps late content and reconnect identity without synthesizing fields or lifecycle", () => {
    fixture()
    const header = document.querySelector("#page-banner")!
    const title = document.querySelector("#project-title")!
    const extra = document.querySelector("#page-banner .mui-page-header-extra")!
    const action = document.createElement("button")
    action.type = "button"
    action.textContent = "Late action"
    let clicks = 0
    action.addEventListener("click", () => clicks++)
    install()
    extra.append(action)
    title.textContent = "New native title"
    header.remove()
    document.body.prepend(header)
    action.click()
    expect(clicks).toBe(1)
    expect(document.querySelector("#project-title")).toBe(title)
    expect(title.textContent).toBe("New native title")
  })

  it("keeps source order, native wrapping, direction and out-of-scope styles", () => {
    fixture()
    const outside = document.querySelector("#outside")!
    const before = getComputedStyle(outside).display
    install()
    expect(getComputedStyle(outside).display).toBe(before)
    expect(document.querySelector("article[dir]")?.getAttribute("dir")).toBe("rtl")
    expect(document.querySelector("article[lang]")?.getAttribute("lang")).toBe("ar")
    expect(css).toContain("min-inline-size: 0")
    expect(css).toContain("flex-wrap: wrap")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).not.toMatch(/(?:^|[;{])\s*order:/m)
    expect(css).not.toContain("overflow: hidden")
    expect(css).not.toContain("white-space: nowrap")
    expect(css).not.toContain("direction:")
  })

  it("has no generated content, motion, injected roles or global resets", () => {
    expect(css).not.toMatch(/(?:^|[;{])\s*content:/m)
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("outline: none")
    expect(css).not.toContain("font-family:")
    expect(css).not.toMatch(/(?:^|\n)(?:h1|header|a|button|body)\s*[{,]/)
  })

  it("allows the heading group to wrap rather than collapse beside a long back label", () => {
    fixture()
    install()
    const lead = document.querySelector("#record-header .mui-page-header-lead")!
    const titles = lead.querySelector(".mui-page-header-titles")!
    expect(getComputedStyle(lead).flexWrap).toBe("wrap")
    expect(getComputedStyle(titles).flexBasis).toBe("12rem")
    expect(getComputedStyle(titles).minInlineSize).toBe("0")
  })
})
