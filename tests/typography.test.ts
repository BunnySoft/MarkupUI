import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { gzipSync } from "node:zlib"
import { createContext, runInContext } from "node:vm"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Typography, Text as TypographyText, Paragraph, Heading, Link, Blockquote, UnorderedList, OrderedList, registerTypography } from "../src/components/typography/index.js"
import { ViewElement } from "../src/core/index.js"
import { validateHeader } from "../src/components/collapse/controller.js"
import { createTooltip } from "../src/components/tooltip/index.js"
import { Dropdown } from "../src/components/dropdown/index.js"

const css = readFileSync(resolve("src", "components", "typography", "typography.css"), "utf8")
const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let stylesheet: HTMLStyleElement | undefined

function install(): void {
  stylesheet = document.createElement("style")
  stylesheet.textContent = css
  document.head.append(stylesheet)
}
afterEach(() => { stylesheet?.remove(); stylesheet = undefined; document.body.replaceChildren() })

describe("native-owner Typography", () => {
  it("ships its own canonical family and shared-core runtime", () => {
    expect(packageJson.exports["./typography/style.css"]).toBe("./dist/markup-ui-typography.css")
    expect(packageJson.exports["./typography"].import).toBe("./dist/markup-ui-typography.js")
    for (const type of [Typography, TypographyText, Paragraph, Heading, Link, Blockquote, UnorderedList, OrderedList]) {
      expect(Object.hasOwn(type, "tag")).toBe(true)
      expect(type.prototype instanceof ViewElement).toBe(true)
      expect(customElements.get(type.tag)).toBe(type)
    }
    expect(customElements.get("m-strong")).toBeUndefined()
    expect(customElements.get("m-code")).toBeUndefined()
    expect(new globalThis.Text("native").nodeType).toBe(3)
    const define = vi.fn()
    expect(() => registerTypography({ get: name => name === "m-ol" ? class extends HTMLElement {} : undefined, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("validates direct properties before mutation and replays pre-upgrade assignments", () => {
    const text = new TypographyText()
    const heading = new Heading()
    const paragraph = new Paragraph()
    const list = new OrderedList()
    expect(text.type).toBe("default")
    expect(text.depth).toBeNull()
    expect([text.strong, text.italic, text.underline]).toEqual([false, false, false])
    expect(heading.level).toBe(2)
    expect(heading.prefix).toBeNull()
    expect(list.start).toBeNull()
    expect(list.type).toBeNull()
    for (const value of [0, 7, 1.5, NaN, Infinity, "2", null]) expect(() => Reflect.set(heading, "level", value)).toThrow()
    for (const value of [0, 4, 1.5, NaN, "2", true]) {
      expect(() => Reflect.set(text, "depth", value)).toThrow()
      expect(() => Reflect.set(paragraph, "depth", value)).toThrow()
    }
    for (const value of [1.5, NaN, Infinity, 2147483648, "2", true]) expect(() => Reflect.set(list, "start", value)).toThrow()
    expect(() => Reflect.set(text, "strong", "true")).toThrow()
    expect(() => Reflect.set(text, "type", "primary")).toThrow()
    expect(() => Reflect.set(heading, "prefix", "line")).toThrow()
    expect(() => Reflect.set(list, "type", "decimal")).toThrow()
    expect(heading.hasAttribute("level")).toBe(false)
    Object.defineProperty(heading, "level", { value: 4, configurable: true })
    Object.defineProperty(text, "depth", { value: 3, configurable: true })
    document.body.append(heading, text, paragraph, list)
    expect(heading.native?.localName).toBe("h4")
    expect(text.depth).toBe(3)
    expect(Object.hasOwn(heading, "level")).toBe(false)
    paragraph.type = "warning"
    paragraph.depth = 2
    expect(paragraph.native?.dataset).toMatchObject({ type: "warning", depth: "2" })
    heading.prefix = "bar"
    heading.alignText = true
    heading.type = "info"
    expect(heading.native?.dataset).toMatchObject({ prefix: "bar", alignText: "", type: "info" })
    const detached = new Heading()
    detached.setAttribute("level", "oops")
    expect(() => detached.level).toThrow()
  })

  it("adopts native owners and preserves native attributes, content, form state and listeners", async () => {
    const paragraph = new Paragraph()
    paragraph.innerHTML = '<p id="original"><label>Name <input value="Ada"></label><strong>Important</strong><em>Emphasis</em><del cite="#revision">Old</del><code>value</code></p>'
    const native = paragraph.firstElementChild!
    const input = native.querySelector("input")!
    const callback = vi.fn()
    input.addEventListener("example", callback)
    document.body.append(paragraph)
    input.value = "Edited"
    input.focus()
    input.setSelectionRange(1, 3)
    paragraph.depth = 3
    paragraph.type = "success"
    expect(paragraph.native).toBe(native)
    expect(document.activeElement).toBe(input)
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3])
    const extra = document.createElement("span")
    extra.textContent = "Late"
    paragraph.append(extra)
    await Promise.resolve()
    expect(extra.parentElement).toBe(native)
    paragraph.remove()
    document.body.append(paragraph)
    expect(paragraph.native).toBe(native)
    expect(input.value).toBe("Edited")
    input.dispatchEvent(new Event("example"))
    expect(callback).toHaveBeenCalledOnce()
    expect(native.querySelectorAll("strong,em,del,code")).toHaveLength(4)
    expect(paragraph.hasAttribute("role")).toBe(false)
  })

  it("replaces only the heading shell at level changes and preserves selection and descendants", () => {
    const heading = new Heading()
    heading.innerHTML = '<h2 id="native-title" lang="en"><span>Selectable title</span><input value="edit"></h2>'
    const span = heading.querySelector("span")!
    const input = heading.querySelector("input")!
    const click = vi.fn()
    span.addEventListener("click", click)
    document.body.append(heading)
    const original = heading.native
    const selection = document.getSelection()!
    selection.setBaseAndExtent(span.firstChild!, 1, span.firstChild!, 5)
    heading.prefix = "bar"
    expect(heading.native).toBe(original)
    heading.level = 5
    expect(heading.native).not.toBe(original)
    expect(heading.native?.localName).toBe("h5")
    expect(heading.native?.id).toBe("native-title")
    expect(heading.native?.querySelector("span")).toBe(span)
    expect(selection.anchorNode).toBe(span.firstChild)
    expect(selection.toString()).toBe("elec")
    input.focus()
    heading.level = 3
    expect(document.activeElement).toBe(input)
    span.click()
    expect(click).toHaveBeenCalledOnce()
    expect(heading.hasAttribute("role") || heading.hasAttribute("aria-level")).toBe(false)
    expect(heading.native?.hasAttribute("role")).toBe(false)
  })

  it("adopts a native owner arriving after an empty generated fallback and releases detached observers", async () => {
    for (const [type, tag] of [[Paragraph, "p"], [Heading, "h2"], [Link, "a"], [Blockquote, "blockquote"], [UnorderedList, "ul"], [OrderedList, "ol"]] as const) {
      const host = new type()
      document.body.append(host)
      const fallback = host.native
      const owner = document.createElement(tag)
      if (tag === "ul" || tag === "ol") owner.append(document.createElement("li"))
      else owner.textContent = "Late authored owner"
      host.append(owner)
      await Promise.resolve()
      expect(host.native).toBe(owner)
      expect(fallback?.isConnected).toBe(false)
      host.remove()
      const text = document.createTextNode("Detached content")
      if (tag !== "ul" && tag !== "ol") host.append(text)
      await Promise.resolve()
      if (tag !== "ul" && tag !== "ol") expect(text.parentNode).toBe(host)
      document.body.append(host)
      expect(host.native).toBe(owner)
      if (tag !== "ul" && tag !== "ol") expect(text.parentNode).toBe(owner)
      host.remove()
    }
  })

  it("keeps list counters native, including implicit reversed start and li value", () => {
    const list = new OrderedList()
    list.innerHTML = '<ol type="A" reversed><li value="7">Seven</li><li>Six</li></ol>'
    const native = list.firstElementChild as HTMLOListElement
    const items = [...native.children]
    document.body.append(list)
    expect(list.native).toBe(native)
    expect(list.start).toBeNull()
    expect(list.reversed).toBe(true)
    expect(list.type).toBe("A")
    list.start = 3
    list.reversed = false
    list.type = "i"
    list.alignText = true
    expect([native.start, native.reversed, native.type]).toEqual([3, false, "i"])
    list.start = null
    list.type = null
    list.reversed = true
    expect(native.hasAttribute("start") || native.hasAttribute("type")).toBe(false)
    expect(native.children[0]).toBe(items[0])
    expect((native.children[0] as HTMLLIElement).value).toBe(7)
    const unordered = new UnorderedList()
    unordered.innerHTML = '<li>One</li><li>Two<ol><li>Nested</li></ol></li>'
    unordered.connectedCallback()
    expect(unordered.native?.children).toHaveLength(2)
    expect([...unordered.native!.children].every(node => node.localName === "li")).toBe(true)
    const invalid = new UnorderedList()
    invalid.innerHTML = "<m-text>Not an li</m-text>"
    expect(() => invalid.connectedCallback()).toThrow("native li")
    expect(invalid.firstElementChild?.localName).toBe("m-text")
    unordered.disconnectedCallback()
    invalid.disconnectedCallback()
  })

  it("adopts anchors without discarding their native behavior, names or navigation attributes", () => {
    const link = new Link()
    link.innerHTML = '<a href="#target" target="_blank" rel="noopener noreferrer" download="file" hreflang="en" aria-label="Download">Link</a>'
    const anchor = link.firstElementChild as HTMLAnchorElement
    const listener = vi.fn((event: Event) => event.preventDefault())
    anchor.addEventListener("click", listener)
    document.body.append(link)
    expect(link.native).toBe(anchor)
    expect([link.href, link.target, link.rel, link.download, link.hreflang]).toEqual(["#target", "_blank", "noopener noreferrer", "file", "en"])
    link.focus()
    expect(document.activeElement).toBe(anchor)
    link.href = "#other"
    link.download = ""
    link.hreflang = "fr"
    expect(anchor.getAttribute("aria-label")).toBe("Download")
    expect(anchor.getAttribute("href")).toBe("#other")
    anchor.click()
    expect(listener).toHaveBeenCalledOnce()
    link.remove()
    document.body.append(link)
    expect(link.native).toBe(anchor)
    link.href = null
    link.target = null
    link.rel = null
    link.download = null
    expect(anchor.hasAttribute("href") || anchor.hasAttribute("target") || anchor.hasAttribute("rel") || anchor.hasAttribute("download")).toBe(false)
    expect(link.tabIndex).toBe(-1)
    expect(link.hasAttribute("role")).toBe(false)
    expect(() => Reflect.set(link, "href", 123)).toThrow()
    const nested = new Link()
    nested.innerHTML = '<span><a href="#nested">Nested</a></span>'
    expect(() => nested.connectedCallback()).toThrow("nested anchors")
    nested.disconnectedCallback()
  })

  it("preserves native quotation citation and scoped rich-document nodes", () => {
    const quote = new Blockquote()
    quote.innerHTML = '<blockquote cite="#original"><p>Quoted</p><cite><a href="#source">Source</a></cite></blockquote>'
    const native = quote.firstElementChild!
    document.body.append(quote)
    expect(quote.native).toBe(native)
    expect(quote.cite).toBe("#original")
    quote.cite = "#new"
    quote.alignText = true
    expect(native.getAttribute("cite")).toBe("#new")
    expect(native.hasAttribute("data-align-text")).toBe(true)
    quote.cite = null
    expect(native.hasAttribute("cite")).toBe(false)
    const scope = new Typography()
    scope.innerHTML = "<h1>Native</h1><pre><code>Block</code></pre>"
    const children = [...scope.childNodes]
    document.body.append(scope)
    scope.remove()
    document.body.append(scope)
    expect([...scope.childNodes]).toEqual(children)
  })

  it("accepts passive inline Text in validators without accepting interactive or arbitrary descendants", () => {
    const header = document.createElement("div")
    header.innerHTML = '<m-text strong>Label <em>native</em></m-text>'
    expect(() => validateHeader(header)).not.toThrow()
    for (const markup of ['<button>Action</button>', '<a href="#x">Link</a>', '<m-link>Placeholder</m-link>', '<m-widget>Widget</m-widget>', '<span tabindex="0">Focus</span>']) {
      header.innerHTML = `<m-text>${markup}</m-text>`
      expect(() => validateHeader(header)).toThrow()
    }
    document.body.innerHTML = '<button id="trigger">Help</button><div id="tip" class="m-popover m-tooltip" role="tooltip" popover="manual"><m-text>Tooltip text</m-text></div>'
    const tooltip = createTooltip(document.getElementById("trigger")!, document.getElementById("tip")!)
    expect(() => tooltip.connect()).not.toThrow()
    tooltip.disconnect()
    document.querySelector("#tip m-text")!.append(document.createElement("input"))
    expect(() => createTooltip(document.getElementById("trigger")!, document.getElementById("tip")!)).toThrow("noninteractive")
    const dropdown = new Dropdown()
    dropdown.innerHTML = '<m-dropdown-trigger><button type="button"><m-text>Commands</m-text></button></m-dropdown-trigger><m-dropdown-menu label="Commands"><m-dropdown-item key="one"><button type="button"><m-text>One</m-text></button></m-dropdown-item></m-dropdown-menu>'
    document.body.append(dropdown)
    expect(dropdown.items).toHaveLength(1)
    dropdown.querySelector("m-dropdown-item m-text")!.append(document.createElement("input"))
    expect(() => dropdown.refresh()).toThrow()
    dropdown.remove()
  })

  it("delivers standalone ESM/classic registration with measured unchanged CSS and explicit runtime caps", () => {
    const esm = readFileSync(resolve("dist", "markup-ui-typography.js"), "utf8")
    expect(esm).toContain("./markup-ui-core.js")
    expect(esm).not.toContain("registerMarkupUI")
    const classic = readFileSync(resolve("dist", "markup-ui-typography.global.js"), "utf8")
    expect(() => runInContext(classic, createContext({ HTMLElement, MutationObserver, customElements }))).toThrow("core")
    const entries = new Map()
    const context = createContext({ HTMLElement, MutationObserver, customElements: { get: (tag: string) => entries.get(tag), define: (tag: string, type: unknown) => entries.set(tag, type) } })
    runInContext(readFileSync(resolve("dist", "markup-ui-core.global.js"), "utf8"), context)
    runInContext(classic, context)
    expect(entries.size).toBe(8)
    expect(context.MarkupUITypography.Heading.prototype instanceof context.MarkupUICore.ViewElement).toBe(true)
    expect(() => runInContext(classic, context)).toThrow()
    for (const format of [".js", ".global.js"]) {
      const component = gzipSync(readFileSync(resolve("dist", `markup-ui-typography${format}`)), { level: 9 }).length
      const core = gzipSync(readFileSync(resolve("dist", `markup-ui-core${format}`)), { level: 9 }).length
      expect(component).toBeLessThanOrEqual(6000)
      expect(component + core).toBeLessThanOrEqual(8000)
    }
  })

  it("keeps native heading levels, paragraph/list/quote/code structure and contents", () => {
    document.body.innerHTML = '<article class="m-typography"><h1>One</h1><h2>Two</h2><h3>Three</h3><h4>Four</h4><h5>Five</h5><h6>Six</h6><p><strong>Strong</strong> <em>Emphasis</em> <del>Deleted</del> <code>Code</code></p><ul><li>Item</li></ul><blockquote cite="#source">Quote</blockquote><hr></article>'
    const before = [...document.querySelectorAll("*")].filter((node) => document.body.contains(node))
    install()
    expect([...document.querySelectorAll("*")].filter((node) => document.body.contains(node))).toEqual(before)
    expect([...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((node) => node.tagName)).toEqual(["H1", "H2", "H3", "H4", "H5", "H6"])
    expect(document.querySelector("[role],[aria-level],[aria-live]")).toBeNull()
    expect(document.querySelector("blockquote")?.getAttribute("cite")).toBe("#source")
  })

  it("leaves out-of-scope native text and data attributes unstyled", () => {
    document.body.innerHTML = '<p id="outside"><span data-strong data-type="error">Outside</span></p><article class="m-typography"><p>Inside</p></article>'
    const outside = document.querySelector("#outside span")!
    const before = { color: getComputedStyle(outside).color, weight: getComputedStyle(outside).fontWeight }
    install()
    expect(getComputedStyle(outside).color).toBe(before.color)
    expect(getComputedStyle(outside).fontWeight).toBe(before.weight)
  })

  it("preserves native anchor href/target/rel/download and authored SVG content", () => {
    document.body.innerHTML = '<article class="m-typography"><a href="#destination" target="_blank" rel="noopener noreferrer" download="file" hreflang="en"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0 0h10"></path></svg>Link</a></article>'
    const anchor = document.querySelector("a")!
    const svg = anchor.querySelector("svg")
    const before = anchor.outerHTML
    install()
    expect(anchor.outerHTML).toBe(before)
    expect(anchor.querySelector("svg")).toBe(svg)
    expect(anchor.getAttribute("href")).toBe("#destination")
    expect(anchor.target).toBe("_blank")
    expect(anchor.rel).toBe("noopener noreferrer")
    expect(anchor.download).toBe("file")
  })

  it("does not convert placeholder anchors into interactive controls", () => {
    document.body.innerHTML = '<article class="m-typography"><a>Placeholder</a></article>'
    install()
    const anchor = document.querySelector("a")!
    expect(anchor.hasAttribute("href") || anchor.hasAttribute("role") || anchor.hasAttribute("tabindex")).toBe(false)
    expect(getComputedStyle(anchor).cursor).not.toBe("pointer")
  })

  it("keeps native ordered-list numbering attributes and marker semantics", () => {
    document.body.innerHTML = '<ol class="m-ol" type="A" start="3" reversed><li value="7">Item</li></ol>'
    install()
    const list = document.querySelector("ol")!
    expect(list.type).toBe("A")
    expect(list.start).toBe(3)
    expect(list.reversed).toBe(true)
    expect(document.querySelector("li")?.value).toBe(7)
    expect(getComputedStyle(document.querySelector("li")!).display).toBe("list-item")
  })

  it("preserves document language/direction and native hidden state", () => {
    document.body.innerHTML = '<section class="m-typography" lang="ar" dir="rtl"><h2 data-prefix="bar" data-align-text hidden>عنوان</h2><p>نص</p></section>'
    install()
    expect(document.querySelector("section")?.lang).toBe("ar")
    expect(document.querySelector("section")?.dir).toBe("rtl")
    expect(document.querySelector("h2")?.hidden).toBe(true)
    expect(getComputedStyle(document.querySelector("h2")!).display).toBe("none")
  })

  it("uses native code/deletion/emphasis instead of replacing tags from data flags", () => {
    document.body.innerHTML = '<article class="m-typography"><span id="styled" data-strong data-italic data-underline>Style only</span><code><del>Old</del></code><em>Emphasis</em></article>'
    install()
    expect(document.querySelector("#styled")?.tagName).toBe("SPAN")
    expect(getComputedStyle(document.querySelector("#styled")!).fontStyle).toBe("italic")
    expect(getComputedStyle(document.querySelector("#styled")!).textDecorationLine).toBe("underline")
    expect(document.querySelector("code > del")?.textContent).toBe("Old")
    expect(document.querySelector("em")?.tagName).toBe("EM")
  })

  it("keeps native event listeners/selection targets and owns no animation or routing", () => {
    document.body.innerHTML = '<article class="m-typography"><span id="text">Selectable</span><a href="#target">Native</a></article>'
    const text = document.querySelector("#text")!
    let events = 0
    text.addEventListener("click", () => events++)
    install()
    text.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(events).toBe(1)
    expect(getComputedStyle(text).userSelect).not.toBe("none")
    expect(css).not.toContain("@keyframes")
    expect(css).not.toContain("user-select: none")
    expect(document.querySelectorAll("script")).toHaveLength(0)
  })

  it("keeps block-code markup outside the inline-code presentation contract", () => {
    document.body.innerHTML = '<article class="m-typography"><pre><code id="block">const value = 1</code></pre><code id="inline">value</code></article>'
    install()
    expect(document.querySelector("#block")?.parentElement?.tagName).toBe("PRE")
    expect(document.querySelector("#block")?.textContent).toBe("const value = 1")
    expect(css).toContain(":not(:where(pre code))")
  })

  it("keeps the source-only CSS within its unchanged 2500 gzip-byte budget", () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(2500)
  })

  it("uses measured reference heading sizes, weights, paragraph and list spacing", () => {
    for (const [level, size] of [[1, 30], [2, 22], [3, 18], [4, 16], [5, 16], [6, 16]]) {
      expect(css).toContain(`var(--m-typography-h${level}-size, ${size}px)`)
    }
    expect(css).toContain("var(--m-typography-heading-weight, 500)")
    expect(css).toContain("var(--m-typography-strong-weight, 500)")
    expect(css).toContain("var(--m-typography-paragraph-margin, 16px)")
    expect(css).toContain("var(--m-typography-list-indent, 2em)")
    expect(css).toContain("margin-block: .25em 0")
    expect(css).toContain("var(--m-typography-font-size, var(--m-font-size, 14px))")
  })

  it("sets only private defaults at light/dark theme boundaries and retains public override precedence", () => {
    install()
    const rules = [...stylesheet!.sheet!.cssRules] as CSSStyleRule[]
    for (const theme of ["light", "dark"]) {
      const rule = rules.find(rule => rule.selectorText === `:where([data-m-theme="${theme}"])`)!
      expect(rule).toBeDefined()
      for (let i = 0; i < rule.style.length; i++) expect(rule.style[i]).toMatch(/^--_m-typography-/)
    }
    expect(css).toContain("var(--m-typography-color, var(--_m-typography-color, #333639))")
    expect(css).toContain("var(--m-typography-info, var(--m-color-info, var(--_m-typography-info, #2080f0)))")
    expect(css).toContain("--_m-typography-color: rgb(255 255 255 / .82)")
    expect(css).toContain("--_m-typography-heading: rgb(255 255 255 / .9)")
    expect(css).toContain("--_m-typography-muted: rgb(255 255 255 / .52)")
    expect(css).not.toContain("--m-text-primary")
    expect(css).not.toContain("-suppl")
  })

  it("colors a typed heading's bar, not its text, and preserves the explicit bar override", () => {
    install()
    const rules = [...stylesheet!.sheet!.cssRules] as CSSStyleRule[]
    const types = rules.filter(rule => rule.selectorText?.includes('.m-h)[data-type='))
    expect(types).toHaveLength(4)
    for (const rule of types) {
      expect(rule.style.getPropertyValue("color")).toBe("")
      expect(rule.style.getPropertyValue("--_m-typography-accent")).not.toBe("")
    }
    expect(css).toContain("background: var(--m-typography-bar-color, var(--_m-typography-accent,")
    expect(css).toContain("--_m-typography-prefix: 16px; --_m-typography-bar: 4px")
    expect(css).toContain("inset-block: 0")
  })

  it("matches inline-code metrics without revealing hidden code or changing block code", () => {
    document.body.innerHTML = '<article class="m-typography"><code id="hidden" hidden>Hidden</code><code id="inline">Visible</code><pre><code id="block">Block</code></pre></article>'
    install()
    expect(getComputedStyle(document.querySelector("#hidden")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#inline")!).display).toBe("inline-block")
    expect(css).toContain(':where(code:not([hidden])):not(:where(pre code))')
    expect(css).toContain("v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace")
    expect(css).toContain("line-height: 1.4")
    expect(css).toContain("padding: .05em .35em 0")
    expect(css).toContain("var(--m-typography-code-border, transparent)")
    expect(css).toContain("var(--m-typography-code-radius, 2px)")
  })

  it("keeps first/last block spacing rules scoped, last in the cascade and overridable", () => {
    install()
    const rules = [...stylesheet!.sheet!.cssRules] as CSSStyleRule[]
    expect(rules.at(-2)!.selectorText).toContain(":where(:first-child)")
    expect(rules.at(-1)!.selectorText).toContain(":where(:last-child)")
    expect(rules.at(-2)!.style.getPropertyValue("margin-block-start")).toBe("0")
    expect(rules.at(-1)!.style.getPropertyValue("margin-block-end")).toBe("0")
    document.body.innerHTML = '<article class="m-typography"><h1 style="font-size:41px;color:purple;margin-block-start:11px">Title</h1></article>'
    expect(getComputedStyle(document.querySelector("h1")!).fontSize).toBe("41px")
    expect(getComputedStyle(document.querySelector("h1")!).color).toBe("rgb(128, 0, 128)")
  })
})
