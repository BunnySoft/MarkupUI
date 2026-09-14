import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { createContext, runInContext } from "node:vm"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Flex, registerFlex } from "../src/components/flex/index.js"
import * as flexApi from "../src/components/flex/index.js"
import { flexAlignments, flexJustifications, flexSizes } from "../src/components/flex/model.js"
import { ViewElement } from "../src/core/index.js"
import { validateHeader } from "../src/components/collapse/controller.js"
import { Collapse } from "../src/components/collapse/index.js"
import { Dropdown } from "../src/components/dropdown/index.js"
import { createTooltip } from "../src/components/tooltip/index.js"

const css = readFileSync("src\\components\\flex\\flex.css", "utf8")
const demo = readFileSync("demo\\components\\flex.html", "utf8")
const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const controllers: { disconnect(): void }[] = []
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void { document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>")) }
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  style?.remove(); style = undefined; document.body.replaceChildren(); vi.restoreAllMocks()
})

describe("direct native Flex", () => {
  it("registers only its own canonical tag through shared ViewElement with explicit attributes", () => {
    expect(Object.keys(flexApi).sort()).toEqual(["Flex", "registerFlex"])
    expect(Object.hasOwn(Flex, "tag")).toBe(true)
    expect(Flex.prototype instanceof ViewElement).toBe(true)
    expect(customElements.get("m-flex")).toBe(Flex)
    expect("meta" in Flex).toBe(false)
    expect(Flex.observedAttributes).toEqual(["vertical", "inline", "wrap", "reverse", "size", "align", "justify", "row-gap", "column-gap"])
    const define = vi.fn()
    expect(() => registerFlex({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerFlex()).not.toThrow()
  })

  it("retains native normal/start defaults and asymmetric medium gaps", () => {
    const flex = new Flex()
    expect([flex.vertical, flex.inline, flex.wrap, flex.reverse, flex.size, flex.align, flex.justify, flex.rowGap, flex.columnGap])
      .toEqual([false, false, true, false, "medium", "normal", "start", null, null])
    document.body.append(flex); install()
    expect(flex.attributes).toHaveLength(0)
    const computed = getComputedStyle(flex)
    expect(computed.display).toBe("flex")
    expect(computed.flexDirection).toBe("row")
    expect(computed.flexWrap).toBe("wrap")
    expect(computed.getPropertyValue("--_m-flex-align")).toBe("normal")
    expect(computed.getPropertyValue("--_m-flex-justify")).toBe("start")
  })

  it("accepts every typed choice and validates setters before mutation", () => {
    const flex = new Flex()
    for (const value of flexSizes) { flex.size = value; expect(flex.size).toBe(value) }
    for (const value of flexAlignments) { flex.align = value; expect(flex.align).toBe(value) }
    for (const value of flexJustifications) { flex.justify = value; expect(flex.justify).toBe(value) }
    flex.rowGap = 0; flex.columnGap = 1.5
    expect([flex.rowGap, flex.columnGap]).toEqual([0, 1.5])
    const before = flex.outerHTML
    for (const property of ["size", "align", "justify"]) {
      for (const value of [null, "", "invalid", 1, true]) expect(() => Reflect.set(flex, property, value)).toThrow(RangeError)
    }
    for (const property of ["rowGap", "columnGap"]) {
      for (const value of [-1, NaN, Infinity, "12", true, undefined]) expect(() => Reflect.set(flex, property, value)).toThrow(RangeError)
    }
    for (const property of ["vertical", "inline", "wrap", "reverse"]) {
      for (const value of [null, "false", 0, undefined]) expect(() => Reflect.set(flex, property, value)).toThrow(RangeError)
    }
    expect(flex.outerHTML).toBe(before)
  })

  it("rejects invalid attributes and makes presence/text booleans explicit", () => {
    const flex = new Flex()
    for (const [attribute, property, value] of [
      ["size", "size", "tiny"], ["align", "align", "left"], ["justify", "justify", "baseline"],
      ["wrap", "wrap", "yes"], ["row-gap", "rowGap", ""], ["row-gap", "rowGap", "-1"],
      ["column-gap", "columnGap", "12px"], ["column-gap", "columnGap", "Infinity"],
    ]) {
      flex.setAttribute(attribute!, value!)
      expect(() => Reflect.get(flex, property!)).toThrow(RangeError)
      flex.removeAttribute(attribute!)
    }
    for (const value of ["", "true", "false"]) {
      flex.setAttribute("wrap", value)
      expect(flex.wrap).toBe(value !== "false")
    }
    for (const property of ["vertical", "inline", "reverse"]) {
      flex.setAttribute(property, "false")
      expect(Reflect.get(flex, property)).toBe(true)
      Reflect.set(flex, property, false)
      expect(flex.hasAttribute(property)).toBe(false)
    }
    flex.wrap = false
    expect(flex.getAttribute("wrap")).toBe("false")
  })

  it("replays every pre-upgrade property before first render without own shadows", () => {
    const flex = new Flex()
    const values = { vertical: true, inline: true, wrap: false, reverse: true, size: "small", align: "flex-end", justify: "right", rowGap: 5.5, columnGap: 0 }
    for (const [name, value] of Object.entries(values)) Object.defineProperty(flex, name, { value, configurable: true })
    document.body.append(flex)
    for (const [name, value] of Object.entries(values)) {
      expect(Object.hasOwn(flex, name)).toBe(false)
      expect(Reflect.get(flex, name)).toBe(value)
    }
    expect([flex.style.rowGap, flex.style.columnGap]).toEqual(["5.5px", "0px"])
  })

  it("restores independently owned gap styles, priorities and later application edits", () => {
    const flex = new Flex()
    flex.style.setProperty("row-gap", "3em", "important")
    flex.style.columnGap = "7%"
    flex.style.color = "red"
    document.body.append(flex)
    flex.setAttribute("row-gap", "6"); flex.setAttribute("column-gap", "20")
    expect([flex.style.rowGap, flex.style.columnGap]).toEqual(["6px", "20px"])
    flex.rowGap = null
    expect(flex.style.rowGap).toBe("3em")
    expect(flex.style.getPropertyPriority("row-gap")).toBe("important")
    flex.remove()
    expect(flex.style.columnGap).toBe("7%")
    document.body.append(flex)
    expect(flex.style.columnGap).toBe("20px")
    flex.style.columnGap = "9em"; flex.style.color = "blue"
    flex.remove()
    expect(flex.style.columnGap).toBe("9em")
    expect(flex.style.color).toBe("blue")
    document.body.append(flex); flex.columnGap = null
    expect(flex.style.columnGap).toBe("9em")
  })

  it("preserves mixed text/comments and exact native children through scalar updates", () => {
    fixture(); install()
    const flex = document.querySelector<Flex>("#mixed")!
    const nodes = [...flex.childNodes], before = flex.innerHTML
    flex.size = "large"; flex.align = "end"; flex.justify = "space-evenly"
    flex.vertical = true; flex.reverse = true; flex.columnGap = 21
    expect([...flex.childNodes]).toEqual(nodes)
    expect(flex.innerHTML).toBe(before)
    expect(nodes.some(node => node.nodeType === Node.TEXT_NODE)).toBe(true)
    expect(nodes.some(node => node.nodeType === Node.COMMENT_NODE)).toBe(true)
    expect(document.querySelector("m-flex[role],m-flex[tabindex]")).toBeNull()
  })

  it("keeps each preset local and never swaps explicit gap axes in a column", () => {
    fixture(); install()
    const gaps = (id: string) => {
      const computed = getComputedStyle(document.getElementById(id)!)
      return [computed.getPropertyValue("--_m-flex-row-gap").trim(), computed.getPropertyValue("--_m-flex-column-gap").trim()]
    }
    expect(gaps("small")).toEqual(["4px", "8px"])
    expect(gaps("medium")).toEqual(["8px", "12px"])
    expect(gaps("large")).toEqual(["12px", "16px"])
    expect(gaps("nested-small")).toEqual(["4px", "8px"])
    expect(gaps("nested-medium")).toEqual(["8px", "12px"])
    expect(document.getElementById("nested-outer")!.style.columnGap).toBe("30px")
    expect(document.getElementById("nested-medium")!.style.columnGap).toBe("")
    for (const id of ["tuple", "vertical"]) {
      expect(document.getElementById(id)!.style.rowGap).toBe("6px")
      expect(document.getElementById(id)!.style.columnGap).toBe("20px")
    }
  })

  it("keeps wrapping preference while supporting all orientations and visual reverse", () => {
    fixture(); install()
    const flex = document.querySelector<Flex>("#vertical")!
    expect(flex.wrap).toBe(true)
    expect(getComputedStyle(flex).flexWrap).toBe("nowrap")
    expect(getComputedStyle(flex).flexDirection).toBe("column")
    flex.reverse = true
    expect(getComputedStyle(flex).flexDirection).toBe("column-reverse")
    flex.vertical = false
    expect(getComputedStyle(flex).flexDirection).toBe("row-reverse")
    expect(getComputedStyle(flex).flexWrap).toBe("wrap")
    flex.reverse = false; flex.wrap = false
    expect(getComputedStyle(flex).flexDirection).toBe("row")
    expect(getComputedStyle(flex).flexWrap).toBe("nowrap")
    expect(getComputedStyle(document.querySelector("#inline")!).display).toBe("inline-flex")
  })

  it("maps every typed native alignment literally, unlike Space start/end aliases", () => {
    const flex = new Flex()
    document.body.append(flex); install()
    for (const value of flexAlignments) {
      flex.align = value
      expect(getComputedStyle(flex).getPropertyValue("--_m-flex-align")).toBe(value)
    }
    for (const value of flexJustifications) {
      flex.justify = value
      expect(getComputedStyle(flex).getPropertyValue("--_m-flex-justify")).toBe(value)
    }
    expect(css).toContain("text-align: inherit")
    flex.style.textAlign = "right"; flex.align = "center"
    expect(getComputedStyle(flex).textAlign).toBe("right")
  })

  it("keeps native list ownership, markers, attributes and click listeners", () => {
    fixture(); install()
    const list = document.querySelector<HTMLOListElement>("#native-list")!
    const children = [...list.children]
    const clicks = vi.fn((event: Event) => event.preventDefault())
    const link = document.querySelector<HTMLAnchorElement>("#list-first")!
    link.addEventListener("click", clicks); link.click()
    expect(clicks).toHaveBeenCalledOnce()
    expect([...list.children]).toEqual(children)
    expect(children.every(node => node.localName === "li")).toBe(true)
    expect([list.type, list.start]).toEqual(["A", 3])
    expect(getComputedStyle(children[0]!).display).toBe("list-item")
    expect(list.hasAttribute("role")).toBe(false)
  })

  it("preserves focus, reset/submit, FormData, disabled actions and native semantics", () => {
    fixture(); install()
    const form = document.querySelector("form")!, input = document.querySelector<HTMLInputElement>("#native-name")!
    const submit = vi.fn((event: Event) => event.preventDefault()), disabled = vi.fn()
    form.addEventListener("submit", submit)
    document.querySelector("#native-disabled")!.addEventListener("click", disabled)
    input.value = "Edited"; input.focus()
    const flex = document.querySelector<Flex>("#form-flex")!
    flex.vertical = false; flex.reverse = true; flex.rowGap = 12
    expect(document.activeElement).toBe(input)
    expect(new FormData(form).get("name")).toBe("Edited")
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(submit).toHaveBeenCalledOnce()
    expect(disabled).not.toHaveBeenCalled()
    expect(form.getAttribute("method")).toBe("get")
  })

  it("hides ordinary roots/items, preserves inert templates and does not filter empty nodes", () => {
    fixture(); install()
    for (const id of ["hidden-root", "hidden-item", "native-template"]) expect(getComputedStyle(document.getElementById(id)!).display).toBe("none")
    expect(document.querySelector("template")?.content.textContent).toBe("Application-owned inert template")
    const empty = new Flex()
    document.body.append(empty)
    expect(empty.isConnected).toBe(true)
    empty.append(document.createElement("span"))
    expect(empty.children).toHaveLength(1)
    expect(css).toContain(':not([hidden="until-found"])')
    expect(css).not.toContain(":empty")
  })

  it("keeps late/nested children and listeners on reconnect without measurement or observers", () => {
    const flex = new Flex(), nested = new Flex(), button = document.createElement("button")
    button.type = "button"
    const clicks = vi.fn()
    button.addEventListener("click", clicks)
    flex.append(nested); document.body.append(flex); nested.append(button)
    button.focus(); flex.columnGap = 8
    expect(document.activeElement).toBe(button)
    flex.remove(); document.body.append(flex); button.click()
    expect(clicks).toHaveBeenCalledOnce()
    expect(flex.firstChild).toBe(nested)
    expect(nested.firstChild).toBe(button)
    expect(readFileSync("src\\components\\flex\\flex.ts", "utf8"))
      .not.toMatch(/MutationObserver|ResizeObserver|getBoundingClientRect|cloneNode|innerHTML|append|addEventListener/)
  })

  it("leaves native sizing, writing modes, RTL, order, safe alignment and overflow to CSS", () => {
    document.body.innerHTML = '<m-flex dir="rtl" style="writing-mode:vertical-rl;gap:5px 7px;align-items:safe center;justify-content:space-evenly;flex-wrap:wrap-reverse"><section style="min-inline-size:auto;flex:1 0 20px;order:2">Intrinsic</section></m-flex><p id="outside">Outside</p>'
    const flex = document.querySelector("m-flex")!, item = flex.firstElementChild!, before = flex.outerHTML
    const outside = document.querySelector("#outside")!, display = getComputedStyle(outside).display
    install()
    expect(flex.outerHTML).toBe(before)
    expect(getComputedStyle(flex).gap).toBe("5px 7px")
    expect(getComputedStyle(flex).flexWrap).toBe("wrap-reverse")
    expect(getComputedStyle(flex).alignItems).toBe("safe center")
    expect(getComputedStyle(flex).writingMode).toBe("vertical-rl")
    expect(getComputedStyle(item).minInlineSize).toBe("auto")
    expect(getComputedStyle(item).order).toBe("2")
    expect(getComputedStyle(outside).display).toBe(display)
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:order|direction):|overflow: hidden|@supports|@keyframes|box-sizing|list-style/)
  })
})

