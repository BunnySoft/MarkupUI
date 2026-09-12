import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { createContext, runInContext } from "node:vm"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Space, registerSpace } from "../src/components/space/index.js"
import * as spaceApi from "../src/components/space/index.js"
import { spaceAlignments, spaceJustifications, spaceSizes } from "../src/components/space/model.js"
import { ViewElement } from "../src/core/index.js"
import { validateHeader } from "../src/components/collapse/controller.js"
import { Collapse } from "../src/components/collapse/index.js"
import { createTooltip } from "../src/components/tooltip/index.js"
import { Dropdown } from "../src/components/dropdown/index.js"

const css = readFileSync(resolve("src", "components", "space", "space.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "space.html"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
const controllers: { disconnect(): void }[] = []
let style: HTMLStyleElement | undefined
function install(): void { style = document.createElement("style"); style.textContent = css; document.head.append(style) }
function fixture(): void { document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>")) }
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  style?.remove(); style = undefined; document.body.replaceChildren(); vi.restoreAllMocks()
})

describe("direct Space", () => {
  it("registers only its own canonical tag and shared ViewElement identity", () => {
    expect(Object.keys(spaceApi).sort()).toEqual(["Space", "registerSpace"])
    expect(Object.hasOwn(Space, "tag")).toBe(true)
    expect(Space.prototype instanceof ViewElement).toBe(true)
    expect(customElements.get("m-space")).toBe(Space)
    expect("meta" in Space).toBe(false)
    expect(Space.observedAttributes).toEqual(["vertical", "inline", "wrap", "size", "align", "justify", "row-gap", "column-gap"])
    const define = vi.fn()
    expect(() => registerSpace({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
    expect(() => registerSpace()).not.toThrow()
  })

  it("keeps the measured defaults rather than a centered alignment or uniform gap", () => {
    const space = new Space()
    expect([space.vertical, space.inline, space.wrap, space.size, space.align, space.justify, space.rowGap, space.columnGap])
      .toEqual([false, false, true, "medium", "normal", "start", null, null])
    document.body.append(space)
    install()
    expect(space.attributes).toHaveLength(0)
    const computed = getComputedStyle(space)
    expect(computed.display).toBe("flex")
    expect(computed.flexDirection).toBe("row")
    expect(computed.flexWrap).toBe("wrap")
    expect(computed.getPropertyValue("--_m-space-align")).toBe("normal")
    expect(computed.getPropertyValue("--_m-space-justify")).toBe("flex-start")
  })

  it("validates every typed setter before mutation and accepts all finite choices", () => {
    const space = new Space()
    for (const value of spaceSizes) { space.size = value; expect(space.size).toBe(value) }
    for (const value of spaceAlignments) { space.align = value; expect(space.align).toBe(value) }
    for (const value of spaceJustifications) { space.justify = value; expect(space.justify).toBe(value) }
    space.rowGap = 0; space.columnGap = 10.5
    expect([space.rowGap, space.columnGap]).toEqual([0, 10.5])
    const before = space.outerHTML
    for (const property of ["size", "align", "justify"]) {
      for (const value of [null, "", "invalid", 1, true]) expect(() => Reflect.set(space, property, value)).toThrow(RangeError)
    }
    for (const property of ["rowGap", "columnGap"]) {
      for (const value of [-1, NaN, Infinity, "12", true, undefined]) expect(() => Reflect.set(space, property, value)).toThrow(RangeError)
    }
    for (const property of ["vertical", "inline", "wrap"]) {
      for (const value of [null, "false", 0, undefined]) expect(() => Reflect.set(space, property, value)).toThrow(RangeError)
    }
    expect(space.outerHTML).toBe(before)
  })

  it("rejects invalid attributes on read instead of silently substituting defaults", () => {
    const space = new Space()
    for (const [attribute, property, value] of [
      ["size", "size", "tiny"], ["align", "align", "flex-start"], ["justify", "justify", "left"],
      ["wrap", "wrap", "yes"], ["row-gap", "rowGap", ""], ["row-gap", "rowGap", "-1"],
      ["column-gap", "columnGap", "12px"], ["column-gap", "columnGap", "Infinity"],
    ]) {
      space.setAttribute(attribute!, value!)
      expect(() => Reflect.get(space, property!)).toThrow(RangeError)
      space.removeAttribute(attribute!)
    }
    for (const value of ["", "true", "false"]) {
      space.setAttribute("wrap", value)
      expect(space.wrap).toBe(value !== "false")
    }
    space.setAttribute("vertical", "false"); space.setAttribute("inline", "false")
    expect(space.vertical && space.inline).toBe(true)
    space.vertical = false; space.inline = false; space.wrap = false
    expect(space.hasAttribute("vertical") || space.hasAttribute("inline")).toBe(false)
    expect(space.getAttribute("wrap")).toBe("false")
  })

  it("replays all pre-upgrade properties before rendering and does not leave own shadows", () => {
    const space = new Space()
    const properties = { vertical: true, inline: true, wrap: false, size: "small", align: "end", justify: "center", rowGap: 5.5, columnGap: 0 }
    for (const [name, value] of Object.entries(properties)) Object.defineProperty(space, name, { value, configurable: true })
    document.body.append(space)
    for (const [name, value] of Object.entries(properties)) {
      expect(Object.hasOwn(space, name)).toBe(false)
      expect(Reflect.get(space, name)).toBe(value)
    }
    expect(space.style.rowGap).toBe("5.5px")
    expect(space.style.columnGap).toBe("0px")
  })

  it("updates numeric attributes live, resets independently and restores authored styles on disconnect", () => {
    const space = new Space()
    space.style.setProperty("row-gap", "3em", "important")
    space.style.columnGap = "7%"
    space.style.color = "red"
    document.body.append(space)
    space.setAttribute("row-gap", "6"); space.setAttribute("column-gap", "20")
    expect([space.style.rowGap, space.style.columnGap]).toEqual(["6px", "20px"])
    space.rowGap = null
    expect(space.style.rowGap).toBe("3em")
    expect(space.style.getPropertyPriority("row-gap")).toBe("important")
    expect(space.style.columnGap).toBe("20px")
    space.remove()
    expect(space.style.columnGap).toBe("7%")
    document.body.append(space)
    expect(space.style.columnGap).toBe("20px")
    space.style.columnGap = "9em"
    space.style.color = "blue"
    space.remove()
    expect(space.style.columnGap).toBe("9em")
    expect(space.style.color).toBe("blue")
    document.body.append(space)
    space.columnGap = null
    expect(space.style.columnGap).toBe("9em")
  })

  it("preserves authored groups, mixed nodes and unwrapped children through every scalar update", () => {
    fixture()
    const group = document.querySelector<Space>("#authored-items")!
    const before = group.innerHTML
    const nodes = [...group.querySelectorAll("*")]
    const raw = document.querySelector("#unwrapped")!
    raw.append(document.createComment("Original comment"))
    const rawNodes = [...raw.childNodes]
    install()
    group.size = "large"; group.vertical = true; group.align = "end"; group.columnGap = 21
    expect(group.innerHTML).toBe(before)
    expect([...group.querySelectorAll("*")]).toEqual(nodes)
    expect([...raw.childNodes]).toEqual(rawNodes)
    expect(raw.textContent).toContain("Bare native text")
    expect(raw.querySelector(".m-space-item")).toBeNull()
    expect(document.querySelector("m-space[role],m-space[tabindex]")).toBeNull()
  })

  it("keeps item-box styling Web-only and never parses wrapper/class/style adapters", () => {
    document.body.innerHTML = '<m-space wrap-item="false" item-class="ignored" item-style="ignored"><span class="m-space-item authored" style="color: red">Actual item</span><button type="button">Direct action</button></m-space>'
    const root = document.querySelector("m-space")!
    const item = root.firstElementChild!
    const before = root.outerHTML
    install()
    expect(root.outerHTML).toBe(before)
    expect(getComputedStyle(item).boxSizing).toBe("border-box")
    expect(getComputedStyle(item).maxInlineSize).toBe("100%")
    expect(item.className).toBe("m-space-item authored")
    expect(item.getAttribute("style")).toBe("color: red")
    expect(root.querySelector(".ignored")).toBeNull()
  })

  it("keeps pinned presets and numeric overrides local to each nested Space", () => {
    fixture(); install()
    const gap = (id: string) => {
      const s = getComputedStyle(document.getElementById(id)!)
      return [s.getPropertyValue("--_m-space-row-gap").trim(), s.getPropertyValue("--_m-space-column-gap").trim()]
    }
    expect(gap("small")).toEqual(["4px", "8px"])
    expect(gap("medium")).toEqual(["8px", "12px"])
    expect(gap("large")).toEqual(["12px", "16px"])
    expect(gap("nested-small")).toEqual(["4px", "8px"])
    expect(gap("nested-medium")).toEqual(["8px", "12px"])
    expect(document.getElementById("nested-outer")!.style.columnGap).toBe("30px")
    expect(document.getElementById("nested-medium")!.style.columnGap).toBe("")
    expect(document.getElementById("tuple")!.style.rowGap).toBe("6px")
    expect(document.getElementById("tuple")!.style.columnGap).toBe("20px")
  })

  it("uses inline/row/column wrapping and retains the stored wrap preference for rows", () => {
    fixture(); install()
    const space = document.querySelector<Space>("#vertical")!
    expect(space.wrap).toBe(true)
    expect(getComputedStyle(space).flexDirection).toBe("column")
    expect(getComputedStyle(space).flexWrap).toBe("nowrap")
    space.vertical = false
    expect(getComputedStyle(space).flexDirection).toBe("row")
    expect(getComputedStyle(space).flexWrap).toBe("wrap")
    space.wrap = false
    expect(getComputedStyle(space).flexWrap).toBe("nowrap")
    expect(getComputedStyle(document.querySelector("#inline")!).display).toBe("inline-flex")
  })

  it("retains native separators, their author-selected grouping and ARIA", () => {
    fixture(); install()
    const free = document.querySelector("#free-separator")!
    const paired = document.querySelector("#paired-separator")!
    expect(free.parentElement?.id).toBe("separate-items")
    expect(paired.parentElement?.id).toBe("paired-item")
    expect(free.textContent).toBe("/")
    expect(paired.getAttribute("aria-hidden")).toBe("true")
    expect(paired.parentElement?.hasAttribute("aria-hidden")).toBe(false)
    expect(css).not.toContain("separator")
    expect(css).not.toMatch(/(?:^|[;{])\s*content:/m)
  })

  it("preserves valid native lists and markers without anonymous wrappers or ARIA roles", () => {
    fixture()
    const list = document.querySelector<HTMLOListElement>("#native-list")!
    const children = [...list.children]
    install()
    expect([...list.children]).toEqual(children)
    expect(children.every(n => n.tagName === "LI")).toBe(true)
    expect(list.type).toBe("A")
    expect(list.start).toBe(2)
    expect(getComputedStyle(children[0]!).display).toBe("list-item")
    expect(list.hasAttribute("role")).toBe(false)
    expect(css).not.toContain("list-style")
  })

  it("retains native form submit/reset/disabled controls, focus and link listeners", () => {
    fixture()
    const form = document.querySelector("form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    const submits = vi.fn((event: Event) => event.preventDefault())
    const disabled = vi.fn(), links = vi.fn((event: Event) => event.preventDefault())
    form.addEventListener("submit", submits)
    document.querySelector("#native-disabled")!.addEventListener("click", disabled)
    document.querySelector("#group-link")!.addEventListener("click", links)
    install()
    input.value = "Edited"; input.focus()
    const space = form.firstElementChild as Space
    space.rowGap = 12; space.align = "center"; space.vertical = false
    expect(document.activeElement).toBe(input)
    expect(new FormData(form).get("name")).toBe("Edited")
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    expect(input.value).toBe("Original")
    document.querySelector<HTMLButtonElement>("#native-submit")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    document.querySelector<HTMLAnchorElement>("#group-link")!.click()
    expect(submits).toHaveBeenCalledOnce()
    expect(disabled).not.toHaveBeenCalled()
    expect(links).toHaveBeenCalledOnce()
    expect(form.getAttribute("method")).toBe("get")
  })

  it("hides native roots/items while retaining empty items and inert templates", () => {
    fixture(); install()
    expect(getComputedStyle(document.querySelector("#hidden-root")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#hidden-item")!).display).toBe("none")
    const empty = document.querySelector("#empty-item")!
    expect(empty.isConnected).toBe(true)
    expect(getComputedStyle(empty).display).not.toBe("none")
    expect(getComputedStyle(empty.querySelector("button")!).display).toBe("none")
    const template = document.querySelector("template")!
    expect(getComputedStyle(template).display).toBe("none")
    expect(template.content.firstElementChild?.textContent).toBe("Inert application template")
    expect(css).not.toContain(":empty")
    expect(css).toContain(':not([hidden="until-found"])')
  })

  it("preserves late item identity/listeners on reconnect with no observers or measurement", () => {
    const root = new Space(), nested = new Space(), button = document.createElement("button")
    button.type = "button"
    const clicks = vi.fn()
    button.addEventListener("click", clicks)
    root.append(nested); document.body.append(root); nested.append(button)
    const focus = button.focus.bind(button)
    focus(); root.columnGap = 8
    expect(document.activeElement).toBe(button)
    root.remove(); document.body.append(root); button.click()
    expect(clicks).toHaveBeenCalledOnce()
    expect(root.firstChild).toBe(nested)
    expect(nested.firstChild).toBe(button)
    const source = readFileSync("src\\components\\space\\space.ts", "utf8")
    expect(source).not.toMatch(/MutationObserver|ResizeObserver|getBoundingClientRect|cloneNode|innerHTML|append|addEventListener/)
  })

  it("keeps RTL/order/native styles and item intrinsic size ownership unchanged", () => {
    document.body.innerHTML = '<m-space dir="rtl" wrap="false" style="gap:5px 7px;align-items:center;justify-content:space-between"><div class="m-space-item" style="flex:none;min-inline-size:auto">Fixed authored item</div></m-space><p id="outside">Outside</p>'
    const root = document.querySelector("m-space")!, item = root.firstElementChild!
    const before = root.outerHTML, outside = document.querySelector("#outside")!
    const display = getComputedStyle(outside).display
    install()
    expect(root.outerHTML).toBe(before)
    expect(getComputedStyle(root).gap).toBe("5px 7px")
    expect(getComputedStyle(root).alignItems).toBe("center")
    expect(getComputedStyle(root).justifyContent).toBe("space-between")
    expect(getComputedStyle(item).minInlineSize).toBe("auto")
    expect(getComputedStyle(outside).display).toBe(display)
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:order|direction):|reverse|overflow: hidden|@supports|@keyframes/)
  })
})

describe("passive Space composition", () => {
  it("allows nested Space in Collapse labels without importing its registration entry", () => {
    const header = document.createElement("div")
    header.innerHTML = "<m-space><span>Passive</span><m-space>Label</m-space></m-space>"
    expect(() => validateHeader(header)).not.toThrow()
    const collapse = new Collapse()
    collapse.innerHTML = '<m-collapse-item key="one"><m-collapse-header><m-space><span>Label</span><span>Extra</span></m-space></m-collapse-header><m-collapse-content>Body</m-collapse-content></m-collapse-item>'
    document.body.append(collapse)
    expect(collapse.querySelector("summary m-space")).not.toBeNull()
    header.querySelector("m-space")!.append(document.createElement("input"))
    expect(() => validateHeader(header)).toThrow("noninteractive")
  })

  it("allows passive Space in Tooltip and rejects nested controls and arbitrary widgets", () => {
    document.body.innerHTML = '<button type="button">Help</button><div id="tip" class="m-popover m-tooltip" role="tooltip" popover="manual"><m-space><span>Helpful</span><span>description</span></m-space></div>'
    const trigger = document.querySelector("button")!, panel = document.querySelector<HTMLElement>("#tip")!
    const controller = createTooltip(trigger, panel)
    controllers.push(controller)
    expect(controller.connected).toBe(true)
    controller.disconnect()
    for (const tag of ["input", "m-arbitrary-widget"]) {
      const node = document.createElement(tag)
      panel.querySelector("m-space")!.append(node)
      expect(() => createTooltip(trigger, panel)).toThrow("noninteractive")
      node.remove()
    }
  })

  it("allows Space in Dropdown triggers/items without allowing nested interactive content", () => {
    const root = new Dropdown()
    root.innerHTML = '<m-dropdown-trigger><button type="button"><m-space><span>Actions</span><span>+</span></m-space></button></m-dropdown-trigger><m-dropdown-menu label="Actions"><m-dropdown-item key="save"><button type="button"><m-space><span>Save</span><span>Now</span></m-space></button></m-dropdown-item></m-dropdown-menu>'
    document.body.append(root)
    expect(root.items).toHaveLength(1)
    root.querySelector("m-dropdown-item m-space")!.append(document.createElement("input"))
    expect(() => root.refresh()).toThrow()
  })
})

describe("Space CSS, demo and selected delivery", () => {
  it("retains the unchanged CSS ceiling and independent style resources", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(1000)
    expect(css).not.toMatch(/@import|\.m-flex|data-m-theme|--m-color|--m-font|--m-text/)
    expect(css).toContain("row-gap: var(--m-space-row-gap, var(--_m-space-row-gap))")
    expect(css).toContain("column-gap: var(--m-space-column-gap, var(--_m-space-column-gap))")
    expect(css).toContain("m-space > * { min-inline-size: 0; }")
    expect(css).toContain("align-items: var(--m-space-align, var(--_m-space-align))")
    expect(css).toContain("justify-content: var(--m-space-justify, var(--_m-space-justify))")
  })

  it("generates exactly the direct API/defaults and no actions or runtime metadata", () => {
    const docs = JSON.parse(readFileSync("demo\\api\\space.json", "utf8"))
    expect(docs.elements.map((element: { type: string }) => element.type)).toEqual(["Space"])
    const element = docs.elements[0], properties = element.properties
    expect(Object.keys(properties)).toEqual(["vertical", "inline", "wrap", "size", "align", "justify", "rowGap", "columnGap"])
    expect(Object.values(properties).map((property: any) => property.default)).toEqual([false, false, true, "medium", "normal", "start", null, null])
    expect(properties.rowGap).toMatchObject({ attribute: "row-gap", min: 0, nullable: true, exclusiveMin: false })
    expect(properties.columnGap).toMatchObject({ attribute: "column-gap", min: 0, nullable: true })
    expect(element.actions).toEqual([])
  })

  it("uses common demo scaffolding, source examples, generated API and only the family setup snippet", () => {
    const document = new DOMParser().parseFromString(demo, "text/html")
    expect(document.querySelector("main[data-demo-page].component-docs #space-api")).not.toBeNull()
    const examples = document.querySelectorAll("[data-demo-example]")
    expect(examples.length).toBeGreaterThanOrEqual(8)
    for (const example of examples) {
      expect(example.querySelector("[data-demo-header] h2[id]")).not.toBeNull()
      expect(example.querySelector("[data-demo-preview] m-space")).not.toBeNull()
      if (example.getAttribute("data-demo-example") !== "web") expect(example.querySelector("m-space[class]")).toBeNull()
    }
    const setup = document.querySelector("details.component-setup")!
    expect(setup.querySelector("code")!.textContent!.split("\n")).toHaveLength(3)
    expect(setup.querySelector("a")!.getAttribute("href")).toBe("../setup.html")
    expect(setup.children).toHaveLength(3)
    expect(demo).toContain("../example-code.css")
    expect(demo).toContain("../component-api.css")
    expect(demo).toContain("../component-outline.js")
  })

  it("delivers one family over shared core, rejects missing/duplicate core and accounts for exact files", () => {
    expect(pkg.exports["./space"]).toEqual({ types: "./dist/components/space/index.d.ts", import: "./dist/markup-ui-space.js" })
    expect(pkg.exports["./space/style.css"]).toBe("./dist/markup-ui-space.css")
    const script = readFileSync("dist\\markup-ui-space.global.js", "utf8")
    expect(() => runInContext(script, createContext({ HTMLElement }))).toThrow("Load compatible markup-ui-core.global.js")
    const entries = new Map<string, unknown>()
    const context = createContext({ HTMLElement, customElements: {
      get: (name: string) => entries.get(name), define: (name: string, type: unknown) => entries.set(name, type),
    } })
    runInContext(readFileSync("dist\\markup-ui-core.global.js", "utf8"), context)
    runInContext(script, context)
    expect([...entries.keys()]).toEqual(["m-space"])
    expect(() => runInContext(script, context)).toThrow("already defined")
    const manifest = JSON.parse(readFileSync("dist\\manifest.json", "utf8"))
    for (const [mode, suffix] of [["esm", ".js"], ["classic", ".global.js"]]) {
      const payload = manifest.componentPayloads.space[mode]
      expect(payload.dependencies).toEqual([`markup-ui-core${suffix}`])
      expect(payload.gzipBytes).toBeLessThanOrEqual(1500)
      expect(payload.runtimeGzipBytes).toBeLessThanOrEqual(2750)
      expect(payload.runtimeBudget).toBe(2750)
      expect(payload.totalGzipBytes).toBe(payload.runtimeGzipBytes + manifest.componentPayloads.space.cssGzipBytes)
    }
    expect(manifest.componentPayloads.space.cssGzipBytes).toBeLessThanOrEqual(1000)
    expect(readFileSync("dist\\markup-ui-space.js", "utf8")).toContain('"./markup-ui-core.js"')
    expect(readFileSync("src\\components\\elements.ts", "utf8")).not.toContain('"m-space"')
    for (const name of ["collapse", "dropdown", "tooltip"]) {
      const source = readFileSync(`dist\\markup-ui-${name}.js`, "utf8")
      expect(source).not.toContain("registerSpace")
      expect(source).not.toContain("Space gaps must")
    }
  })
})
