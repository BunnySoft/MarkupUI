import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Table, MTable, registerTable, tableSizes } from "../src/components/table/index.js"
import * as tableApi from "../src/components/table/index.js"
import { ViewElement } from "../src/core/index.js"
import "../src/components/button/index.js"
import "../src/components/typography/index.js"

const css = readFileSync(resolve("src", "components", "table", "table.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "table.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "table.css"), "utf8")
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
  vi.restoreAllMocks()
})

describe("canonical Table element", () => {
  it("registers canonical Table with own tag, shared ViewElement identity and registration conflict safety", () => {
    expect(Object.keys(tableApi).sort()).toEqual(["MTable", "Table", "registerTable", "tableSizes"])
    expect(Table.tag).toBe("m-table")
    expect(MTable).toBe(Table)
    expect(Table.prototype instanceof ViewElement).toBe(true)
    expect(customElements.get("m-table")).toBe(Table)
    expect("meta" in Table).toBe(false)
    expect(Table.observedAttributes).toEqual([
      "bordered",
      "bottom-bordered",
      "single-line",
      "single-column",
      "size",
      "striped",
    ])
    const define = vi.fn()
    expect(() => registerTable({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerTable()).not.toThrow()
  })

  it("maintains default property values and reflects boolean and enum attributes cleanly", () => {
    const table = new Table()
    expect([table.bordered, table.bottomBordered, table.singleLine, table.singleColumn, table.size, table.striped]).toEqual([
      true, true, true, false, "medium", false,
    ])
    table.bordered = false
    expect(table.bordered).toBe(false)
    expect(table.getAttribute("bordered")).toBe("false")
    table.bordered = true
    expect(table.bordered).toBe(true)
    expect(table.getAttribute("bordered")).toBe("true")

    table.bottomBordered = false
    expect(table.bottomBordered).toBe(false)
    expect(table.getAttribute("bottom-bordered")).toBe("false")
    table.bottomBordered = true
    expect(table.bottomBordered).toBe(true)
    expect(table.getAttribute("bottom-bordered")).toBe("true")

    table.singleLine = false
    expect(table.singleLine).toBe(false)
    expect(table.getAttribute("single-line")).toBe("false")
    table.singleLine = true
    expect(table.singleLine).toBe(true)
    expect(table.getAttribute("single-line")).toBe("true")

    table.singleColumn = true
    expect(table.singleColumn).toBe(true)
    expect(table.hasAttribute("single-column")).toBe(true)
    table.singleColumn = false
    expect(table.singleColumn).toBe(false)
    expect(table.hasAttribute("single-column")).toBe(false)

    table.striped = true
    expect(table.striped).toBe(true)
    expect(table.hasAttribute("striped")).toBe(true)
    table.striped = false
    expect(table.striped).toBe(false)
    expect(table.hasAttribute("striped")).toBe(false)

    for (const size of tableSizes) {
      table.size = size
      expect(table.size).toBe(size)
      expect(table.getAttribute("size")).toBe(size)
    }

    expect(() => { (table as any).size = "huge" }).toThrow(RangeError)
    expect(() => { (table as any).bordered = "yes" }).toThrow(RangeError)
    expect(() => { (table as any).bottomBordered = 1 }).toThrow(RangeError)
    expect(() => { (table as any).singleLine = null }).toThrow(RangeError)
    expect(() => { (table as any).singleColumn = "true" }).toThrow(RangeError)
    expect(() => { (table as any).striped = 0 }).toThrow(RangeError)
  })

  it("rejects invalid attributes on property read and supports pre-upgrade properties", () => {
    const table = new Table()
    table.setAttribute("size", "invalid")
    expect(() => table.size).toThrow(RangeError)
    table.setAttribute("bordered", "invalid")
    expect(() => table.bordered).toThrow(RangeError)
    table.setAttribute("bottom-bordered", "invalid")
    expect(() => table.bottomBordered).toThrow(RangeError)
    table.setAttribute("single-line", "invalid")
    expect(() => table.singleLine).toThrow(RangeError)

    const late = document.createElement("m-table") as Table
    late.size = "small"
    late.striped = true
    late.singleColumn = true
    late.bordered = false
    document.body.append(late)
    expect(late.size).toBe("small")
    expect(late.striped).toBe(true)
    expect(late.singleColumn).toBe(true)
    expect(late.bordered).toBe(false)
    expect(late.getAttribute("size")).toBe("small")
    expect(late.hasAttribute("striped")).toBe(true)
    expect(late.hasAttribute("single-column")).toBe(true)
    expect(late.getAttribute("bordered")).toBe("false")
  })

  it("adopts authored table elements and synchronizes dataset attributes", () => {
    const root = document.createElement("m-table") as Table
    root.size = "small"
    root.striped = true
    root.singleColumn = true
    root.singleLine = false
    root.bordered = false
    root.bottomBordered = false

    const inner = document.createElement("table")
    const tbody = document.createElement("tbody")
    const tr = document.createElement("tr")
    const td = document.createElement("td")
    td.textContent = "Cell"
    tr.append(td)
    tbody.append(tr)
    inner.append(tbody)
    root.append(inner)
    document.body.append(root)

    expect(root.native).toBe(inner)
    expect(inner.classList.contains("m-table")).toBe(true)
    expect(inner.dataset.size).toBe("small")
    expect(inner.hasAttribute("data-striped")).toBe(true)
    expect(inner.hasAttribute("data-single-column")).toBe(true)
    expect(inner.dataset.singleLine).toBe("false")
    expect(inner.dataset.bordered).toBe("false")
    expect(inner.dataset.bottomBordered).toBe("false")
  })

  it("preserves native table, rowgroup, row, header and cell rendering", () => {
    fixture()
    install()
    const table = document.querySelector<Table>("#report-table")!
    expect(table).toBeInstanceOf(Table)
    const nativeTable = table.native ?? table.querySelector("table")!
    expect(getComputedStyle(nativeTable).display).toBe("table")
    expect(getComputedStyle(document.querySelector("#report-head")!).display).toBe("table-header-group")
    expect(getComputedStyle(document.querySelector("#report-body")!).display).toBe("table-row-group")
    expect(getComputedStyle(document.querySelector("#alpha-row")!).display).toBe("table-row")
    expect(getComputedStyle(document.querySelector("#alpha-header")!).display).toBe("table-cell")
    expect([...nativeTable.children].every(child => ["CAPTION", "COLGROUP", "THEAD", "TBODY", "TFOOT"].includes(child.tagName))).toBe(true)
    expect(document.querySelectorAll(".m-table[role], .m-table [aria-sort], .m-table tr[tabindex]")).toHaveLength(0)
    expect(css).not.toContain("display: grid")
  })

  it("retains authored captions, scope/headers associations, colgroups and native spans", () => {
    fixture()
    const table = document.querySelector<Table>("#report-table")!
    const nativeTable = table.native ?? table.querySelector("table")!
    const before = nativeTable.outerHTML
    install()
    expect(nativeTable.outerHTML).toBe(before)
    expect(table.caption?.id).toBe("report-caption")
    expect(document.querySelector("#alpha-header")!.getAttribute("scope")).toBe("row")
    expect(document.querySelector("#hours-header")!.getAttribute("scope")).toBe("colgroup")
    expect(document.querySelector<HTMLTableCellElement>("#project-column-header")!.rowSpan).toBe(2)
    expect(document.querySelector<HTMLTableCellElement>("#hours-header")!.colSpan).toBe(2)
    expect(document.querySelector<HTMLTableCellElement>("#team-a")!.rowSpan).toBe(2)
    expect(document.querySelector<HTMLTableColElement>("#hours-colgroup")!.span).toBe(2)
    for (const cell of document.querySelectorAll<HTMLTableCellElement>(".m-table [headers]")) {
      for (const id of cell.headers.split(" ")) expect(document.getElementById(id)?.tagName).toBe("TH")
    }
  })

  it("keeps border axes distinct: single-line means columns, not nowrap", () => {
    expect(css).toContain('table.m-table[data-single-line="false"]')
    expect(css).toContain("border-inline-end-width: 1px")
    expect(css).toContain("table.m-table[data-single-column] > :is(tbody, tfoot)")
    expect(css).toContain("border-block-end-width: 0")
    expect(css).not.toContain("nowrap")
    expect(css).not.toContain(":hover")
    expect(css).toContain("border-collapse: collapse")
  })

  it("limits bottom-bordered opt-out to borderless tables using native perimeter conflict rules", () => {
    fixture()
    install()
    const root = document.querySelector<Table>("#attribute-table")!
    const bottomRule = 'table.m-table[data-bordered="false"]:not([data-bottom-bordered="false"]'
    const native = root.native ?? root.querySelector("table")!
    native.dataset.bottomBordered = "false"
    expect(native.matches('table.m-table[data-bordered="false"]:not([data-bottom-bordered="false"], [bottom-bordered="false"])')).toBe(false)
    expect(native.hasAttribute("data-bordered")).toBe(false)
    native.dataset.bordered = "false"
    expect(native.matches('table.m-table[data-bordered="false"]:not([data-bottom-bordered="false"], [bottom-bordered="false"])')).toBe(false)
    native.removeAttribute("data-bottom-bordered")
    expect(native.matches('table.m-table[data-bordered="false"]:not([data-bottom-bordered="false"], [bottom-bordered="false"])')).toBe(true)
    expect(css).toContain(bottomRule)
    expect(css).toContain("border-style: hidden")
  })

  it("retains native width/alignment hints and allows author CSS to override defaults", () => {
    fixture()
    install()
    const table = document.querySelector<Table>("#attribute-table")!
    const native = table.native ?? table.querySelector("table")!
    expect(native.width).toBe("360")
    expect(document.querySelector("#aligned-cell")!.getAttribute("align")).toBe("right")
    expect(css).toContain("table.m-table:not([width])")
    expect(css).toContain(":is(th, td):not([align])")
    expect(appCss).toContain(".numeric { text-align: end; }")
    expect(document.querySelector("#alpha-planned")!.classList.contains("numeric")).toBe(true)
  })

  it("has small/medium/large density presets with safe unknown-size fallback", () => {
    fixture()
    install()
    const root = document.querySelector<Table>("#attribute-table")!
    const native = root.native ?? root.querySelector("table")!
    expect(getComputedStyle(native).getPropertyValue("--_m-table-padding")).toBe("12px")
    root.size = "small"
    expect(getComputedStyle(native).getPropertyValue("--_m-table-padding")).toBe("6px")
    root.size = "large"
    expect(getComputedStyle(native).getPropertyValue("--_m-table-padding")).toBe("12px")
    expect(getComputedStyle(native).getPropertyValue("--_m-table-font-size")).toBe("15px")
    native.dataset.size = "unknown"
    expect(getComputedStyle(native).getPropertyValue("--_m-table-font-size")).toBe("14px")
  })

  it("uses scoped light/dark Table colors rather than unrelated legacy surface tokens", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const light = rules.find(rule => rule.selectorText === ':where([data-m-theme="light"])')!
    const dark = rules.find(rule => rule.selectorText === ':where([data-m-theme="dark"])')!
    expect(light.style.getPropertyValue("--_m-table-color")).toBe("#333639")
    expect(light.style.getPropertyValue("--_m-table-header-background")).toBe("#fafafc")
    expect(light.style.getPropertyValue("--_m-table-border-color")).toBe("#efeff5")
    expect(dark.style.getPropertyValue("--_m-table-background")).toBe("#18181c")
    expect(dark.style.getPropertyValue("--_m-table-header-background")).toBe("#26262a")
    expect(dark.style.getPropertyValue("--_m-table-striped-background")).toBe("#242427")
    expect(css).not.toContain("--m-bg-")
    expect(css).not.toContain("--m-text-primary")
  })

  it("retains independent header color/weight and line-height author overrides", () => {
    expect(css).toContain("var(--m-table-header-weight, 500)")
    expect(css).toContain("var(--m-table-header-color, var(--m-table-color,")
    expect(css).toContain("line-height: var(--m-table-line-height, 1.6)")
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
    expect(css).toContain("table.m-table[data-striped] > tbody > tr:nth-of-type(even)")
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
    expect(getComputedStyle(document.querySelector("#outside-table")!).display).toBe("table")
  })

  it("preserves hidden tables/rows/templates and authored row/cell identity across updates", () => {
    fixture()
    const table = document.querySelector<Table>("#report-table")!
    const nativeTable = table.native ?? table.querySelector("table")!
    const nodes = [...nativeTable.querySelectorAll("*")]
    install()
    for (const id of ["hidden-table", "hidden-first", "hidden-middle", "hidden-last", "native-template"]) {
      expect(getComputedStyle(document.getElementById(id)!).display).toBe("none")
    }
    table.remove()
    document.body.append(table)
    expect([...nativeTable.querySelectorAll("*")]).toEqual(nodes)
    const row = nativeTable.tBodies[0].insertRow()
    const cell = row.insertCell()
    cell.textContent = "<script>Plain data</script>"
    expect(cell.querySelector("script")).toBeNull()
    expect(nativeTable.tBodies[0].lastElementChild).toBe(row)
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
    document.querySelector<HTMLElement>("#native-submit")!.click()
    expect(submits).toBe(0)
    input.value = "Edited"
    document.querySelector<HTMLElement>("#native-submit")!.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["note", "Edited"]])
    document.querySelector<HTMLElement>("#native-reset")!.click()
    document.querySelector<HTMLElement>("#native-disabled")!.click()
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

  it("follows the standard demo scaffold, generated API documentation and m-* component usage", () => {
    const demoJs = readFileSync(resolve("demo", "components", "table.js"), "utf8")
    expect(demo).toContain("data-demo-page")
    expect(demo).toContain("component-docs")
    expect(demo).toContain("component-setup")
    expect(demo).toContain("table-api")
    expect(demoJs).toContain("loadComponentApi")
    expect(demo).toContain("<m-table")
    expect(demo).toContain("<m-button")
    expect(demo).toContain("<m-heading")
    expect(demo).toContain("<m-p")
    expect(demo).toContain("<m-text")

    const apiDocs = JSON.parse(readFileSync(resolve("demo", "api", "table.json"), "utf8"))
    expect(apiDocs.elements).toHaveLength(1)
    const [tableMeta] = apiDocs.elements
    expect(tableMeta.type).toBe("Table")
    expect(tableMeta.web.primary).toBe("m-table")
    expect(tableMeta.properties.bordered).toMatchObject({ default: true, encoding: "boolean", attribute: "bordered" })
    expect(tableMeta.properties.bottomBordered).toMatchObject({ default: true, encoding: "boolean", attribute: "bottom-bordered" })
    expect(tableMeta.properties.singleLine).toMatchObject({ default: true, encoding: "boolean", attribute: "single-line" })
    expect(tableMeta.properties.singleColumn).toMatchObject({ default: false, encoding: "presence", attribute: "single-column" })
    expect(tableMeta.properties.striped).toMatchObject({ default: false, encoding: "presence", attribute: "striped" })
    expect(tableMeta.properties.size).toMatchObject({ default: "medium", values: ["small", "medium", "large"], attribute: "size" })
  })
})