describe("passive Flex composition", () => {
  it("accepts passive nested Flex in Collapse and rejects controls, shadow and arbitrary widgets", () => {
    const header = document.createElement("div")
    header.innerHTML = "<m-flex><span>Passive</span><m-flex>Label</m-flex></m-flex>"
    expect(() => validateHeader(header)).not.toThrow()
    const collapse = new Collapse()
    collapse.innerHTML = '<m-collapse-item key="one"><m-collapse-header><m-flex><span>Label</span><span>Extra</span></m-flex></m-collapse-header><m-collapse-content>Body</m-collapse-content></m-collapse-item>'
    document.body.append(collapse)
    expect(collapse.querySelector("summary m-flex")).not.toBeNull()
    for (const tag of ["input", "m-arbitrary-widget"]) {
      const child = document.createElement(tag)
      header.querySelector("m-flex")!.append(child)
      expect(() => validateHeader(header)).toThrow()
      child.remove()
    }
    header.querySelector("m-flex")!.attachShadow({ mode: "open" })
    expect(() => validateHeader(header)).toThrow()
  })

  it("allows Flex in Tooltip but retains every descendant restriction", () => {
    document.body.innerHTML = '<button type="button">Help</button><div id="tip" class="m-popover m-tooltip" role="tooltip" popover="manual"><m-flex><span>Helpful</span><m-flex>description</m-flex></m-flex></div>'
    const trigger = document.querySelector("button")!, panel = document.querySelector<HTMLElement>("#tip")!
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    expect(controller.connected).toBe(true)
    controller.disconnect()
    for (const tag of ["input", "m-arbitrary-widget", "slot"]) {
      const node = document.createElement(tag)
      panel.querySelector("m-flex")!.append(node)
      expect(() => createTooltip(trigger, panel)).toThrow("noninteractive")
      node.remove()
    }
    panel.querySelector("m-flex")!.attachShadow({ mode: "open" })
    expect(() => createTooltip(trigger, panel)).toThrow("noninteractive")
  })

  it("allows passive Flex in Dropdown triggers/items without nested controls or shadow", () => {
    const root = new Dropdown()
    root.innerHTML = '<m-dropdown-trigger><button type="button"><m-flex><span>Actions</span><span>+</span></m-flex></button></m-dropdown-trigger><m-dropdown-menu label="Actions"><m-dropdown-item key="save"><button type="button"><m-flex><span>Save</span><span>Now</span></m-flex></button></m-dropdown-item></m-dropdown-menu>'
    document.body.append(root)
    expect(root.items).toHaveLength(1)
    const flex = root.querySelector("m-dropdown-item m-flex")!
    const input = document.createElement("input")
    flex.append(input)
    expect(() => root.refresh()).toThrow()
    input.remove(); root.refresh()
    flex.attachShadow({ mode: "open" })
    expect(() => root.refresh()).toThrow()
  })
})

