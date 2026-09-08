import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "descriptions", "descriptions.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "descriptions.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "descriptions.css"), "utf8")
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

describe("CSS-only Descriptions and DescriptionItem", () => {
  it("ships only CSS without a provider, renderer, custom element or dependency", () => {
    expect(pkg.exports["./descriptions/style.css"]).toBe("./dist/markup-ui-descriptions.css")
    expect(pkg.exports["./descriptions"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "descriptions"))).toEqual(["descriptions.css"])
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-descriptions")).toBeUndefined()
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-descriptions.js")
  })

  it("uses legal dl groups with term/definition pairs and headings outside the list", () => {
    fixture()
    install()
    for (const list of document.querySelectorAll(".mui-descriptions")) {
      expect(list.tagName).toBe("DL")
      for (const group of list.children) {
        if (group.tagName === "TEMPLATE") continue
        expect(group.tagName).toBe("DIV")
        expect([...group.children].map(child => child.tagName)).toEqual(["DT", "DD"])
      }
    }
    expect(document.querySelector("#project-heading")!.closest("dl")).toBeNull()
    expect(document.querySelector("#project-details")!.getAttribute("aria-labelledby")).toBe("project-heading")
    expect(document.querySelectorAll(".mui-descriptions [role], .mui-descriptions [tabindex]")).toHaveLength(0)
    expect(css).not.toContain("display: contents")
  })

  it("preserves authored content, listeners and identity through style changes and reconnection", () => {
    fixture()
    const root = document.querySelector("#project-details")!
    const before = root.outerHTML
    const nodes = [...root.querySelectorAll("*")]
    const action = document.querySelector<HTMLButtonElement>("#review-project")!
    let clicks = 0
    action.addEventListener("click", () => clicks++)
    install()
    root.remove()
    document.body.append(root)
    expect(root.outerHTML).toBe(before)
    expect([...root.querySelectorAll("*")]).toEqual(nodes)
    action.click()
    expect(clicks).toBe(1)
    const group = document.createElement("div")
    group.className = "mui-description-item"
    const term = document.createElement("dt")
    const value = document.createElement("dd")
    term.textContent = "Late term"
    value.textContent = "<script>Plain text</script>"
    group.append(term, value)
    root.append(group)
    expect(root.lastElementChild).toBe(group)
    expect(value.querySelector("script")).toBeNull()
  })

  it("uses three columns and one-column spans by default with sparse native placement", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#project-details")!
    const item = document.querySelector<HTMLElement>("#summary-item")!
    expect(getComputedStyle(root).display).toBe("grid")
    expect(getComputedStyle(root).getPropertyValue("--mui-descriptions-columns")).toBe("3")
    expect(getComputedStyle(item).getPropertyValue("--mui-description-span")).toBe("1")
    root.style.setProperty("--mui-descriptions-columns", "2")
    item.style.setProperty("--mui-description-span", "2")
    expect(getComputedStyle(root).getPropertyValue("--mui-descriptions-columns")).toBe("2")
    expect(getComputedStyle(item).getPropertyValue("--mui-description-span")).toBe("2")
    expect(css).toContain("grid-auto-flow: row")
    expect(css).not.toContain("dense")
    expect(css).not.toMatch(/(?:^|[;{])\s*order\s*:/m)
    expect(css).not.toContain("colspan")
  })

  it("switches top labels to logical horizontal pairs without reordering", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#project-details")!
    const item = document.querySelector("#owner-item")!
    expect(getComputedStyle(item).gridTemplateColumns).toBe("minmax(0, 1fr)")
    root.dataset.labelPlacement = "left"
    expect(getComputedStyle(item).gridTemplateColumns).toContain("--mui-descriptions-label-width")
    expect([...item.children].map(node => node.tagName)).toEqual(["DT", "DD"])
    expect(css).toContain("border-inline-end")
    expect(css).not.toContain("row-reverse")
  })

  it("keeps density, label alignment and application content alignment in CSS", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#project-details")!
    expect(getComputedStyle(root).getPropertyValue("--_mui-descriptions-padding-block")).toBe(".75rem")
    root.dataset.size = "small"
    expect(getComputedStyle(root).getPropertyValue("--_mui-descriptions-padding-block")).toBe(".5rem")
    root.dataset.size = "large"
    expect(getComputedStyle(root).getPropertyValue("--_mui-descriptions-padding-block")).toBe("1rem")
    root.dataset.size = "unknown"
    expect(getComputedStyle(root).getPropertyValue("--_mui-descriptions-padding-block")).toBe(".75rem")
    root.dataset.labelAlign = "right"
    expect(getComputedStyle(root).getPropertyValue("--mui-descriptions-label-align")).toBe("right")
    expect(appCss).toContain("--mui-descriptions-content-align: center")
  })

  it("renders separators only from authored text in unbordered horizontal terms", () => {
    fixture()
    install()
    const separator = document.querySelector("#colon-separator")!
    expect(separator.textContent).toBe(":")
    expect(separator.getAttribute("aria-hidden")).toBe("true")
    expect(document.querySelector("#custom-separator")!.textContent).toBe("—")
    const selector = 'dl.mui-descriptions[data-label-placement="left"]:not([data-bordered]) > div.mui-description-item > dt > .mui-descriptions-separator'
    expect(separator.matches(selector)).toBe(true)
    expect(document.querySelector("#rtl-term .mui-descriptions-separator")!.matches(selector)).toBe(false)
    expect(css).toContain(selector)
    expect(css).not.toContain("content:")
  })

  it("keeps native validation, submission, disabled fieldsets and reset behavior", () => {
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
    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["name", "Edited"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(disabledClicks).toBe(0)
    expect(input.labels?.[0]?.textContent).toBe("Project name")
  })

  it("preserves native hidden roots, groups, definitions and inert templates", () => {
    fixture()
    install()
    for (const id of ["hidden-descriptions", "hidden-item", "native-template"]) {
      expect(getComputedStyle(document.getElementById(id)!).display).toBe("none")
    }
    const value = document.querySelector<HTMLElement>("#owner-item dd")!
    value.hidden = true
    expect(getComputedStyle(value).display).toBe("none")
    const template = document.querySelector<HTMLTemplateElement>("#native-template")!
    expect(template.content.querySelector("dt")!.textContent).toBe("Inert term")
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("does not generate empty terms, placeholders or duplicate title content", () => {
    fixture()
    install()
    expect(document.querySelector("#empty-term-item dt")!.textContent).toBe("")
    expect(document.querySelector("#empty-descriptions")!.children).toHaveLength(0)
    expect(document.querySelectorAll("#project-heading")).toHaveLength(1)
    expect(document.querySelectorAll(".mui-descriptions [aria-live], .mui-descriptions [aria-selected]")).toHaveLength(0)
  })

  it("isolates nested description settings and leaves ordinary dt/dd presentation alone", () => {
    fixture()
    const outside = document.querySelector("#outside-descriptions dd")!
    const margin = getComputedStyle(outside).margin
    install()
    const parent = document.querySelector<HTMLElement>("#project-details")!
    parent.style.setProperty("--mui-descriptions-columns", "6")
    parent.dataset.labelPlacement = "left"
    parent.dataset.labelAlign = "right"
    const nested = document.querySelector("#nested-details")!
    expect(getComputedStyle(nested).getPropertyValue("--mui-descriptions-columns")).toBe("3")
    expect(getComputedStyle(nested).getPropertyValue("--mui-descriptions-label-align")).toBe("start")
    expect(getComputedStyle(nested.firstElementChild!).gridTemplateColumns).toBe("minmax(0, 1fr)")
    expect(getComputedStyle(outside).margin).toBe(margin)
  })

  it("provides author-controlled responsive span resets plus print and forced-color fallbacks", () => {
    expect(appCss).toContain("@media (max-width: 40rem)")
    expect(appCss).toContain(".responsive-descriptions > .mui-description-item { --mui-description-span: 1; }")
    expect(appCss).toContain(".span-all { grid-column: 1 / -1; }")
    expect(css).toContain("overflow-wrap: anywhere")
    expect(css).toContain("@media print")
    expect(css).toContain("break-inside: avoid")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("color: CanvasText")
    expect(css).not.toContain("transition:")
  })
})
