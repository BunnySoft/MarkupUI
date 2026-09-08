import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "thing", "thing.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "thing.html"), "utf8")
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

describe("CSS-only native Thing", () => {
  it("ships isolated CSS without a Card/List/PageHeader runtime or artificial constructor", () => {
    expect(pkg.exports["./thing/style.css"]).toBe("./dist/markup-ui-thing.css")
    expect(pkg.exports["./thing"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "thing"))).toEqual(["thing.css"])
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-thing")).toBeUndefined()
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-card")
    expect(demo).not.toContain("markup-ui-list")
    expect(demo).not.toContain("markup-ui-page-header")
    expect(css).not.toContain("[data-size")
    expect(css).not.toContain("[data-align")
  })

  it("keeps author-selected articles, generic containers, headings and all seven regions", () => {
    fixture()
    install()
    expect(document.querySelector("#project-thing")!.tagName).toBe("ARTICLE")
    expect(document.querySelector("#project-thing")!.getAttribute("aria-labelledby")).toBe("project-title")
    expect(document.querySelector("#project-title")!.tagName).toBe("H3")
    expect(document.querySelector("#nested-thing")!.tagName).toBe("DIV")
    for (const region of ["avatar", "header", "header-extra", "description", "content", "footer", "action"]) {
      expect(document.querySelector(`#project-thing .mui-thing-${region}`)).not.toBeNull()
    }
    expect(document.querySelectorAll("main")).toHaveLength(1)
    expect(document.querySelectorAll(".mui-thing[role=button], .mui-thing[tabindex]")).toHaveLength(0)
    expect(css).not.toContain("cursor: pointer")
  })

  it("preserves authored nodes, classes and listeners without moving the avatar on indentation", () => {
    fixture()
    const root = document.querySelector<HTMLElement>("#project-thing")!
    const nodes = [...root.querySelectorAll("*")]
    const before = root.innerHTML
    const follow = document.querySelector<HTMLButtonElement>("#follow-project")!
    let clicks = 0
    follow.addEventListener("click", () => clicks++)
    install()
    root.dataset.contentIndented = ""
    root.remove()
    document.body.append(root)
    expect(root.innerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(nodes)
    follow.click()
    expect(clicks).toBe(1)
    expect(document.querySelector("#project-description")!.classList.contains("project-description")).toBe(true)
    expect(document.querySelector("#project-content")!.classList.contains("project-content")).toBe(true)
  })

  it("adapts content-indented through native grid columns while retaining full-width defaults", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#project-thing")!
    const content = document.querySelector("#project-content")!
    const indented = (region: string) => `.mui-thing[data-content-indented] > .mui-thing-avatar:not(template):not([hidden]) ~ .mui-thing-${region}`
    expect(getComputedStyle(content).gridColumn).toBe("1 / -1")
    root.dataset.contentIndented = ""
    // Chromium covers the complex :where() cascade and actual column geometry.
    for (const region of ["content", "footer", "action"]) {
      expect(root.querySelector(`:scope > .mui-thing-${region}`)!.matches(indented(region))).toBe(true)
      expect(css).toContain(indented(region))
    }
    root.dataset.contentIndented = "false"
    expect(content.matches(indented("content"))).toBe(true)
    root.removeAttribute("data-content-indented")
    expect(getComputedStyle(content).gridColumn).toBe("1 / -1")
    expect(css).not.toContain("display: contents")
  })

  it("does not let hidden or template avatars create a phantom indentation column", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#project-thing")!
    root.dataset.contentIndented = ""
    document.querySelector<HTMLElement>("#project-avatar")!.hidden = true
    expect(getComputedStyle(document.querySelector("#project-lead")!).gridColumn).toBe("1 / -1")
    expect(getComputedStyle(document.querySelector("#project-content")!).gridColumn).toBe("1 / -1")
    expect(document.querySelector("#native-template")!.classList.contains("mui-thing-avatar")).toBe(true)
    expect(css).toContain(".mui-thing-avatar:not(template):not([hidden])")
  })

  it("preserves image attributes and explicit SVG naming without an Avatar/Icon dependency", () => {
    fixture()
    const image = document.querySelector<HTMLImageElement>("#project-image")!
    const before = image.outerHTML
    install()
    expect(image.outerHTML).toBe(before)
    expect(image.alt).toBe("Blue project emblem")
    expect(image.width).toBe(48)
    expect(image.height).toBe(48)
    const svg = document.querySelector("#beta-avatar svg")!
    expect(svg.getAttribute("role")).toBe("img")
    expect(svg.getAttribute("aria-labelledby")).toBe("beta-symbol-title")
    expect(svg.querySelector("title")!.textContent).toBe("Beta project symbol")
  })

  it("keeps sparse descriptions/content/actions and empty roots without generated headings", () => {
    fixture()
    install()
    expect(document.querySelector("#description-only .mui-thing-header")).toBeNull()
    expect(document.querySelector("#description-only .mui-thing-description")!.textContent).toContain("not suppressed")
    expect(document.querySelector("#content-only")!.children).toHaveLength(1)
    expect(document.querySelector("#action-only")!.children).toHaveLength(1)
    expect(document.querySelector("#empty-thing")!.children).toHaveLength(0)
    expect(document.querySelector("#content-only h1, #content-only h2, #content-only h3")).toBeNull()
  })

  it("retains native form validation, external form-associated actions, disabling and reset", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#project-form")!
    const input = document.querySelector<HTMLInputElement>("#project-name")!
    const submit = document.querySelector<HTMLButtonElement>("#native-submit")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    expect(submit.form).toBe(form)
    expect(submit.closest("form")).toBeNull()
    input.value = ""
    submit.click()
    expect(submits).toBe(0)
    input.value = "Updated"
    submit.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["project", "Updated"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(input.value).toBe("Original")
    expect(disabledClicks).toBe(0)
    expect(input.labels?.[0]?.textContent).toBe("Project name")
  })

  it("keeps hidden roots, regions and template content hidden/inert", () => {
    fixture()
    install()
    for (const element of document.querySelectorAll("#hidden-thing, #native-template, #hidden-regions [hidden]")) {
      expect(getComputedStyle(element).display).toBe("none")
    }
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert avatar template")
    const template = document.createElement("template")
    template.className = "mui-thing"
    document.body.append(template)
    expect(getComputedStyle(template).display).toBe("none")
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("resets nested layout defaults and leaves outer native list semantics intact", () => {
    fixture()
    install()
    const outer = document.querySelector<HTMLElement>("#indented-thing")!
    outer.style.setProperty("--mui-thing-row-gap", "4rem")
    const nested = document.querySelector("#nested-thing")!
    expect(getComputedStyle(nested).getPropertyValue("--mui-thing-row-gap")).toBe(".75rem")
    expect(getComputedStyle(document.querySelector("#nested-content")!).gridColumn).toBe("1 / -1")
    expect(getComputedStyle(document.querySelector("#native-list-item")!).display).toBe("list-item")
    expect(getComputedStyle(document.querySelector("#native-list")!).listStyleType).toBe("disc")
  })

  it("allows late authored safe text/content updates without adding event or role contracts", () => {
    fixture()
    install()
    const content = document.querySelector("#project-content")!
    const late = document.createElement("p")
    late.textContent = "<script>Plain authored text</script>"
    content.append(late)
    expect(content.lastElementChild).toBe(late)
    expect(late.querySelector("script")).toBeNull()
    expect(document.querySelectorAll(".mui-thing[aria-live], .mui-thing[aria-selected]")).toHaveLength(0)
    expect(document.querySelector("#project-link button, #details-link button")).toBeNull()
  })

  it("uses scoped wrapping, logical positioning, print and forced colors without global resets", () => {
    fixture()
    const outside = document.querySelector("#outside-content")!
    const before = getComputedStyle(outside).display
    install()
    expect(getComputedStyle(outside).display).toBe(before)
    expect(getComputedStyle(document.querySelector("#project-header")!).flexWrap).toBe("wrap")
    expect(getComputedStyle(document.querySelector("#project-actions")!).flexWrap).toBe("wrap")
    expect(css).toContain("margin-inline-start")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).not.toContain("row-reverse")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("animation:")
    expect(css).not.toMatch(/(?:^|[;{])\s*order\s*:/m)
  })
})
