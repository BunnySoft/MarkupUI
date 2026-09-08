import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "breadcrumb", "breadcrumb.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "breadcrumb.html"), "utf8")
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

describe("CSS-only Breadcrumb and BreadcrumbItem", () => {
  it("ships an isolated stylesheet and a script-free demo without router/widgets dependencies", () => {
    expect(pkg.exports["./breadcrumb/style.css"]).toBe("./dist/markup-ui-breadcrumb.css")
    expect(pkg.exports["./breadcrumb"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "breadcrumb"))).toEqual(["breadcrumb.css"])
    expect(pkg.dependencies).toEqual({})
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("<script")
    expect(customElements.get("mui-breadcrumb")).toBeUndefined()
  })

  it("preserves named nav landmarks and legal native list/item structure", () => {
    fixture()
    install()
    for (const nav of document.querySelectorAll(".mui-breadcrumb")) {
      expect(nav.tagName).toBe("NAV")
      expect(nav.getAttribute("aria-label")).toBeTruthy()
      const list = nav.querySelector(":scope > .mui-breadcrumb-list")!
      expect(["OL", "UL"]).toContain(list.tagName)
      expect([...list.children].every(item => ["LI", "TEMPLATE"].includes(item.tagName))).toBe(true)
    }
    expect(getComputedStyle(document.querySelector("#home-item")!).display).toBe("list-item")
    expect(document.querySelectorAll(".mui-breadcrumb h1, .mui-breadcrumb h2, .mui-breadcrumb [aria-live]")).toHaveLength(0)
    expect(css).not.toContain("display: contents")
  })

  it("keeps native href/target/rel, content, order and node identity intact", () => {
    fixture()
    const root = document.querySelector("#project-breadcrumb")!
    const before = root.outerHTML
    const nodes = [...root.querySelectorAll("*")]
    install()
    root.remove()
    document.body.append(root)
    expect(root.outerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(nodes)
    const reference = document.querySelector<HTMLAnchorElement>("#reference-link")!
    expect(reference.getAttribute("href")).toBe("./breadcrumb.html?view=reference#references")
    expect(reference.target).toBe("_blank")
    expect(reference.rel).toBe("noopener noreferrer")
    expect(document.querySelector("#home-link svg")!.getAttribute("aria-hidden")).toBe("true")
  })

  it("treats current-page state as authored rather than inferred from last position or location", () => {
    fixture()
    install()
    const current = document.querySelector("#current-page")!
    const middle = document.querySelector("#projects-link")!
    expect(current.tagName).toBe("SPAN")
    expect(current.getAttribute("aria-current")).toBe("page")
    current.removeAttribute("aria-current")
    middle.setAttribute("aria-current", "page")
    expect(getComputedStyle(middle).fontWeight).toBe("600")
    expect(current.hasAttribute("aria-current")).toBe(false)
    expect(document.querySelector("#current-page-link")!.getAttribute("href")).toBe("#current-project")
    expect(css).not.toContain(":last-child")
    expect(css).not.toContain(":last-of-type")
  })

  it("uses passive text for unavailable items rather than pointer-only disabled links", () => {
    fixture()
    install()
    const unavailable = document.querySelector<HTMLElement>("#unavailable-link")!
    expect(unavailable.tagName).toBe("SPAN")
    expect(unavailable.getAttribute("aria-disabled")).toBe("true")
    expect(unavailable.textContent).toContain("(unavailable)")
    expect(unavailable.hasAttribute("href")).toBe(false)
    expect(unavailable.hasAttribute("tabindex")).toBe(false)
    expect(unavailable.hasAttribute("role")).toBe(false)
    expect(document.querySelector("#unavailable-item a[href], #unavailable-item button")).toBeNull()
    expect(css).not.toContain("pointer-events")
  })

  it("preserves native click listeners and event payloads without a callback wrapper", () => {
    fixture()
    const link = document.querySelector<HTMLAnchorElement>("#projects-link")!
    let clicks = 0
    let received: MouseEvent | undefined
    link.addEventListener("click", event => { event.preventDefault(); clicks++; received = event })
    install()
    link.click()
    expect(clicks).toBe(1)
    expect(received).toBeInstanceOf(MouseEvent)
    expect(received?.target).toBe(link)
    expect(link.getAttribute("href")).toBe("#projects")
  })

  it("keeps separator nodes inside list items and hides decorative text and SVG from accessibility", () => {
    fixture()
    install()
    for (const separator of document.querySelectorAll(".mui-breadcrumb-separator")) {
      expect(separator.parentElement?.classList.contains("mui-breadcrumb-row")).toBe(true)
      expect(separator.parentElement?.parentElement?.tagName).toBe("LI")
      expect(separator.getAttribute("aria-hidden")).toBe("true")
    }
    expect(document.querySelector("#custom-text-separator")!.textContent).toBe("›")
    expect(document.querySelector("#custom-svg-separator svg")!.getAttribute("focusable")).toBe("false")
    expect(document.querySelector("#home-separator")!.textContent).toBe("")
    expect(css).toContain('content: ""')
    expect(css).toContain("inline-size: .5em")
    expect(css).not.toContain('content: "/"')
  })

  it("scopes visible-sibling separators and explicit opt-out without traversing templates", () => {
    fixture()
    install()
    const visible = [...document.querySelectorAll("#project-list > li:not([hidden])")]
    expect(visible.map(item => item.id)).toEqual(["home-item", "projects-item", "unavailable-item", "current-item"])
    expect(document.querySelector("#no-separator-item")!.getAttribute("data-show-separator")).toBe("false")
    expect(getComputedStyle(document.querySelector("#suppressed-separator")!).display).toBe("none")
    expect(css).toContain("@supports selector(:has(*))")
    expect(css).toContain("li.mui-breadcrumb-item:not([hidden]):has(~ li.mui-breadcrumb-item:not([hidden]))")
  })

  it("preserves hidden first/middle/last items, hidden navigation and inert templates", () => {
    fixture()
    install()
    for (const id of ["hidden-first", "hidden-middle", "hidden-last", "hidden-breadcrumb", "native-template"]) {
      expect(getComputedStyle(document.getElementById(id)!).display).toBe("none")
    }
    const template = document.createElement("template")
    template.className = "mui-breadcrumb-row"
    document.body.append(template)
    expect(getComputedStyle(template).display).toBe("none")
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert breadcrumb template")
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("resets nested gap defaults and preserves independent names/current-page owners", () => {
    fixture()
    install()
    const parent = document.querySelector<HTMLElement>("#parent-breadcrumb")!
    parent.style.setProperty("--mui-breadcrumb-gap", "3rem")
    const nested = document.querySelector("#nested-breadcrumb")!
    expect(getComputedStyle(nested).getPropertyValue("--mui-breadcrumb-gap")).toBe(".5rem")
    expect(nested.getAttribute("aria-label")).toBe("Nested reference breadcrumb")
    expect(nested.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    expect(document.querySelector("#nested-last-separator")!.closest("nav")).toBe(nested)
  })

  it("allows late authored items and safe text updates without rerendering the path", () => {
    fixture()
    install()
    const list = document.querySelector("#project-list")!
    const link = document.querySelector("#projects-link")!
    link.textContent = "<b>Literal project text</b>"
    expect(link.querySelector("b")).toBeNull()
    const late = document.createElement("li")
    late.className = "mui-breadcrumb-item"
    late.textContent = "Authored later context"
    list.append(late)
    expect(list.lastElementChild).toBe(late)
    expect(list.querySelector("#projects-link")).toBe(link)
  })

  it("wraps logically with native focus, print/forced-color rules and no global list reset", () => {
    fixture()
    const outside = document.querySelector("#outside-list")!
    const before = getComputedStyle(outside).padding
    install()
    expect(getComputedStyle(outside).padding).toBe(before)
    expect(getComputedStyle(document.querySelector("#project-list")!).flexWrap).toBe("wrap")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain(":focus-visible")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).not.toContain("row-reverse")
    expect(css).not.toContain("nowrap")
    expect(css).not.toContain("overflow: hidden")
    expect(css).not.toMatch(/(?:^|[;{])\s*order\s*:/m)
  })
})