describe("Flex CSS, demo and selected delivery", () => {
  it("retains the existing CSS ceiling and only native container/direct-child styles", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
    expect(css).not.toMatch(/@import|\.m-flex|\.m-space|data-m-theme|--m-color|--m-font|--m-text|padding:|margin:/)
    expect(css).toContain("row-gap: var(--m-flex-row-gap, var(--_m-flex-row-gap))")
    expect(css).toContain("column-gap: var(--m-flex-column-gap, var(--_m-flex-column-gap))")
    expect(css).toContain("m-flex > * { min-inline-size: 0; }")
    expect(css).toContain("overflow-wrap: anywhere")
  })

  it("generates precisely the typed API, choices and defaults from source", () => {
    const docs = JSON.parse(readFileSync("demo\\api\\flex.json", "utf8"))
    expect(docs.elements.map((element: { type: string }) => element.type)).toEqual(["Flex"])
    const element = docs.elements[0], properties = element.properties
    expect(Object.keys(properties)).toEqual(["vertical", "inline", "wrap", "reverse", "size", "align", "justify", "rowGap", "columnGap"])
    expect(Object.values(properties).map((property: any) => property.default)).toEqual([false, false, true, false, "medium", "normal", "start", null, null])
    expect(properties.align.values.sort()).toEqual([...flexAlignments].sort())
    expect(properties.justify.values.sort()).toEqual([...flexJustifications].sort())
    expect(properties.size.values.sort()).toEqual([...flexSizes].sort())
    expect(properties.rowGap).toMatchObject({ attribute: "row-gap", min: 0, nullable: true, exclusiveMin: false })
    expect(properties.columnGap).toMatchObject({ attribute: "column-gap", min: 0, nullable: true })
    expect(element.actions).toEqual([])
  })

  it("uses the authoritative shared demo scaffold and a three-line family-only setup", () => {
    const document = new DOMParser().parseFromString(demo, "text/html")
    expect(document.querySelector("main[data-demo-page].component-docs #flex-api")).not.toBeNull()
    const examples = document.querySelectorAll("[data-demo-example]")
    expect(examples.length).toBeGreaterThanOrEqual(8)
    for (const example of examples) {
      expect(example.querySelector("[data-demo-header] h2[id]")).not.toBeNull()
      expect(example.querySelector("[data-demo-preview] m-flex")).not.toBeNull()
      if (example.getAttribute("data-demo-example") !== "web") expect(example.querySelector("m-flex[class]")).toBeNull()
    }
    const setup = document.querySelector("details.component-setup")!
    expect(setup.querySelector("code")!.textContent!.split("\n")).toHaveLength(3)
    expect(setup.querySelector("a")!.getAttribute("href")).toBe("../setup.html")
    expect(setup.children).toHaveLength(3)
    for (const asset of ["../example-code.css", "../component-api.css", "../component-outline.js"]) expect(demo).toContain(asset)
    expect(readFileSync("demo\\components\\flex.js", "utf8")).toContain("loadComponentApi")
  })

  it("delivers only Flex over core, with measured dependency-aware budgets and explicit conflicts", () => {
    expect(pkg.exports["./flex"]).toEqual({ types: "./dist/components/flex/index.d.ts", import: "./dist/markup-ui-flex.js" })
    expect(pkg.exports["./flex/style.css"]).toBe("./dist/markup-ui-flex.css")
    const script = readFileSync("dist\\markup-ui-flex.global.js", "utf8")
    expect(() => runInContext(script, createContext({ HTMLElement }))).toThrow("Load compatible markup-ui-core.global.js")
    const entries = new Map<string, unknown>()
    const context = createContext({ HTMLElement, customElements: {
      get: (name: string) => entries.get(name), define: (name: string, type: unknown) => entries.set(name, type),
    } })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    runInContext(script, context)
    expect([...entries.keys()]).toEqual(["m-flex"])
    expect(() => runInContext(script, context)).toThrow("already defined")
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const payload = manifest.componentPayloads.flex[mode]
      expect(payload.dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(payload.gzipBytes).toBeLessThanOrEqual(1500)
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(2750)
      expect(payload.runtimeBudget).toBe(2750)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + manifest.componentPayloads.flex.cssGzipBytes)
    }
    expect(manifest.componentPayloads.flex.cssGzipBytes).toBeLessThanOrEqual(1000)
    const esm = readFileSync("dist\\markup-ui-flex.js", "utf8")
    expect(esm).toContain('"./markup-ui-core.js"')
    expect(esm).not.toContain("m-space")
    const aggregate = readFileSync("src\\components\\elements.ts", "utf8")
    expect(aggregate).not.toContain('"m-flex"')
    for (const alias of ["m-row", "m-stack", "m-wrap"]) expect(aggregate).toContain(`"${alias}"`)
    expect(aggregate).not.toContain('"m-grid"')
    for (const name of ["collapse", "dropdown", "tooltip"]) {
      const source = readFileSync(`dist\\markup-ui-${name}.js`, "utf8")
      expect(source).not.toContain("registerFlex")
      expect(source).not.toContain("Flex gaps must")
    }
  })
})
