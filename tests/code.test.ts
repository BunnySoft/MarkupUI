import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Code, MCode, registerCode } from "../src/components/code/index.js"
import * as codeApi from "../src/components/code/index.js"
import { ViewElement } from "../src/core/index.js"
import { generateComponentApi } from "../scripts/component-api.mjs"

const css = readFileSync(resolve("src", "components", "code", "code.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "code.html"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
const numberedSource = '\tconst message = "<b>literal</b>";\r\nconsole.log(message); // 😀\r\n\r\nreturn message;\r\n'
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

describe("CSS-only native plain Code", () => {
  it("ships no language engine or clipboard action", () => {
    expect(pkg.exports["./code/style.css"]).toBe("./dist/markup-ui-code.css")
    expect(pkg.dependencies).toEqual({})
    expect(demo).not.toContain("navigator.clipboard")
    expect(css).not.toContain("@import")
    expect(css).not.toContain("hljs")
  })

  it("uses native pre/code and inline code without changing headings or roles", () => {
    fixture()
    install()
    expect(document.querySelector("#plain-block")!.tagName).toBe("PRE")
    expect(document.querySelector("#plain-code")!.tagName).toBe("CODE")
    expect(document.querySelector("#plain-code")!.parentElement?.id).toBe("plain-block")
    expect(document.querySelector("#inline-code")!.closest("pre")).toBeNull()
    expect(document.querySelector("#plain-block")!.getAttribute("aria-labelledby")).toBe("plain-heading")
    expect(document.querySelectorAll(".m-code[role], .m-code[aria-live]")).toHaveLength(0)
  })

  it("preserves literal HTML, whitespace, tabs, leading and trailing newlines", () => {
    fixture()
    install()
    const plain = document.querySelector("#plain-code")!
    expect(plain.textContent?.startsWith("\n\t<script>")).toBe(true)
    expect(plain.textContent?.endsWith("\n\n")).toBe(true)
    expect(plain.querySelector("script")).toBeNull()
    expect(document.querySelector("#inline-code")!.textContent).toBe("a  < b\t&&  x")
    expect(document.querySelector("#numbered-code")!.textContent).toBe(numberedSource)
  })

  it("keeps five physical lines including the final empty line without number text nodes", () => {
    fixture()
    install()
    const code = document.querySelector("#numbered-code")!
    const lines = [...code.querySelectorAll(".m-code-line")]
    expect(lines).toHaveLength(5)
    expect(lines.at(-1)?.textContent).toBe("")
    for (const number of code.querySelectorAll(".m-code-number")) {
      expect(number.textContent).toBe("")
      expect(number.getAttribute("aria-hidden")).toBe("true")
    }
    expect(css).toContain("counter-increment: m-code-line")
    expect(css).toContain("content: counter(m-code-line)")
    expect(css).not.toContain("user-select: none;")
    expect(css).toContain("min-block-size: calc(var(--m-code-line-height, 1.6) * 1em)")
    expect(css).toContain("min-block-size: 1lh")
  })

  it("retains exact selected source across physical-line wrappers", () => {
    fixture()
    install()
    const range = document.createRange()
    range.selectNodeContents(document.querySelector("#numbered-code")!)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    expect(selection.toString()).toBe(numberedSource)
    expect(range.toString()).toBe(numberedSource)
    selection.removeAllRanges()
  })

  it("enables numbering only on unwrapped block code, not inline or soft-wrapped content", () => {
    fixture()
    install()
    const selector = 'pre.m-code-block[data-line-numbers]:not([data-word-wrap]) > code.m-code > .m-code-line > .m-code-number'
    expect(document.querySelector("#numbered-code .m-code-number")!.matches(selector)).toBe(true)
    expect(document.querySelector("#wrapped-code .m-code-number")!.matches(selector)).toBe(false)
    expect(getComputedStyle(document.querySelector("#wrapped-code .m-code-number")!).display).toBe("none")
    expect(document.querySelectorAll("#wrapped-code > .m-code-line")).toHaveLength(3)
    expect(css).toContain(selector)
  })

  it("preserves application-authored token spans without claiming language parsing", () => {
    fixture()
    const code = document.querySelector("#token-code")!
    const nodes = [...code.childNodes]
    install()
    expect([...code.childNodes]).toEqual(nodes)
    expect(code.querySelectorAll(".m-code-token")).toHaveLength(4)
    expect(code.querySelector("img")).toBeNull()
    expect(code.textContent).toContain('"<img src=x onerror=example>"')
    expect(document.querySelector("#token-block")!.getAttribute("data-language")).toBe("javascript")
    expect(css).not.toContain("[data-language")
  })

  it("leaves native textContent assignment to the author without decoding or trimming", () => {
    fixture()
    install()
    const code = document.querySelector("#plain-code")!
    const source = " \r\n\t%3Cscript%3E <b>😀</b>\r\n "
    code.textContent = source
    expect(code.textContent).toBe(source)
    expect(code.querySelector("b, script")).toBeNull()
    expect(code.childNodes).toHaveLength(1)
  })

  it("preserves authored nodes/listeners on removal and reattachment", () => {
    fixture()
    const block = document.querySelector("#numbered-block")!
    const before = block.innerHTML
    const nodes = [...block.querySelectorAll("*")]
    const link = document.querySelector<HTMLElement>("#native-link")!
    let clicks = 0
    link.addEventListener("click", event => { event.preventDefault(); clicks++ })
    install()
    block.remove()
    document.body.append(block)
    link.click()
    expect(clicks).toBe(1)
    expect(block.innerHTML).toBe(before)
    expect([...block.querySelectorAll("*")]).toEqual(nodes)
  })

  it("uses native font/tab/line-height customization without a numeric attribute parser", () => {
    fixture()
    install()
    const block = document.querySelector<HTMLElement>("#plain-block")!
    block.style.setProperty("--m-code-font-size", "15px")
    block.style.setProperty("--m-code-tab-size", "2")
    expect(getComputedStyle(block).getPropertyValue("--m-code-font-size")).toBe("15px")
    expect(getComputedStyle(block).getPropertyValue("--m-code-tab-size")).toBe("2")
    expect(css).toContain("--m-typography-mono-font")
    expect(css).toContain("--m-font-size")
    expect(css).toContain("v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace")
    expect(css).not.toContain("[data-size")
  })

  it("removes default chip/panel borders and sizes gutters from authored physical lines", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#plain-block")!).borderTopWidth).toBe("0px")
    expect(getComputedStyle(document.querySelector("#inline-code")!).padding).toBe("0px")
    expect(css).toContain("--_m-code-gutter: 1ch")
    expect(css).toContain("@supports selector(:has(> .m-code-line:nth-child(10 of .m-code-line)))")
    for (const [threshold, width] of [[10, 2], [100, 3], [1000, 4]]) {
      expect(css).toContain(`nth-child(${threshold} of .m-code-line)) { --_m-code-gutter: ${width}ch; }`)
    }
    expect(css).toContain("var(--_m-code-gutter)) + 12px")
    expect(css).toContain("word-break: break-all")
  })

  it("themes only authored tokens and decorative numbers while plain code inherits text color", () => {
    fixture()
    install()
    const block = document.querySelector<HTMLElement>("#token-block")!
    block.dataset.mTheme = "dark"
    const theme = getComputedStyle(block)
    for (const [name, value] of [["keyword", "#c678dd"], ["string", "#98c379"], ["number-token", "#d19a66"], ["comment", "#5c6370"]]) {
      expect(theme.getPropertyValue(`--_m-code-${name}`)).toBe(value)
    }
    expect(theme.getPropertyValue("--_m-code-number")).toBe("rgba(255,255,255,.52)")
    expect(css).toContain("color: var(--m-code-color, inherit)")
    expect(css).not.toContain("color-scheme")
  })

  it("keeps hidden blocks/templates inert and does not reset ordinary pre elements", () => {
    fixture()
    const outside = document.querySelector("#outside-pre")!
    const before = getComputedStyle(outside).padding
    install()
    expect(getComputedStyle(outside).padding).toBe(before)
    expect(getComputedStyle(document.querySelector("#hidden-code")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#native-template")!).display).toBe("none")
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert code template")
  })

  it("provides native scrolling/focus, explicit direction and readable print/forced-color paths", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#plain-block")!).overflow).toBe("auto")
    expect(document.querySelector("#plain-block")!.getAttribute("tabindex")).toBe("0")
    expect(document.querySelector("#ltr-in-rtl")!.getAttribute("dir")).toBe("ltr")
    expect(document.querySelector("#rtl-block")!.getAttribute("dir")).toBe("rtl")
    expect(css).toContain("inset-inline-start")
    expect(css).toContain("@media print")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain(":focus-visible")
    expect(css).not.toContain("row-reverse")
  })
})

describe("canonical Code ViewElement", () => {
  it("exports canonical ViewElement classes and registration", () => {
    expect(codeApi.Code).toBe(Code)
    expect(codeApi.MCode).toBe(MCode)
    expect(Code.tag).toBe("m-code")
    expect(ViewElement.prototype.isPrototypeOf(Code.prototype)).toBe(true)
    expect(customElements.get("m-code")).toBe(Code)
    expect(Code.observedAttributes).toEqual(["language", "word-wrap", "show-line-numbers"])
    expect(() => registerCode()).not.toThrow()
    const define = vi.fn()
    expect(() => registerCode({ get: () => class extends HTMLElement {}, define })).toThrow("different implementation")
    expect(define).not.toHaveBeenCalled()
  })

  it("handles typed properties and defaults on Code", () => {
    const element = document.createElement("m-code") as Code
    document.body.append(element)
    expect(element.language).toBeNull()
    expect(element.wordWrap).toBe(false)
    expect(element.showLineNumbers).toBe(false)
    expect(element.classList.contains("m-code")).toBe(true)
    expect(element.dataset.mCode).toBe("")

    element.language = "typescript"
    expect(element.language).toBe("typescript")
    expect(element.getAttribute("language")).toBe("typescript")
    expect(element.getAttribute("data-language")).toBe("typescript")

    element.language = null
    expect(element.language).toBeNull()
    expect(element.hasAttribute("language")).toBe(false)
    expect(element.hasAttribute("data-language")).toBe(false)

    element.wordWrap = true
    expect(element.wordWrap).toBe(true)
    expect(element.hasAttribute("word-wrap")).toBe(true)
    expect(element.hasAttribute("data-word-wrap")).toBe(true)

    element.wordWrap = false
    expect(element.wordWrap).toBe(false)
    expect(element.hasAttribute("word-wrap")).toBe(false)
    expect(element.hasAttribute("data-word-wrap")).toBe(false)

    element.showLineNumbers = true
    expect(element.showLineNumbers).toBe(true)
    expect(element.hasAttribute("show-line-numbers")).toBe(true)
    expect(element.hasAttribute("data-line-numbers")).toBe(true)

    element.showLineNumbers = false
    expect(element.showLineNumbers).toBe(false)
    expect(element.hasAttribute("show-line-numbers")).toBe(false)
    expect(element.hasAttribute("data-line-numbers")).toBe(false)
  })

  it("synchronizes attributes to properties and data attributes", () => {
    const element = document.createElement("m-code") as Code
    document.body.append(element)

    element.setAttribute("language", "python")
    expect(element.language).toBe("python")
    expect(element.getAttribute("data-language")).toBe("python")

    element.removeAttribute("language")
    expect(element.language).toBeNull()
    expect(element.hasAttribute("data-language")).toBe(false)

    element.setAttribute("word-wrap", "")
    expect(element.wordWrap).toBe(true)
    expect(element.hasAttribute("data-word-wrap")).toBe(true)

    element.setAttribute("word-wrap", "true")
    expect(element.wordWrap).toBe(true)

    element.setAttribute("word-wrap", "false")
    expect(element.wordWrap).toBe(false)
    expect(element.hasAttribute("data-word-wrap")).toBe(false)

    element.setAttribute("show-line-numbers", "")
    expect(element.showLineNumbers).toBe(true)
    expect(element.hasAttribute("data-line-numbers")).toBe(true)

    element.setAttribute("show-line-numbers", "true")
    expect(element.showLineNumbers).toBe(true)

    element.setAttribute("show-line-numbers", "false")
    expect(element.showLineNumbers).toBe(false)
    expect(element.hasAttribute("data-line-numbers")).toBe(false)
  })

  it("validates invalid property assignments and attributes", () => {
    const element = document.createElement("m-code") as Code
    document.body.append(element)

    expect(() => { element.language = 123 as never }).toThrow(RangeError)
    expect(() => { element.wordWrap = "true" as never }).toThrow(RangeError)
    expect(() => { element.showLineNumbers = "yes" as never }).toThrow(RangeError)

    element.setAttribute("word-wrap", "invalid")
    expect(() => element.wordWrap).toThrow(RangeError)

    element.setAttribute("show-line-numbers", "invalid")
    expect(() => element.showLineNumbers).toThrow(RangeError)
  })

  it("synchronizes attributes with nested pre element", () => {
    const container = document.createElement("m-code") as Code
    const pre = document.createElement("pre")
    pre.className = "m-code-block"
    const code = document.createElement("code")
    code.className = "m-code"
    pre.append(code)
    container.append(pre)
    document.body.append(container)

    container.wordWrap = true
    container.showLineNumbers = true
    container.language = "javascript"

    expect(pre.hasAttribute("data-word-wrap")).toBe(true)
    expect(pre.hasAttribute("data-line-numbers")).toBe(true)
    expect(pre.getAttribute("data-language")).toBe("javascript")

    container.wordWrap = false
    container.showLineNumbers = false
    container.language = null

    expect(pre.hasAttribute("data-word-wrap")).toBe(false)
    expect(pre.hasAttribute("data-line-numbers")).toBe(false)
    expect(pre.hasAttribute("data-language")).toBe(false)
  })

  it("replays pre-upgrade properties upon connection", () => {
    const element = document.createElement("m-code") as Code
    Object.defineProperty(element, "language", { configurable: true, value: "rust" })
    Object.defineProperty(element, "wordWrap", { configurable: true, value: true })
    Object.defineProperty(element, "showLineNumbers", { configurable: true, value: true })
    document.body.append(element)

    expect(element.language).toBe("rust")
    expect(element.wordWrap).toBe(true)
    expect(element.showLineNumbers).toBe(true)
    expect(element.getAttribute("language")).toBe("rust")
    expect(element.hasAttribute("word-wrap")).toBe(true)
    expect(element.hasAttribute("show-line-numbers")).toBe(true)
    expect(element.hasAttribute("data-word-wrap")).toBe(true)
    expect(element.hasAttribute("data-line-numbers")).toBe(true)
  })

  it("exposes MarkupUICode on globalThis", async () => {
    await import("../src/components/code/global.js")
    const globalApi = (globalThis as any).MarkupUICode
    expect(globalApi).toBeDefined()
    expect(globalApi.Code).toBe(Code)
    expect(globalApi.registerCode).toBe(registerCode)
  })

  it("extracts Code API metadata matching specification via generateComponentApi", async () => {
    const [docs] = await generateComponentApi(resolve("."), ["code"])
    expect(docs.elements).toHaveLength(1)
    const [codeDoc] = docs.elements
    expect(codeDoc.type).toBe("Code")
    expect(codeDoc.web.primary).toBe("m-code")
    expect(codeDoc.properties.language).toMatchObject({
      name: "language",
      type: "string",
      typeName: "string | null",
      attribute: "language",
      default: null,
      nullable: true,
      writable: true,
    })
    expect(codeDoc.properties.wordWrap).toMatchObject({
      name: "wordWrap",
      type: "boolean",
      typeName: "boolean",
      attribute: "word-wrap",
      encoding: "boolean",
      default: false,
      nullable: false,
      writable: true,
    })
    expect(codeDoc.properties.showLineNumbers).toMatchObject({
      name: "showLineNumbers",
      type: "boolean",
      typeName: "boolean",
      attribute: "show-line-numbers",
      encoding: "boolean",
      default: false,
      nullable: false,
      writable: true,
    })
    expect(codeDoc.regions).toEqual([
      { name: "content", accepts: ["flow content"], min: 0, max: null },
    ])
    expect(codeDoc.events).toEqual([])
  }, 15000)

  it("structures Code demo with standard scaffold and explicit shared-core loading", () => {
    const demoHtml = readFileSync(resolve("demo", "components", "code.html"), "utf8")
    const parsed = new DOMParser().parseFromString(demoHtml, "text/html")
    const scripts = [...parsed.querySelectorAll("script[src]")].map(script => script.getAttribute("src"))
    expect(scripts.indexOf("../../dist/markup-ui-core.global.js")).toBeLessThan(scripts.indexOf("../../dist/markup-ui-code.global.js"))
    expect(parsed.querySelector("main[data-demo-page].component-docs #code-api")).not.toBeNull()
    expect(parsed.querySelector('script[src="../component-outline.js"]')).not.toBeNull()
    expect(parsed.querySelector('link[href="../example-code.css"]')).not.toBeNull()
    expect(parsed.querySelector('link[href="../component-api.css"]')).not.toBeNull()
    expect(parsed.querySelector("details.component-setup")).not.toBeNull()
    for (const example of parsed.querySelectorAll("[data-demo-example]")) {
      expect(example.querySelector("[data-demo-header] h2[id]")).not.toBeNull()
      expect(example.querySelector("[data-demo-preview]")).not.toBeNull()
    }
  })

  it("renders API documentation in demo element", async () => {
    const { renderComponentApi } = await import("../demo/component-api.js")
    const docs = JSON.parse(readFileSync(resolve("demo", "api", "code.json"), "utf8"))
    const container = document.createElement("div")
    renderComponentApi(container, docs.elements)
    expect(container.textContent).toContain("Code")
    expect(container.textContent).toContain("m-code")
    expect(container.textContent).toContain("language")
    expect(container.textContent).toContain("word-wrap")
    expect(container.textContent).toContain("show-line-numbers")
  })
})
