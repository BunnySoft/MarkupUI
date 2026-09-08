import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "grid", "grid.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "grid.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "grid.css"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void { document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>")) }
afterEach(() => { style?.remove(); style = undefined; document.body.replaceChildren() })

describe("CSS-only native Grid and GridItem", () => {
  it("exports independent CSS without a parser, controller, dependency or registration", () => {
    expect(pkg.exports["./grid/style.css"]).toBe("./dist/markup-ui-grid.css")
    expect(pkg.exports["./grid"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "grid"))).toEqual(["grid.css"])
    expect(customElements.get("mui-grid")).toBeUndefined()
    expect(demo).not.toContain("<script")
    expect(css).not.toContain("@import")
  })

  it("keeps every original native child instead of filtering for a GridItem constructor", () => {
    fixture()
    const root = document.querySelector("#fixed")!
    const nodes = [...root.childNodes]
    const before = root.outerHTML
    install()
    expect(root.outerHTML).toBe(before)
    expect([...root.childNodes]).toEqual(nodes)
    expect(root.querySelector("#plain-child")?.tagName).toBe("P")
    expect(root.querySelector("#plain-child")?.classList.contains("mui-grid-item")).toBe(false)
    expect(document.querySelector('[role="grid"],[role="row"],[role="gridcell"]')).toBeNull()
  })

  it("defines independent 24-column/zero-gap roots and one-span/auto-start child defaults", () => {
    fixture()
    install()
    const root = getComputedStyle(document.querySelector("#default-grid")!)
    const item = getComputedStyle(document.querySelector("#inner-first")!)
    expect(root.getPropertyValue("--mui-grid-cols").trim()).toBe("24")
    expect(root.getPropertyValue("--mui-grid-x-gap").trim()).toBe("0px")
    expect(root.getPropertyValue("--mui-grid-y-gap").trim()).toBe("0px")
    expect(item.getPropertyValue("--mui-grid-span").trim()).toBe("1")
    expect(item.getPropertyValue("--mui-grid-start").trim()).toBe("auto")
    expect(css).toContain("--mui-grid-tracks: initial")
    expect(css).toContain("grid-auto-flow: row")
  })

  it("keeps direct native CSS placement and distinguishes an authored spacer from a start line", () => {
    fixture()
    install()
    const spacer = document.querySelector("#authored-spacer")!
    expect(spacer.getAttribute("aria-hidden")).toBe("true")
    expect(spacer.parentElement?.lastElementChild?.id).toBe("after-spacer")
    expect(document.querySelector("#absolute-third")?.classList.contains("start-three")).toBe(true)
    expect(css).toContain("grid-column: var(--mui-grid-start) / span var(--mui-grid-span)")
    expect(css).not.toContain("--mui-grid-offset")
    expect(css).not.toContain("margin-left")
  })

  it("uses a separate query container and descendant-only native responsive rules", () => {
    fixture()
    install()
    const wrapper = document.querySelector("#query-container")!
    const grid = document.querySelector("#self-grid")!
    expect(wrapper.contains(grid)).toBe(true)
    expect(wrapper.classList.contains("mui-grid")).toBe(false)
    expect(css).toContain("container-type: inline-size")
    expect(appCss).toContain("@container example-grid (min-width: 30rem)")
    expect(appCss).toContain("@media (min-width: 48rem)")
    expect(appCss).toContain(".self-grid > .self-feature")
    expect(css).not.toContain("@container")
    expect(css).not.toContain("@media")
  })

  it("allows application CSS to override low-specificity defaults without inherited span leakage", () => {
    fixture()
    install()
    style!.textContent += '\n.span-two { --mui-grid-span: 2; }.four-columns { --mui-grid-cols: 4; --mui-grid-x-gap: 12px; }.inner-grid { --mui-grid-cols: 2; --mui-grid-x-gap: 4px; }'
    const inner = getComputedStyle(document.querySelector("#inner-grid")!)
    const child = getComputedStyle(document.querySelector("#inner-first")!)
    expect(inner.getPropertyValue("--mui-grid-cols").trim()).toBe("2")
    expect(inner.getPropertyValue("--mui-grid-span").trim()).toBe("2")
    expect(inner.getPropertyValue("--mui-grid-x-gap").trim()).toBe("4px")
    expect(child.getPropertyValue("--mui-grid-span").trim()).toBe("1")
    expect(child.getPropertyValue("--mui-grid-start").trim()).toBe("auto")
  })

  it("preserves native hidden roots/items/templates instead of treating invalid CSS span zero as hiding", () => {
    fixture()
    install()
    for (const n of document.querySelectorAll("#hidden-root,#hidden-item,#native-template")) expect(getComputedStyle(n).display).toBe("none")
    const item = document.querySelector<HTMLElement>("#fixed-first")!
    item.style.setProperty("--mui-grid-span", "0")
    expect(item.hasAttribute("hidden")).toBe(false)
    expect(getComputedStyle(item).display).not.toBe("none")
    expect(document.querySelector("template")?.content.textContent).toBe("Inert authored template")
  })

  it("uses real native details and explicit preview/extra grids without a row-packing algorithm", () => {
    fixture()
    const details = document.querySelector<HTMLDetailsElement>("#more-results")!
    const summary = document.querySelector<HTMLElement>("#more-summary")!
    const extra = document.querySelector("#extra-link")!
    install()
    expect(details.open).toBe(false)
    summary.click()
    expect(details.open).toBe(true)
    summary.click()
    expect(details.open).toBe(false)
    expect(details.querySelector("#extra-link")).toBe(extra)
    expect(details.contains(document.querySelector("#preview-grid"))).toBe(false)
    expect(css).not.toContain("max-height")
    expect(css).not.toContain("overflow: hidden")
    expect(css).not.toContain("collapsed-rows")
  })

  it("keeps trailing actions explicit and never injects an overflow signal into item content", () => {
    fixture()
    const root = document.querySelector("#trailing-grid")!
    const action = document.querySelector("#trailing-action")!
    const before = root.outerHTML
    install()
    expect(root.lastElementChild).toBe(action)
    expect(root.outerHTML).toBe(before)
    expect(appCss).toContain("grid-column: 1 / -1")
    expect(css).not.toContain("suffix")
    expect(css).not.toContain("overflow:")
  })

  it("preserves native lists, markers, links and form/reset/disabled semantics", () => {
    fixture()
    const list = document.querySelector("#native-list")!
    const form = document.querySelector("form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    const first = list.firstElementChild!
    let submits = 0
    let disabled = 0
    form.addEventListener("submit", (event) => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabled++)
    install()
    expect(first.tagName).toBe("LI")
    expect(getComputedStyle(first).display).toBe("list-item")
    input.value = "Edited"
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(submits).toBe(1)
    expect(disabled).toBe(0)
    expect(form.getAttribute("method")).toBe("get")
  })

  it("preserves late children, item styles and native listeners after reconnect", () => {
    fixture()
    const root = document.querySelector("#fixed")!
    const item = document.createElement("button")
    item.type = "button"
    item.className = "mui-grid-item"
    item.setAttribute("style", "color: red")
    let calls = 0
    item.addEventListener("click", () => calls++)
    install()
    root.append(item)
    root.remove()
    document.body.append(root)
    item.click()
    expect(root.lastElementChild).toBe(item)
    expect(calls).toBe(1)
    expect(item.getAttribute("style")).toBe("color: red")
  })

  it("keeps native direction/order and out-of-scope layout without dense packing or global resets", () => {
    fixture()
    const outside = document.querySelector("#outside")!
    const before = getComputedStyle(outside).display
    install()
    expect(document.querySelector("#rtl-grid")?.firstElementChild?.id).toBe("rtl-first")
    expect(document.querySelector("section[dir]")?.getAttribute("dir")).toBe("rtl")
    expect(getComputedStyle(outside).display).toBe(before)
    expect(css).not.toContain("dense")
    expect(css).not.toContain("reverse")
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:order|direction):/m)
    expect(css).not.toContain("font")
    expect(css).not.toContain("list-style")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("@keyframes")
  })
})
