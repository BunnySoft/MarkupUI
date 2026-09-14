import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { createContext, runInContext } from "node:vm"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Grid, GridItem, registerGrid } from "../src/components/grid/index.js"
import * as gridApi from "../src/components/grid/index.js"
import { gridAlignments, gridJustifications } from "../src/components/grid/model.js"
import { ViewElement } from "../src/core/index.js"
import { validateHeader } from "../src/components/collapse/controller.js"
import { Collapse } from "../src/components/collapse/index.js"
import { Dropdown } from "../src/components/dropdown/index.js"
import { createTooltip } from "../src/components/tooltip/index.js"
import { bind, createStore } from "../src/state/index.js"

const css = readFileSync("src\\components\\grid\\grid.css", "utf8")
const demo = readFileSync("demo\\components\\grid.html", "utf8")
const appCss = readFileSync("demo\\components\\grid.css", "utf8")
const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const controllers: { disconnect(): void }[] = []
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void { document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>")) }
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  style?.remove(); style = undefined; document.body.replaceChildren(); vi.restoreAllMocks()
})

describe("direct native Grid and GridItem", () => {
  it("registers exactly the family with own tags, shared core and atomic conflicts", () => {
    expect(Object.keys(gridApi).sort()).toEqual(["Grid", "GridItem", "registerGrid"])
    for (const type of [Grid, GridItem]) {
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(type.prototype instanceof ViewElement).toBe(true)
      expect(customElements.get(type.tag)).toBe(type)
      expect("meta" in type).toBe(false)
    }
    expect(Grid.observedAttributes).toEqual(["cols", "columns", "row-gap", "column-gap", "align", "justify"])
    expect(GridItem.observedAttributes).toEqual(["span", "start"])
    const define = vi.fn()
    expect(() => registerGrid({ get: name => name === "m-grid-item" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerGrid()).not.toThrow()
  })

  it("keeps 24 equal columns, zero style gaps, normal item alignment and auto one-span items", () => {
    const grid = new Grid(), item = new GridItem()
    expect([grid.cols, grid.columns, grid.rowGap, grid.columnGap, grid.align, grid.justify, item.span, item.start])
      .toEqual([24, null, null, null, "normal", "normal", 1, null])
    grid.append(item); document.body.append(grid); install()
    expect(grid.attributes).toHaveLength(0)
    expect(item.attributes).toHaveLength(0)
    const root = getComputedStyle(grid), child = getComputedStyle(item)
    expect(root.display).toBe("grid")
    expect(root.getPropertyValue("--m-grid-cols").trim()).toBe("24")
    expect(root.getPropertyValue("--m-grid-x-gap").trim()).toBe("0px")
    expect(root.getPropertyValue("--m-grid-y-gap").trim()).toBe("0px")
    expect(root.gridAutoFlow).toBe("row")
    expect(child.getPropertyValue("--m-grid-span").trim()).toBe("1")
    expect(child.getPropertyValue("--m-grid-start").trim()).toBe("auto")
  })

  it("accepts direct native choices and finite nonnegative gaps without a property engine", () => {
    const grid = new Grid(), item = new GridItem()
    for (const value of gridAlignments) { grid.align = value; expect(grid.align).toBe(value) }
    for (const value of gridJustifications) { grid.justify = value; expect(grid.justify).toBe(value) }
    grid.cols = 4; grid.columns = "80px minmax(0, 1fr)"; grid.rowGap = 0; grid.columnGap = 1.5
    item.span = 2; item.start = 3
    expect([grid.cols, grid.columns, grid.rowGap, grid.columnGap, item.span, item.start]).toEqual([4, "80px minmax(0, 1fr)", 0, 1.5, 2, 3])
    const before = grid.outerHTML + item.outerHTML
    for (const [target, properties, values] of [
      [grid, ["cols"], [0, -1, NaN, Infinity, 1.5, "4", true, null, undefined, Number.MAX_SAFE_INTEGER + 1]],
      [item, ["span", "start"], [0, -1, NaN, Infinity, 1.5, "4", true, undefined]],
      [grid, ["rowGap", "columnGap"], [-1, NaN, Infinity, "12", true, undefined]],
      [grid, ["align", "justify"], [null, "invalid", 1, true]],
      [grid, ["columns"], ["", " ", 4, true, undefined]],
    ] as const) for (const property of properties) for (const value of values) expect(() => Reflect.set(target, property, value)).toThrow(RangeError)
    expect(grid.outerHTML + item.outerHTML).toBe(before)
  })

  it("rejects invalid authored values without silently defaulting or span-zero hiding", () => {
    const grid = new Grid(), item = new GridItem()
    for (const [target, attribute, property, value] of [
      [grid, "cols", "cols", "0"], [grid, "cols", "cols", ""], [grid, "columns", "columns", " "],
      [grid, "row-gap", "rowGap", "-1"], [grid, "column-gap", "columnGap", "2px"],
      [grid, "align", "align", "space-between"], [grid, "justify", "justify", "space-around"],
      [item, "span", "span", "0"], [item, "start", "start", "-1"], [item, "start", "start", "auto"],
    ] as const) {
      target.setAttribute(attribute, value)
      expect(() => Reflect.get(target, property)).toThrow(RangeError)
      target.removeAttribute(attribute)
    }
    expect(item.hasAttribute("hidden")).toBe(false)
    expect("offset" in item).toBe(false)
    expect("rows" in grid).toBe(false)
    expect("flow" in grid).toBe(false)
  })

  it("replays all pre-upgrade properties before rendering with no own shadows", () => {
    for (const [element, values] of [
      [new Grid(), { cols: 3, columns: "80px 1fr", rowGap: 5.5, columnGap: 0, align: "center", justify: "end" }],
      [new GridItem(), { span: 2, start: 3 }],
    ] as const) {
      for (const [name, value] of Object.entries(values)) Object.defineProperty(element, name, { value, configurable: true })
      document.body.append(element)
      for (const [name, value] of Object.entries(values)) {
        expect(Object.hasOwn(element, name)).toBe(false)
        expect(Reflect.get(element, name)).toBe(value)
      }
    }
    expect(document.querySelector("m-grid")!.getAttribute("style")).toContain("--_m-grid-y-gap: 5.5px")
  })

  it("restores per-setting style leases, priorities and later application edits", () => {
    const grid = new Grid(), item = new GridItem()
    grid.style.setProperty("--_m-grid-x-gap", "3em", "important")
    const priority = grid.style.getPropertyPriority("--_m-grid-x-gap")
    grid.style.gridTemplateRows = "60px 80px"
    item.style.setProperty("--_m-grid-span", "4")
    grid.append(item); document.body.append(grid)
    grid.columnGap = 12; item.span = 2; item.start = 3
    expect(grid.style.getPropertyValue("--_m-grid-x-gap")).toBe("12px")
    grid.columnGap = null
    expect(grid.style.getPropertyValue("--_m-grid-x-gap")).toBe("3em")
    expect(grid.style.getPropertyPriority("--_m-grid-x-gap")).toBe(priority)
    grid.columnGap = 8
    item.style.setProperty("--_m-grid-span", "5")
    grid.remove()
    expect(grid.style.getPropertyValue("--_m-grid-x-gap")).toBe("3em")
    expect(item.style.getPropertyValue("--_m-grid-span")).toBe("5")
    expect(item.style.getPropertyValue("--_m-grid-start")).toBe("")
    document.body.append(grid)
    expect(item.style.getPropertyValue("--_m-grid-span")).toBe("2")
    item.removeAttribute("span")
    expect(item.style.getPropertyValue("--_m-grid-span")).toBe("5")
    expect(grid.style.gridTemplateRows).toBe("60px 80px")
  })

  it("preserves mixed text, comments, native items and optional item identity through updates", () => {
    fixture(); install()
    const root = document.querySelector<Grid>("#fixed")!, item = document.querySelector<GridItem>("#fixed-wide")!
    root.append(document.createTextNode("Plain text"), document.createComment("Original comment"))
    const nodes = [...root.childNodes], before = root.innerHTML
    root.cols = 3; root.columnGap = 9; root.align = "end"
    item.span = 3; item.start = 2
    expect([...root.childNodes]).toEqual(nodes)
    expect(root.innerHTML.replace(item.outerHTML, "")).toBe(before.replace(/<m-grid-item span="2"[^]*?<\/m-grid-item>/, ""))
    expect(document.querySelector("#plain-child")?.tagName).toBe("P")
    expect(document.querySelector('[role="grid"],[role="row"],[role="gridcell"],m-grid[tabindex]')).toBeNull()
  })

  it("keeps CSS-wide column inheritance/reset native and restores authored declarations", () => {
    const grid = new Grid()
    grid.style.gridTemplateColumns = "80px 1fr"
    document.body.append(grid)
    for (const value of ["inherit", "initial", "unset", "revert", "revert-layer"]) {
      grid.columns = value
      expect(grid.style.gridTemplateColumns).toBe(value)
      expect(grid.style.getPropertyValue("--_m-grid-tracks")).toBe("")
    }
    grid.columns = null
    expect(grid.style.gridTemplateColumns).toBe("80px 1fr")
    grid.columns = "20px 30px"
    expect(grid.style.gridTemplateColumns).toBe("80px 1fr")
    expect(grid.style.getPropertyValue("--_m-grid-tracks")).toBe("20px 30px")
  })

  it("keeps nesting local without leaking private column/gap/span/start values", () => {
    fixture(); install()
    const inner = document.querySelector<Grid>("#inner-grid")!, child = document.querySelector<GridItem>("#inner-first")!
    expect([inner.cols, inner.columnGap, inner.rowGap, child.span, child.start]).toEqual([2, 4, 4, 1, null])
    expect(inner.style.getPropertyValue("--_m-grid-cols")).toBe("2")
    expect(getComputedStyle(child).getPropertyValue("--_m-grid-span")).toBe("initial")
    const peer = new Grid()
    inner.append(peer)
    expect(peer.cols).toBe(24)
    expect(getComputedStyle(peer).getPropertyValue("--_m-grid-cols")).toBe("initial")
    expect(getComputedStyle(peer).getPropertyValue("--_m-grid-x-gap")).toBe("initial")
  })

  it("preserves native hidden roots/items and inert templates without filtering", () => {
    fixture(); install()
    for (const id of ["hidden-root", "hidden-item", "native-template"]) expect(getComputedStyle(document.getElementById(id)!).display).toBe("none")
    expect(document.querySelector("template")?.content.textContent).toBe("Inert authored template")
    expect(css).toContain(':not([hidden="until-found"])')
    const root = new Grid()
    document.body.append(root)
    root.append(new GridItem())
    expect(root.childElementCount).toBe(1)
  })

  it("keeps absolute start distinct from a separate authored spacer and trailing Web placement", () => {
    fixture(); install()
    expect(document.querySelector<GridItem>("#absolute-third")!.start).toBe(3)
    const spacer = document.querySelector("#authored-spacer")!
    expect(spacer.getAttribute("aria-hidden")).toBe("true")
    expect(spacer.nextElementSibling?.id).toBe("after-spacer")
    expect(spacer.textContent).toBe("")
    expect(css).not.toContain("--m-grid-offset")
    expect(appCss).toContain("grid-column: 1 / -1")
  })

  it("uses independent query wrappers and native rows/flow/order instead of layout loops", () => {
    fixture()
    const wrapper = document.querySelector("#query-container")!, grid = document.querySelector("#self-grid")!
    expect(grid.parentElement).toBe(wrapper)
    expect(wrapper.localName).toBe("div")
    expect(appCss).toContain("@container example-grid (min-width: 30rem)")
    expect(appCss).toContain("@media (min-width: 48rem)")
    expect(appCss).toContain("grid-template-rows: 40px 40px")
    expect(appCss).toContain("grid-auto-flow: column")
    for (const name of ["grid", "item"]) expect(readFileSync(`src\\components\\grid\\${name}.ts`, "utf8"))
      .not.toMatch(/MutationObserver|ResizeObserver|getBoundingClientRect|cloneNode|innerHTML|append|addEventListener/)
    expect(css).not.toMatch(/@container|@media|dense|reverse|margin-left/)
  })

  it("preserves native details/actions, list markers, form data, focus and reset semantics", () => {
    fixture(); install()
    const details = document.querySelector<HTMLDetailsElement>("#more-results")!, extra = document.querySelector("#extra-link")
    document.querySelector<HTMLElement>("#more-summary")!.click()
    expect(details.open).toBe(true)
    document.querySelector<HTMLElement>("#more-summary")!.click()
    expect(details.open).toBe(false)
    expect(document.querySelector("#extra-link")).toBe(extra)
    const list = document.querySelector("#native-list")!
    expect(list.firstElementChild!.tagName).toBe("LI")
    expect(getComputedStyle(list.firstElementChild!).display).toBe("list-item")
    const form = document.querySelector("form")!, input = document.querySelector<HTMLInputElement>("#native-name")!
    const submit = vi.fn((event: Event) => event.preventDefault()), disabled = vi.fn()
    form.addEventListener("submit", submit)
    document.querySelector("#native-disabled")!.addEventListener("click", disabled)
    input.value = "Edited"; input.focus()
    document.querySelector<Grid>("#form-grid")!.columnGap = 19
    expect(document.activeElement).toBe(input)
    expect(new FormData(form).get("name")).toBe("Edited")
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(submit).toHaveBeenCalledOnce()
    expect(disabled).not.toHaveBeenCalled()
  })

  it("retains late children, listeners and native order across reconnect", () => {
    const grid = new Grid(), nested = new Grid(), button = document.createElement("button")
    const clicked = vi.fn()
    button.addEventListener("click", clicked)
    grid.append(nested); document.body.append(grid); nested.append(button)
    button.focus(); grid.cols = 4; grid.dir = "rtl"; grid.style.writingMode = "vertical-rl"
    expect(document.activeElement).toBe(button)
    grid.remove(); document.body.append(grid); button.click()
    expect(clicked).toHaveBeenCalledOnce()
    expect(grid.firstChild).toBe(nested)
    expect(nested.firstChild).toBe(button)
  })

  it("does not rewrite author grid declarations or style resources", () => {
    document.body.innerHTML = '<m-grid cols="3" style="grid-template-columns:80px 1fr;grid-template-rows:40px 60px;grid-auto-flow:column;gap:5px 7px;align-items:safe center;justify-items:end"><m-grid-item span="2" style="grid-column:2 / -1;grid-row:2;order:3">Original</m-grid-item></m-grid><p id="outside">Outside</p>'
    install()
    const grid = document.querySelector<Grid>("m-grid")!, item = grid.firstElementChild!
    grid.cols = 2; grid.columnGap = 12; grid.align = "start"
    expect(getComputedStyle(grid).gridTemplateColumns).toBe("80px 1fr")
    expect(getComputedStyle(grid).gridAutoFlow).toBe("column")
    expect(getComputedStyle(grid).gap).toBe("5px 7px")
    expect(getComputedStyle(grid).alignItems).toBe("safe center")
    expect(getComputedStyle(item).gridColumn).toBe("2 / -1")
    expect(getComputedStyle(item).order).toBe("3")
    expect(getComputedStyle(document.querySelector("#outside")!).display).toBe("block")
  })

  it("uses optional property binding without importing the binding runtime", () => {
    document.body.innerHTML = '<m-grid m-bind="count" m-bind-property="cols"><m-grid-item m-bind="span" m-bind-property="span">Bound</m-grid-item></m-grid>'
    const store = createStore({ count: 3, span: 2 }), dispose = bind(document.body, store)
    expect(document.querySelector<Grid>("m-grid")!.cols).toBe(3)
    expect(document.querySelector<GridItem>("m-grid-item")!.span).toBe(2)
    store.set("count", 4); store.set("span", 1)
    expect(document.querySelector<Grid>("m-grid")!.cols).toBe(4)
    expect(document.querySelector<GridItem>("m-grid-item")!.span).toBe(1)
    dispose()
  })
})

describe("passive Grid composition", () => {
  it("accepts Grid/Item in Collapse while rejecting nested controls, widgets and shadow roots", () => {
    const header = document.createElement("div")
    header.innerHTML = "<m-grid><m-grid-item>Passive</m-grid-item><m-grid>Label</m-grid></m-grid>"
    expect(() => validateHeader(header)).not.toThrow()
    const collapse = new Collapse()
    collapse.innerHTML = '<m-collapse-item key="one"><m-collapse-header><m-grid><m-grid-item>Label</m-grid-item></m-grid></m-collapse-header><m-collapse-content>Body</m-collapse-content></m-collapse-item>'
    document.body.append(collapse)
    expect(collapse.querySelector("summary m-grid")).not.toBeNull()
    for (const tag of ["input", "button", "m-arbitrary-widget", "slot"]) {
      const child = document.createElement(tag)
      header.querySelector("m-grid-item")!.append(child)
      expect(() => validateHeader(header)).toThrow()
      child.remove()
    }
    header.querySelector("m-grid-item")!.attachShadow({ mode: "open" })
    expect(() => validateHeader(header)).toThrow()
  })

  it("allows passive Grid in Tooltip without allowing interactive or shadow content", () => {
    document.body.innerHTML = '<button type="button">Help</button><div id="tip" class="m-popover m-tooltip" role="tooltip" popover="manual"><m-grid><m-grid-item>Helpful</m-grid-item></m-grid></div>'
    const trigger = document.querySelector("button")!, panel = document.querySelector<HTMLElement>("#tip")!
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    expect(controller.connected).toBe(true)
    controller.disconnect()
    for (const tag of ["input", "m-arbitrary-widget", "slot"]) {
      const child = document.createElement(tag)
      panel.querySelector("m-grid-item")!.append(child)
      expect(() => createTooltip(trigger, panel)).toThrow("noninteractive")
      child.remove()
    }
    panel.querySelector("m-grid-item")!.attachShadow({ mode: "open" })
    expect(() => createTooltip(trigger, panel)).toThrow("noninteractive")
  })

  it("allows passive Grid labels in Dropdown triggers/items without weakening descendant checks", () => {
    const root = new Dropdown()
    root.innerHTML = '<m-dropdown-trigger><button type="button"><m-grid><m-grid-item>Actions</m-grid-item></m-grid></button></m-dropdown-trigger><m-dropdown-menu label="Actions"><m-dropdown-item key="save"><button type="button"><m-grid><m-grid-item>Save</m-grid-item></m-grid></button></m-dropdown-item></m-dropdown-menu>'
    document.body.append(root)
    expect(root.items).toHaveLength(1)
    for (const selector of ["m-dropdown-item m-grid-item", "m-dropdown-trigger m-grid-item"]) {
      const item = root.querySelector(selector)!
      for (const tag of ["input", "m-arbitrary-widget", "slot"]) {
        const child = document.createElement(tag)
        item.append(child)
        expect(() => root.refresh()).toThrow()
        child.remove(); root.refresh()
      }
    }
    root.querySelector("m-dropdown-item m-grid")!.attachShadow({ mode: "open" })
    expect(() => root.refresh()).toThrow()
  })
})

describe("Grid documentation and selected delivery", () => {
  it("generates the exact configured API/defaults, no invented rows/flow/events/actions", () => {
    const docs = JSON.parse(readFileSync("demo\\api\\grid.json", "utf8"))
    expect(docs.elements.map((element: any) => element.type)).toEqual(["Grid", "GridItem"])
    const [grid, item] = docs.elements
    expect(Object.keys(grid.properties)).toEqual(["cols", "columns", "rowGap", "columnGap", "align", "justify"])
    expect(Object.values(grid.properties).map((property: any) => property.default)).toEqual([24, null, null, null, "normal", "normal"])
    expect(Object.keys(item.properties)).toEqual(["span", "start"])
    expect(Object.values(item.properties).map((property: any) => property.default)).toEqual([1, null])
    expect(grid.properties.cols).toMatchObject({ min: 1, integer: true, attribute: "cols" })
    expect(grid.properties.columnGap).toMatchObject({ min: 0, nullable: true, attribute: "column-gap" })
    expect(grid.properties.justify.values.sort()).toEqual([...gridJustifications].sort())
    expect(item.properties.start).toMatchObject({ min: 1, integer: true, nullable: true })
    for (const element of docs.elements) { expect(element.events).toEqual([]); expect(element.actions).toEqual([]) }
  })

  it("uses shared demo/API/code/outline assets and real canonical examples", () => {
    const parsed = new DOMParser().parseFromString(demo, "text/html")
    expect(parsed.querySelector("main[data-demo-page].component-docs #grid-api")).not.toBeNull()
    const examples = parsed.querySelectorAll("[data-demo-example]")
    expect(examples.length).toBeGreaterThanOrEqual(8)
    for (const example of examples) {
      expect(example.querySelector("[data-demo-header] h2[id]")).not.toBeNull()
      expect(example.querySelector("[data-demo-preview] m-grid")).not.toBeNull()
      if (!["web", "responsive"].includes(example.getAttribute("data-demo-example")!)) expect(example.querySelector("m-grid[class],m-grid-item[class]")).toBeNull()
    }
    const setup = parsed.querySelector("details.component-setup")!
    expect(setup.querySelector("code")!.textContent!.split("\n")).toHaveLength(3)
    expect(setup.children).toHaveLength(3)
    expect(setup.querySelector("a")!.getAttribute("href")).toBe("../setup.html")
    for (const asset of ["../example-code.css", "../component-api.css", "../component-outline.js"]) expect(demo).toContain(asset)
    expect(readFileSync("demo\\components\\grid.js", "utf8")).toContain("loadComponentApi")
  })

  it("ships exactly core plus Grid, fails without core and rejects duplicate classic registration", () => {
    expect(pkg.exports["./grid"]).toEqual({ types: "./dist/components/grid/index.d.ts", import: "./dist/markup-ui-grid.js" })
    expect(pkg.exports["./grid/style.css"]).toBe("./dist/markup-ui-grid.css")
    const script = readFileSync("dist\\markup-ui-grid.global.js", "utf8")
    expect(() => runInContext(script, createContext({ HTMLElement }))).toThrow("Load compatible markup-ui-core.global.js")
    const entries = new Map<string, unknown>()
    const context = createContext({ HTMLElement, customElements: {
      get: (name: string) => entries.get(name), define: (name: string, type: unknown) => entries.set(name, type),
    } })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    runInContext(script, context)
    expect([...entries.keys()]).toEqual(["m-grid", "m-grid-item"])
    expect(() => runInContext(script, context)).toThrow("already defined")
    const esm = readFileSync("dist\\markup-ui-grid.js", "utf8")
    expect(esm).toContain('"./markup-ui-core.js"')
    expect(esm).not.toMatch(/markup-ui-(?:flex|form|popover)|MutationObserver|ResizeObserver/)
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const payload = manifest.componentPayloads.grid[mode]
      expect(payload.dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(payload.gzipBytes).toBeLessThanOrEqual(1750)
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(3000)
      expect(payload.runtimeBudget).toBe(3000)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + manifest.componentPayloads.grid.cssGzipBytes)
    }
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1500)
    const aggregate = readFileSync("src\\components\\elements.ts", "utf8")
    expect(aggregate).not.toContain('"m-grid"')
    for (const alias of ["m-row", "m-stack", "m-wrap", "m-center", "m-spacer"]) expect(aggregate).toContain(`"${alias}"`)
    for (const name of ["collapse", "dropdown", "tooltip", "form"]) {
      expect(readFileSync(`dist\\markup-ui-${name}.js`, "utf8")).not.toMatch(/registerGrid|Grid counts|Expected CSS column tracks/)
    }
  })

  it("updates the legacy consumer's real columns/gaps without migrating Layout or Form grids", () => {
    const html = readFileSync("demo\\legacy.html", "utf8")
    const parsed = new DOMParser().parseFromString(html, "text/html")
    expect(html).toContain("../dist/markup-ui-grid.js")
    expect(parsed.querySelectorAll("m-grid").length).toBe(21)
    for (const grid of parsed.querySelectorAll("m-grid")) {
      expect(grid.hasAttribute("columns")).toBe(true)
      expect(grid.hasAttribute("gap")).toBe(false)
      expect(grid.getAttribute("row-gap")).toBe(grid.getAttribute("column-gap"))
    }
    expect(parsed.querySelector("m-stack[gap]")).not.toBeNull()
    expect(readFileSync("src\\components\\foundation.ts", "utf8")).not.toContain("MGrid")
    const legacyStyles = readFileSync("src\\components\\styles.css", "utf8")
    expect(legacyStyles).not.toContain("m-grid{display:grid}")
    expect(legacyStyles).toContain('[align="end"]:not(m-grid)')
    expect(readFileSync("src\\components\\form\\item.ts", "utf8")).toContain("No Grid renderer/dependency")
  })
})
