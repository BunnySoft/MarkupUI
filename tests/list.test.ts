import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "list", "list.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "list.html"), "utf8")
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

describe("CSS-only native List and ListItem", () => {
  it("ships a standalone stylesheet without a renderer or custom-element definition", () => {
    expect(pkg.exports["./list/style.css"]).toBe("./dist/markup-ui-list.css")
    expect(pkg.exports["./list"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "list"))).toEqual(["list.css"])
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-list.js")
    expect(customElements.get("mui-list")).toBeUndefined()
    expect(customElements.get("mui-list-item")).toBeUndefined()
    expect(pkg.dependencies).toEqual({})
  })

  it("keeps true list/listitem structure and puts headings and footers outside lists", () => {
    fixture()
    install()
    for (const list of document.querySelectorAll(".mui-list-items")) {
      expect(["UL", "OL"]).toContain(list.tagName)
      expect([...list.children].every(child => ["LI", "TEMPLATE"].includes(child.tagName))).toBe(true)
    }
    const header = document.querySelector("#projects-heading")!
    expect(header.tagName).toBe("H2")
    expect(header.closest("ul, ol")).toBeNull()
    expect(document.querySelector(".mui-list-footer")!.closest("ul, ol")).toBeNull()
    expect(getComputedStyle(document.querySelector("#project-alpha")!).display).toBe("list-item")
    expect(css).not.toContain("display: contents")
  })

  it("preserves authored regions, node identity, order and listeners across removal and late insertion", () => {
    fixture()
    const root = document.querySelector("#projects")!
    const before = root.outerHTML
    const children = [...root.querySelectorAll("*")]
    const action = document.querySelector<HTMLButtonElement>("#archive-alpha")!
    let clicks = 0
    action.addEventListener("click", () => clicks++)
    install()
    root.remove()
    document.body.append(root)
    expect(root.outerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(children)
    action.click()
    const late = document.createElement("li")
    late.className = "mui-list-item"
    late.textContent = "<script>Not interpreted</script>"
    document.querySelector("#project-items")!.append(late)
    expect(late.querySelector("script")).toBeNull()
    expect(late.parentElement?.lastElementChild).toBe(late)
    expect(clicks).toBe(1)
  })

  it("preserves native markers by default with an explicitly authored markerless-role workaround", () => {
    fixture()
    install()
    const ordered = document.querySelector<HTMLOListElement>("#ordered ol")!
    expect(ordered.start).toBe(3)
    expect(ordered.querySelector<HTMLLIElement>("li[value]")!.value).toBe(8)
    expect(ordered.hasAttribute("role")).toBe(false)
    expect(getComputedStyle(ordered).listStyleType).toBe("decimal")
    expect(document.querySelector("#project-items")!.getAttribute("role")).toBe("list")
    expect(getComputedStyle(document.querySelector("#project-items")!).listStyle).toBe("none")
    expect(document.querySelector("#nested-list")!.hasAttribute("class")).toBe(false)
  })

  it("keeps native buttons and links explicit and passive items non-focusable", () => {
    fixture()
    install()
    const button = document.querySelector<HTMLButtonElement>("#open-report")!
    const link = document.querySelector<HTMLAnchorElement>("#row-link")!
    expect(button.type).toBe("button")
    expect(button.textContent).toContain("Open report")
    expect(link.getAttribute("href")).toBe("#details")
    expect(button.querySelectorAll("a, button, input, select, textarea")).toHaveLength(0)
    expect(link.querySelectorAll("a, button, input, select, textarea")).toHaveLength(0)
    expect(document.querySelector<HTMLElement>("#passive-item")!.tabIndex).toBe(-1)
    expect(document.querySelector("#passive-item")!.hasAttribute("role")).toBe(false)
    expect(document.querySelector("#project-alpha .mui-list-suffix")!.querySelectorAll("button, a")).toHaveLength(2)
    // Chromium acceptance covers computed styles for selectors jsdom cannot cascade.
    expect(button.matches(".mui-list[data-clickable] > .mui-list-items > .mui-list-item > button.mui-list-action:not(:disabled)")).toBe(true)
    expect(css).toContain("cursor: pointer")
    expect(getComputedStyle(document.querySelector("#passive-item")!).cursor).not.toBe("pointer")
    expect(css).toContain(":focus-visible")
  })

  it("does not intercept form validation, submission, reset or fieldset disabling", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#native-form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#fieldset-disabled")!.addEventListener("click", () => disabledClicks++)
    input.value = ""
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(0)
    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["name", "Edited"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#fieldset-disabled")!.click()
    document.querySelector<HTMLButtonElement>("#disabled-row")!.click()
    expect(disabledClicks).toBe(0)
    expect(document.querySelector<HTMLButtonElement>("#disabled-row")!.disabled).toBe(true)
  })

  it("retains medium defaults and explicit size presets without runtime measurement", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#projects")!
    expect(getComputedStyle(root).getPropertyValue("--_mui-list-padding-block")).toBe(".75rem")
    root.dataset.size = "small"
    expect(getComputedStyle(root).getPropertyValue("--_mui-list-padding-block")).toBe(".5rem")
    root.dataset.size = "large"
    expect(getComputedStyle(root).getPropertyValue("--_mui-list-padding-block")).toBe("1rem")
    root.dataset.size = "unsupported"
    expect(getComputedStyle(root).getPropertyValue("--_mui-list-padding-block")).toBe(".75rem")
    expect(css).not.toContain("transition:")
  })

  it("separates divider opt-out from borders and skips hidden siblings and templates", () => {
    fixture()
    install()
    const first = document.querySelector("#project-alpha")!
    const second = document.querySelector("#project-beta")!
    const divided = ".mui-list > .mui-list-items > li.mui-list-item:not([hidden]) ~ li.mui-list-item:not([hidden])"
    expect(first.matches(divided)).toBe(false)
    expect(second.matches(divided)).toBe(true)
    expect(css).toContain(divided)
    expect(css).toContain("border-block-start: 1px solid")
    const root = document.querySelector<HTMLElement>("#projects")!
    root.dataset.showDivider = "false"
    expect(getComputedStyle(second).borderBlockStart).toBe("0")
    expect(css).toContain('.mui-list[data-bordered]')
    expect(css).toContain('.mui-list > .mui-list-header')
    expect(css).toContain('.mui-list > .mui-list-footer')
  })

  it("keeps hidden roots, rows, actions and inert templates hidden", () => {
    fixture()
    install()
    for (const id of ["hidden-list", "hidden-first", "hidden-middle", "native-template"]) {
      expect(getComputedStyle(document.getElementById(id)!).display).toBe("none")
    }
    const row = document.querySelector<HTMLElement>("#open-report")!
    row.hidden = true
    expect(getComputedStyle(row).display).toBe("none")
    const template = document.querySelector<HTMLTemplateElement>("#native-template")!
    expect(template.content.querySelector("li")!.textContent).toBe("Inert project template")
    const rootTemplate = document.createElement("template")
    rootTemplate.className = "mui-list-row"
    document.body.append(rootTemplate)
    expect(getComputedStyle(rootTemplate).display).toBe("none")
    expect(document.querySelector("#empty-list ul")!.children).toHaveLength(0)
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("wraps authored regions without reversing reading order and isolates nested lists", () => {
    fixture()
    const outside = document.querySelector("#outside-list")!
    const nested = document.querySelector("#nested-list")!
    const original = [getComputedStyle(outside).padding, getComputedStyle(nested).listStyleType]
    install()
    expect([getComputedStyle(outside).padding, getComputedStyle(nested).listStyleType]).toEqual(original)
    const row = document.querySelector("#ordered-first .mui-list-row")!
    expect(getComputedStyle(row).flexWrap).toBe("wrap")
    expect([...row.children].map(child => child.className)).toEqual(["mui-list-prefix", "mui-list-content", "mui-list-suffix"])
    expect(css).not.toContain("row-reverse")
    expect(css).not.toMatch(/(?:^|[;{])\s*order\s*:/m)
    expect(css).toContain("padding-inline-start")
    expect(css).toContain("overflow-wrap: anywhere")
  })

  it("provides print and forced-color fallbacks without inventing selection or announcements", () => {
    fixture()
    install()
    expect(css).toContain("@media print")
    expect(css).toContain("break-inside: avoid")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("color: GrayText")
    expect(document.querySelectorAll(".mui-list [aria-selected], .mui-list [aria-live], .mui-list [role=status]")).toHaveLength(0)
    expect(document.querySelectorAll(".mui-list [tabindex]")).toHaveLength(0)
  })
})
