import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "table", "table.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "table.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "table.css"), "utf8")
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

describe("CSS-only native Table", () => {
  it("ships no renderer, data-grid dependency, wrapper components or runtime", () => {
    expect(pkg.exports["./table/style.css"]).toBe("./dist/markup-ui-table.css")
    expect(pkg.exports["./table"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "table"))).toEqual(["table.css"])
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-table")).toBeUndefined()
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-advanced")
    expect(demo).not.toContain("markup-ui-table.js")
  })

  it("preserves native table, rowgroup, row, header and cell rendering", () => {
    fixture()
    install()
    const table = document.querySelector("#report-table")!
    expect(getComputedStyle(table).display).toBe("table")
    expect(getComputedStyle(document.querySelector("#report-head")!).display).toBe("table-header-group")
    expect(getComputedStyle(document.querySelector("#report-body")!).display).toBe("table-row-group")
    expect(getComputedStyle(document.querySelector("#alpha-row")!).display).toBe("table-row")
    expect(getComputedStyle(document.querySelector("#alpha-header")!).display).toBe("table-cell")
    expect([...table.children].every(child => ["CAPTION", "COLGROUP", "THEAD", "TBODY", "TFOOT"].includes(child.tagName))).toBe(true)
    expect(document.querySelectorAll(".mui-table[role], .mui-table [aria-sort], .mui-table tr[tabindex]")).toHaveLength(0)
    expect(css).not.toContain("display: grid")
    expect(css).not.toContain("display: block")
  })

  it("retains authored captions, scope/headers associations, colgroups and native spans", () => {
    fixture()
    const table = document.querySelector<HTMLTableElement>("#report-table")!
    const before = table.outerHTML
    install()
    expect(table.outerHTML).toBe(before)
    expect(table.caption?.id).toBe("report-caption")
    expect(document.querySelector("#alpha-header")!.getAttribute("scope")).toBe("row")
    expect(document.querySelector("#hours-header")!.getAttribute("scope")).toBe("colgroup")
    expect(document.querySelector<HTMLTableCellElement>("#project-column-header")!.rowSpan).toBe(2)
    expect(document.querySelector<HTMLTableCellElement>("#hours-header")!.colSpan).toBe(2)
    expect(document.querySelector<HTMLTableCellElement>("#team-a")!.rowSpan).toBe(2)
    expect(document.querySelector<HTMLTableColElement>("#hours-colgroup")!.span).toBe(2)
    for (const cell of document.querySelectorAll<HTMLTableCellElement>(".mui-table [headers]")) {
      for (const id of cell.headers.split(" ")) expect(document.getElementById(id)?.tagName).toBe("TH")
    }
  })

  it("keeps border axes distinct: single-line means columns, not nowrap", () => {
    expect(css).toContain('table.mui-table[data-single-line="false"]')
    expect(css).toContain("border-inline-end-width: 1px")
    expect(css).toContain("table.mui-table[data-single-column] > :is(tbody, tfoot)")
    expect(css).toContain("border-block-end-width: 0")
    expect(css).not.toContain("nowrap")
    expect(css).not.toContain(":hover")
    expect(css).toContain("border-collapse: collapse")
  })

  it("limits bottom-bordered opt-out to borderless tables using native perimeter conflict rules", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#attribute-table")!
    const bottomRule = 'table.mui-table[data-bordered="false"]:not([data-bottom-bordered="false"])'
    root.dataset.bottomBordered = "false"
    expect(root.matches(bottomRule)).toBe(false)
    expect(root.hasAttribute("data-bordered")).toBe(false)
    root.dataset.bordered = "false"
    expect(root.matches(bottomRule)).toBe(false)
    root.removeAttribute("data-bottom-bordered")
    expect(root.matches(bottomRule)).toBe(true)
    expect(css).toContain(bottomRule)
    expect(css).toContain("border-style: hidden")
  })

  it("retains native width/alignment hints and allows author CSS to override defaults", () => {
    fixture()
    install()
    expect(document.querySelector<HTMLTableElement>("#attribute-table")!.width).toBe("360")
    expect(document.querySelector("#aligned-cell")!.getAttribute("align")).toBe("right")
    expect(css).toContain("table.mui-table:not([width])")
    expect(css).toContain(":is(th, td):not([align])")
    expect(appCss).toContain(".numeric { text-align: end; }")
    expect(document.querySelector("#alpha-planned")!.classList.contains("numeric")).toBe(true)
  })

  it("has small/medium/large density presets with safe unknown-size fallback", () => {
    fixture()
    install()
    const root = document.querySelector<HTMLElement>("#attribute-table")!
    expect(getComputedStyle(root).getPropertyValue("--_mui-table-padding")).toBe("12px")
    root.dataset.size = "small"
    expect(getComputedStyle(root).getPropertyValue("--_mui-table-padding")).toBe("6px")
    root.dataset.size = "large"
    expect(getComputedStyle(root).getPropertyValue("--_mui-table-padding")).toBe("12px")
    expect(getComputedStyle(root).getPropertyValue("--_mui-table-font-size")).toBe("15px")
    root.dataset.size = "unknown"
    expect(getComputedStyle(root).getPropertyValue("--_mui-table-font-size")).toBe("14px")
  })

  it("uses scoped light/dark Table colors rather than unrelated legacy surface tokens", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const light = rules.find(rule => rule.selectorText === ':where([data-mui-theme="light"])')!
    const dark = rules.find(rule => rule.selectorText === ':where([data-mui-theme="dark"])')!
    expect(light.style.getPropertyValue("--_mui-table-color")).toBe("#333639")
    expect(light.style.getPropertyValue("--_mui-table-header-background")).toBe("#fafafc")
    expect(light.style.getPropertyValue("--_mui-table-border-color")).toBe("#efeff5")
    expect(dark.style.getPropertyValue("--_mui-table-background")).toBe("#18181c")
    expect(dark.style.getPropertyValue("--_mui-table-header-background")).toBe("#26262a")
    expect(dark.style.getPropertyValue("--_mui-table-striped-background")).toBe("#242427")
    expect(css).not.toContain("--mui-bg-")
    expect(css).not.toContain("--mui-text-primary")
  })

  it("retains independent header color/weight and line-height author overrides", () => {
    expect(css).toContain("var(--mui-table-header-weight, 500)")
    expect(css).toContain("var(--mui-table-header-color, var(--mui-table-color,")
    expect(css).toContain("line-height: var(--mui-table-line-height, 1.6)")
    expect(css).toContain("font-variant-numeric: tabular-nums")
  })

  it("stops scoped color transitions for reduced motion without adding runtime animation", () => {
    install()
    const reduced = [...style!.sheet!.cssRules].find(rule =>
      rule.type === CSSRule.MEDIA_RULE && (rule as CSSMediaRule).conditionText === "(prefers-reduced-motion: reduce)") as CSSMediaRule
    expect((reduced.cssRules[0] as CSSStyleRule).style.getPropertyValue("transition")).toBe("none")
    expect(css).not.toContain("@keyframes")
  })

  it("confines striping to body cells and supports visible-row filtering without a controller", () => {
    fixture()
    install()
    expect(css).toContain("table.mui-table[data-striped] > tbody > tr:nth-of-type(even)")
    expect(css).toContain("@supports selector(:nth-child(2 of tr:not([hidden])))")
    expect(css).toContain("tr:nth-child(even of tr:not([hidden]))")
    const visible = [...document.querySelectorAll("#report-body > tr:not([hidden])")]
    expect(visible.map(row => row.id)).toEqual(["alpha-row", "beta-row"])
    expect(document.querySelector("#native-template")!.tagName).toBe("TEMPLATE")
  })

  it("does not apply cell borders/padding/striping to nested or unrelated plain tables", () => {
    fixture()
    const cells = [document.querySelector("#nested-plain td")!, document.querySelector("#outside-table td")!]
    const before = cells.map(cell => [getComputedStyle(cell).padding, getComputedStyle(cell).border, getComputedStyle(cell).backgroundColor])
    install()
    expect(cells.map(cell => [getComputedStyle(cell).padding, getComputedStyle(cell).border, getComputedStyle(cell).backgroundColor])).toEqual(before)
    expect(getComputedStyle(document.querySelector("#nested-plain")!).display).toBe("table")
  })

  it("preserves hidden tables/rows/templates and authored row/cell identity across updates", () => {
    fixture()
    const table = document.querySelector<HTMLTableElement>("#report-table")!
    const nodes = [...table.querySelectorAll("*")]
    install()
    for (const id of ["hidden-table", "hidden-first", "hidden-middle", "hidden-last", "native-template"]) {
      expect(getComputedStyle(document.getElementById(id)!).display).toBe("none")
    }
    table.remove()
    document.body.append(table)
    expect([...table.querySelectorAll("*")]).toEqual(nodes)
    const row = table.tBodies[0].insertRow()
    const cell = row.insertCell()
    cell.textContent = "<script>Plain data</script>"
    expect(cell.querySelector("script")).toBeNull()
    expect(table.tBodies[0].lastElementChild).toBe(row)
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.querySelector("tr")).not.toBeNull()
  })

  it("keeps native cell controls, listeners, validation, disabling and form reset", () => {
    fixture()
    const form = document.querySelector<HTMLFormElement>("#note-form")!
    const input = document.querySelector<HTMLInputElement>("#note")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    install()
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
    expect(input.labels?.[0]?.textContent).toBe("Note for Alpha")
  })

  it("uses explicit native scrolling and print/forced-color fallbacks without changing table display", () => {
    fixture()
    install()
    const scroll = document.querySelector("#report-scroll")!
    expect(scroll.getAttribute("role")).toBe("region")
    expect(scroll.getAttribute("aria-labelledby")).toBe("report-caption")
    expect(scroll.getAttribute("tabindex")).toBe("0")
    expect(getComputedStyle(scroll).overflowX).toBe("auto")
    expect(css).toContain("@media print")
    expect(css).toContain("overflow: visible !important")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("border-color: CanvasText")
    expect(appCss).toContain(".wide-table { min-inline-size: 0; }")
    expect(css).not.toContain("overflow: hidden")
  })
})
