import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { createContext, runInContext } from "node:vm"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutSider,
  isLayoutElement,
  layoutPositions,
  registerLayout,
  siderSides,
} from "../src/components/layout/index.js"
import * as layoutApi from "../src/components/layout/index.js"
import { ViewElement } from "../src/core/index.js"

const css = readFileSync("src\\components\\layout\\layout.css", "utf8")
const demo = readFileSync("demo\\components\\layout.html", "utf8")
const appCss = readFileSync("demo\\components\\layout.css", "utf8")
const app = readFileSync("demo\\components\\layout.js", "utf8")
const pkg = JSON.parse(readFileSync("package.json", "utf8"))
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

describe("direct native Layout family", () => {
  it("registers exactly the family with own tags, shared core and atomic conflicts", () => {
    expect(Object.keys(layoutApi).sort()).toEqual([
      "Layout",
      "LayoutContent",
      "LayoutFooter",
      "LayoutHeader",
      "LayoutSider",
      "isLayoutElement",
      "layoutPositions",
      "registerLayout",
      "siderSides",
    ])
    const classes = [Layout, LayoutHeader, LayoutContent, LayoutFooter, LayoutSider]
    for (const type of classes) {
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(type.prototype instanceof ViewElement).toBe(true)
      expect(customElements.get(type.tag)).toBe(type)
      expect("meta" in type).toBe(false)
    }
    expect(Layout.observedAttributes).toEqual(["has-sider", "embedded", "position"])
    expect(LayoutContent.observedAttributes).toEqual(["embedded", "position"])
    expect(LayoutHeader.observedAttributes).toEqual(["bordered", "inverted", "position"])
    expect(LayoutFooter.observedAttributes).toEqual(["bordered", "inverted", "position"])
    expect(LayoutSider.observedAttributes).toEqual(["bordered", "inverted", "position", "side", "width", "collapsed-width", "collapsed"])

    const define = vi.fn()
    expect(() => registerLayout({ get: name => name === "m-layout-sider" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerLayout()).not.toThrow()
  })

  it("retains native defaults, flow positioning and null dimensions", () => {
    const layout = new Layout()
    const content = new LayoutContent()
    const header = new LayoutHeader()
    const footer = new LayoutFooter()
    const sider = new LayoutSider()

    expect([layout.hasSider, layout.embedded, layout.position]).toEqual([false, false, "static"])
    expect([content.embedded, content.position]).toEqual([false, "static"])
    expect([header.bordered, header.inverted, header.position]).toEqual([false, false, "static"])
    expect([footer.bordered, footer.inverted, footer.position]).toEqual([false, false, "static"])
    expect([sider.bordered, sider.inverted, sider.position, sider.side, sider.width, sider.collapsedWidth, sider.collapsed]).toEqual([
      false, false, "static", "start", null, null, false,
    ])

    layout.append(header, sider, content, footer)
    document.body.append(layout)
    install()

    expect(layout.attributes).toHaveLength(0)
    expect(content.attributes).toHaveLength(0)
    expect(header.attributes).toHaveLength(0)
    expect(footer.attributes).toHaveLength(0)
    expect(sider.attributes).toHaveLength(0)

    const layoutStyle = getComputedStyle(layout)
    expect(layoutStyle.display).toBe("flex")
    expect(layoutStyle.flexDirection).toBe("column")
    expect(getComputedStyle(sider).inlineSize).toBe("var(--_m-layout-sider-width, var(--m-layout-sider-width, 272px))")
  })

  it("accepts typed choices and validates setters before mutation", () => {
    const layout = new Layout()
    layout.hasSider = true
    expect(layout.hasSider).toBe(true)
    expect(layout.getAttribute("has-sider")).toBe("")
    layout.hasSider = false
    expect(layout.hasSider).toBe(false)
    expect(layout.hasAttribute("has-sider")).toBe(false)

    layout.embedded = true
    expect(layout.embedded).toBe(true)
    expect(layout.getAttribute("embedded")).toBe("")
    layout.embedded = false
    expect(layout.hasAttribute("embedded")).toBe(false)

    for (const pos of layoutPositions) {
      layout.position = pos
      expect(layout.position).toBe(pos)
      expect(layout.getAttribute("position")).toBe(pos)
    }

    expect(() => { (layout as any).hasSider = "yes" }).toThrow(RangeError)
    expect(() => { (layout as any).embedded = 123 }).toThrow(RangeError)
    expect(() => { (layout as any).position = "fixed" }).toThrow(RangeError)

    const sider = new LayoutSider()
    sider.bordered = true
    expect(sider.bordered).toBe(true)
    sider.inverted = true
    expect(sider.inverted).toBe(true)
    sider.collapsed = true
    expect(sider.collapsed).toBe(true)

    for (const side of siderSides) {
      sider.side = side
      expect(sider.side).toBe(side)
      expect(sider.getAttribute("side")).toBe(side)
    }
    expect(() => { (sider as any).side = "left" }).toThrow(RangeError)

    sider.width = 300
    expect(sider.width).toBe(300)
    expect(sider.getAttribute("width")).toBe("300")
    sider.width = null
    expect(sider.width).toBeNull()
    expect(sider.hasAttribute("width")).toBe(false)

    sider.collapsedWidth = 60
    expect(sider.collapsedWidth).toBe(60)
    expect(sider.getAttribute("collapsed-width")).toBe("60")
    sider.collapsedWidth = null
    expect(sider.collapsedWidth).toBeNull()
    expect(sider.hasAttribute("collapsed-width")).toBe(false)

    expect(() => { sider.width = -10 }).toThrow(RangeError)
    expect(() => { sider.width = NaN }).toThrow(RangeError)
    expect(() => { sider.collapsedWidth = -5 }).toThrow(RangeError)
  })

  it("replays pre-upgrade properties in prototype order", () => {
    const element = document.createElement("m-layout") as Layout
    element.hasSider = true
    element.embedded = true
    element.position = "absolute"
    document.body.append(element)
    expect(element.hasSider).toBe(true)
    expect(element.embedded).toBe(true)
    expect(element.position).toBe("absolute")
    expect(element.getAttribute("has-sider")).toBe("")
    expect(element.getAttribute("embedded")).toBe("")
    expect(element.getAttribute("position")).toBe("absolute")

    const siderEl = document.createElement("m-layout-sider") as LayoutSider
    siderEl.bordered = true
    siderEl.side = "end"
    siderEl.width = 250
    document.body.append(siderEl)
    expect(siderEl.bordered).toBe(true)
    expect(siderEl.side).toBe("end")
    expect(siderEl.width).toBe(250)
    expect(siderEl.style.getPropertyValue("--_m-layout-sider-width")).toBe("250px")
  })

  it("writes sider dimensions via owned styles and restores on disconnect", () => {
    const sider = new LayoutSider()
    sider.width = 320
    sider.collapsedWidth = 64
    document.body.append(sider)
    expect(sider.style.getPropertyValue("--_m-layout-sider-width")).toBe("320px")
    expect(sider.style.getPropertyValue("--_m-layout-sider-collapsed-width")).toBe("64px")

    sider.remove()
    expect(sider.style.getPropertyValue("--_m-layout-sider-width")).toBe("")
    expect(sider.style.getPropertyValue("--_m-layout-sider-collapsed-width")).toBe("")
  })

  it("identifies layout elements with isLayoutElement", () => {
    expect(isLayoutElement(new Layout())).toBe(true)
    expect(isLayoutElement(new LayoutHeader())).toBe(true)
    expect(isLayoutElement(new LayoutContent())).toBe(true)
    expect(isLayoutElement(new LayoutFooter())).toBe(true)
    expect(isLayoutElement(new LayoutSider())).toBe(true)
    expect(isLayoutElement(document.createElement("div"))).toBe(false)
    expect(isLayoutElement(document.createElement("m-grid"))).toBe(false)
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
    expect(css).not.toMatch(/(?:^|[;{])\s*order:/m)
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
    expect(css).toContain("details.m-layout-sider:not([open])")
    expect(css).toContain("--m-layout-sider-collapsed-width, 48px")
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
    expect(app).not.toContain("m:scroll")
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

  it("keeps source CSS within its unchanged 1500 gzip-byte ceiling", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
  })

  it("defines only private theme and inverted defaults rather than overwriting author tokens", () => {
    install()
    const rules = [...style!.sheet!.cssRules] as CSSStyleRule[]
    const defaults = rules.filter(rule => rule.selectorText?.includes("data-m-theme") || rule.selectorText?.includes("data-inverted"))
    expect(defaults).toHaveLength(3)
    for (const rule of defaults) {
      for (let i = 0; i < rule.style.length; i++) expect(rule.style[i]).toMatch(/^--_m-layout-/)
    }
    expect(css).toContain("color: var(--m-layout-color, var(--_m-layout-color))")
    expect(css).toContain("background: var(--m-layout-background, var(--_m-layout-background))")
    expect(css).toContain("var(--m-layout-border-color, var(--_m-layout-border))")
  })

  it("preserves distinct body, surface, footer, embedded and inverted reference roles", () => {
    expect(css).toContain("--_m-layout-body: #101014")
    expect(css).toContain("--_m-layout-surface: #18181c")
    expect(css).toContain("--_m-layout-footer: #fafafc")
    expect(css).toContain("--_m-layout-embedded: #fafafc")
    expect(css).toContain("--_m-layout-text: rgb(255 255 255 / .82)")
    expect(css).toContain("--_m-layout-divider: rgb(255 255 255 / .09)")
    expect(css).toContain("--_m-layout-inverted: #001428")
    expect(css).toContain("--_m-layout-inverted: #18181c")
    expect(css).toContain("--_m-layout-background: var(--_m-layout-body, #fff)")
    expect(css).toContain("--_m-layout-background: var(--_m-layout-surface, #fff)")
    expect(css).toContain("--_m-layout-background: var(--_m-layout-footer, #fafafc)")
    expect(css).toContain("var(--m-layout-embedded-background, var(--m-layout-background, var(--_m-layout-embedded, #fafafc)))")
  })

  it("does not substitute unrelated shared legacy palette roles for Layout's theme values", () => {
    for (const token of ["--m-text-primary", "--m-bg-surface", "--m-bg-muted", "--m-border"]) {
      expect(css).not.toContain(token)
    }
    expect(css).not.toContain("color-scheme")
    expect(css).not.toContain("prefers-color-scheme")
    expect(css).not.toContain("font")
  })

  it("preserves direct authored geometry and palette on inverted regions", () => {
    document.body.innerHTML = '<header class="m-layout-header" data-inverted data-bordered style="color:purple;background:ivory;border-color:teal;--m-layout-background:ivory;--m-layout-color:purple;--m-layout-border-color:teal">Author</header>'
    const header = document.querySelector("header")!
    const before = header.outerHTML
    install()
    expect(header.outerHTML).toBe(before)
    expect(getComputedStyle(header).color).toBe("rgb(128, 0, 128)")
    expect(getComputedStyle(header).backgroundColor).toBe("rgb(255, 255, 240)")
    expect(getComputedStyle(header).getPropertyValue("--m-layout-background")).toBe("ivory")
  })
})

describe("Layout documentation and selected delivery", () => {
  it("generates the exact configured API and defaults from source", () => {
    const docs = JSON.parse(readFileSync("demo\\api\\layout.json", "utf8"))
    expect(docs.elements.map((element: any) => element.type)).toEqual([
      "Layout", "LayoutHeader", "LayoutContent", "LayoutFooter", "LayoutSider",
    ])
    const [layout, header, content, footer, sider] = docs.elements
    expect(Object.keys(layout.properties)).toEqual(["hasSider", "embedded", "position"])
    expect(layout.properties.hasSider).toMatchObject({ default: false, encoding: "presence", attribute: "has-sider" })
    expect(layout.properties.embedded).toMatchObject({ default: false, encoding: "presence", attribute: "embedded" })
    expect(layout.properties.position).toMatchObject({ default: "static", attribute: "position" })

    expect(Object.keys(header.properties)).toEqual(["bordered", "inverted", "position"])
    expect(header.properties.bordered).toMatchObject({ default: false, encoding: "presence", attribute: "bordered" })
    expect(header.properties.inverted).toMatchObject({ default: false, encoding: "presence", attribute: "inverted" })

    expect(Object.keys(content.properties)).toEqual(["embedded", "position"])
    expect(content.properties.embedded).toMatchObject({ default: false, encoding: "presence", attribute: "embedded" })

    expect(Object.keys(footer.properties)).toEqual(["bordered", "inverted", "position"])
    expect(footer.properties.bordered).toMatchObject({ default: false, encoding: "presence", attribute: "bordered" })

    expect(Object.keys(sider.properties)).toEqual(["bordered", "inverted", "position", "side", "width", "collapsedWidth", "collapsed"])
    expect(sider.properties.side).toMatchObject({ default: "start", attribute: "side" })
    expect(sider.properties.width).toMatchObject({ default: null, nullable: true, min: 0 })
    expect(sider.properties.collapsedWidth).toMatchObject({ default: null, nullable: true, min: 0 })
    expect(sider.properties.collapsed).toMatchObject({ default: false, encoding: "presence" })

    for (const el of docs.elements) {
      expect(el.events).toEqual([])
      expect(el.actions).toEqual([])
    }
  })

  it("uses shared demo/API/code/outline assets and real canonical examples", () => {
    const parsed = new DOMParser().parseFromString(demo, "text/html")
    expect(parsed.querySelector("main[data-demo-page].component-docs #layout-api")).not.toBeNull()
    const examples = parsed.querySelectorAll("[data-demo-example]")
    expect(examples.length).toBeGreaterThanOrEqual(5)
    for (const example of examples) {
      expect(example.querySelector("[data-demo-header] h2[id]")).not.toBeNull()
      expect(example.querySelector("[data-demo-preview]")).not.toBeNull()
    }
    const setup = parsed.querySelector("details.component-setup")!
    expect(setup.querySelector("code")!.textContent!.split("\n")).toHaveLength(3)
    expect(setup.querySelector("a")!.getAttribute("href")).toBe("../setup.html")
    for (const asset of ["../example-code.css", "../component-api.css", "../component-outline.js"]) expect(demo).toContain(asset)
    expect(readFileSync("demo\\components\\layout.js", "utf8")).toContain("loadComponentApi")
  })

  it("ships exactly core plus Layout, fails without core and rejects duplicate classic registration", () => {
    expect(pkg.exports["./layout"]).toEqual({ types: "./dist/components/layout/index.d.ts", import: "./dist/markup-ui-layout.js" })
    expect(pkg.exports["./layout/style.css"]).toBe("./dist/markup-ui-layout.css")
    const script = readFileSync("dist\\markup-ui-layout.global.js", "utf8")
    expect(() => runInContext(script, createContext({ HTMLElement }))).toThrow("Load compatible markup-ui-core.global.js")

    const entries = new Map<string, unknown>()
    const context = createContext({
      HTMLElement,
      customElements: {
        get: (name: string) => entries.get(name),
        define: (name: string, type: unknown) => entries.set(name, type),
      },
    })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    runInContext(script, context)
    expect([...entries.keys()].sort()).toEqual([
      "m-layout",
      "m-layout-content",
      "m-layout-footer",
      "m-layout-header",
      "m-layout-sider",
    ])
    expect(() => runInContext(script, context)).toThrow("already defined")
    const esm = readFileSync("dist\\markup-ui-layout.js", "utf8")
    expect(esm).toContain('"./markup-ui-core.js"')
    expect(esm).not.toMatch(/MutationObserver|ResizeObserver/)
  })

  it("accounts for delivery payload, manifest and build budgets", () => {
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]] as const) {
      const payload = manifest.componentPayloads.layout[mode]
      expect(payload.file).toBe(`markup-ui-layout${suffix}`)
      expect(payload.dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(payload.gzipBytes).toBeLessThanOrEqual(2000)
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(3000)
      expect(payload.runtimeBudget).toBe(3000)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + manifest.componentPayloads.layout.cssGzipBytes)
    }
  })
})
